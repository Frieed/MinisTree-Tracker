import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useServiceYear } from '../context/ServiceYearContext';
import { SERVICE_YEAR_MONTHS, YEARLY_QUOTA } from '../constants/serviceYear';
import { offlineStore } from '../lib/offline';

export const useDashboardData = () => {
  const { user } = useAuth();
  const { startDate: serviceYearStartDate, endDate: serviceYearEndDate } = useServiceYear();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [monthlySchedules, setMonthlySchedules] = useState<any[]>([]);
  const [dailySchedules, setDailySchedules] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const cacheKey = `dashboard_${user.id}`;
      
      // Load from cache first
      const cached = await offlineStore.getItem<{
        reports: any[];
        submissions: any[];
        monthlySchedules: any[];
        dailySchedules: any[];
      }>(cacheKey);
      if (cached) {
        setReports(cached.reports || []);
        setSubmissions(cached.submissions || []);
        setMonthlySchedules(cached.monthlySchedules || []);
        setDailySchedules(cached.dailySchedules || []);
        setIsDataLoaded(true);
      }

      try {
        const [reportsRes, submissionsRes, monthlySchedulesRes, dailySchedulesRes] = await Promise.all([
          supabase
            .from('reports')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', format(serviceYearStartDate, 'yyyy-MM-dd'))
            .lte('date', format(serviceYearEndDate, 'yyyy-MM-dd'))
            .order('date', { ascending: true }),
          supabase
            .from('monthly_submissions')
            .select('*')
            .eq('user_id', user.id),
          supabase
            .from('monthly_schedules')
            .select('*')
            .eq('user_id', user.id)
            .gte('month', format(serviceYearStartDate, 'yyyy-MM-dd'))
            .lte('month', format(serviceYearEndDate, 'yyyy-MM-dd')),
          supabase
            .from('daily_schedules')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', format(serviceYearStartDate, 'yyyy-MM-dd'))
            .lte('date', format(serviceYearEndDate, 'yyyy-MM-dd'))
        ]);

        const newReports = reportsRes.data || [];
        const newSubmissions = submissionsRes.data || [];
        const newMonthly = monthlySchedulesRes.data || [];
        const newDaily = dailySchedulesRes.data || [];

        setReports(newReports);
        setSubmissions(newSubmissions);
        setMonthlySchedules(newMonthly);
        setDailySchedules(newDaily);
        setIsDataLoaded(true);

        // Update Cache
        await offlineStore.setItem(cacheKey, {
          reports: newReports,
          submissions: newSubmissions,
          monthlySchedules: newMonthly,
          dailySchedules: newDaily
        });
      } catch (err) {
        console.warn('[Offline] Dashboard using cached data');
      }
    };

    fetchData();
  }, [serviceYearStartDate, serviceYearEndDate, user]);

  const memoizedData = useMemo(() => {
    // Aggregations
    const reportsByMonth = reports.reduce((acc: any, report) => {
      const month = format(parseISO(report.date), 'MMMM');
      if (!acc[month]) acc[month] = { hours: 0, credit: 0 };
      acc[month].hours += report.hours;
      acc[month].credit += (report.credit || 0);
      return acc;
    }, {});

    submissions.forEach(sub => {
      const month = format(parseISO(sub.month), 'MMMM');
      if (!reportsByMonth[month]) {
        reportsByMonth[month] = { hours: 0, credit: 0 };
      }
      reportsByMonth[month].bible_studies = sub.bible_studies || 0;
    });

    const totalYearlyHours = reports.reduce((acc, r) => acc + r.hours, 0);
    const today = new Date();
    
    const isCurrentServiceYear = today >= serviceYearStartDate && today <= serviceYearEndDate;
    const actualMonthName = isCurrentServiceYear ? format(today, 'MMMM') : null;
    const reportedMonthsNames = submissions.filter(s => s.is_reported).map(s => format(parseISO(s.month), 'MMMM'));
    
    let currentMonthName = '';
    if (isCurrentServiceYear) {
        let activeMonthIdx = SERVICE_YEAR_MONTHS.indexOf(actualMonthName!);
        while (activeMonthIdx < 11 && reportedMonthsNames.includes(SERVICE_YEAR_MONTHS[activeMonthIdx])) {
          activeMonthIdx++;
        }
        currentMonthName = SERVICE_YEAR_MONTHS[activeMonthIdx];
    } else if (today > serviceYearEndDate) {
        currentMonthName = 'DONE'; 
    } else {
        currentMonthName = 'September';
    }
    
    const currentMonthHoursLogged = reportsByMonth[currentMonthName]?.hours || 0;
    const reportedSubmissions = submissions.filter(sub => sub.is_reported);
    const reportedMonthsCount = reportedSubmissions.length;
    const remainingMonths = 12 - reportedMonthsCount;

    const reportedMonthsHours = reportedSubmissions.reduce((acc, sub) => {
      const mName = format(parseISO(sub.month), 'MMMM');
      return acc + (reportsByMonth[mName]?.hours || 0);
    }, 0);

    const dynamicMonthlyGoal = Number(((YEARLY_QUOTA - reportedMonthsHours) / Math.max(1, remainingMonths)).toFixed(1));
    const progressPercentage = (totalYearlyHours / YEARLY_QUOTA) * 100;
    const totalRemaining = Number((YEARLY_QUOTA - totalYearlyHours).toFixed(1));

    const targetToDate = 50 * reportedMonthsCount;
    const hoursDifference = targetToDate - reportedMonthsHours;
    const elapsedMonths = Math.max(1, SERVICE_YEAR_MONTHS.indexOf(currentMonthName) + 1);
    const totalStudies = submissions.reduce((acc, sub) => acc + (sub.bible_studies || 0), 0);
    const avgHours = totalYearlyHours / elapsedMonths;
    const avgStudies = totalStudies / elapsedMonths;

    // Pre-calculate monthly summary details
    const monthlySummary = SERVICE_YEAR_MONTHS.map((m, idx) => {
      const data = reportsByMonth[m];
      const isNow = m === currentMonthName;
      const isFuture = (SERVICE_YEAR_MONTHS.indexOf(m) > SERVICE_YEAR_MONTHS.indexOf(currentMonthName));
      const isReported = submissions.some((sub: any) =>
        sub.is_reported &&
        format(parseISO(sub.month), 'MMMM') === m
      );

      let accumulatedHours = 0;
      for (let i = 0; i < idx; i++) {
        accumulatedHours += (reportsByMonth[SERVICE_YEAR_MONTHS[i]]?.hours || 0);
      }
      const goalRaw = (YEARLY_QUOTA - accumulatedHours) / (12 - idx);
      const monthGoal = isNaN(goalRaw) || !isFinite(goalRaw) ? 0 : Number(goalRaw.toFixed(1));
      const reachedGoal = (data?.hours || 0) >= monthGoal;

      // Calculate projected schedule
      const targetMonthDate = addMonths(serviceYearStartDate, idx);
      const targetYear = targetMonthDate.getFullYear() > 2100 ? targetMonthDate.getFullYear() - 543 : targetMonthDate.getFullYear();
      const targetMonthStr = `${targetYear}-${String(targetMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
      
      const baseSchedule = monthlySchedules.find(s => s.month === targetMonthStr)?.schedule || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
      
      const projectedSchedule = eachDayOfInterval({
        start: startOfMonth(targetMonthDate),
        end: endOfMonth(targetMonthDate)
      }).reduce((acc, day) => {
        const year = day.getFullYear() > 2100 ? day.getFullYear() - 543 : day.getFullYear();
        const dateStr = `${year}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
        const dayIdx = getDay(day);
        const specific = dailySchedules.find(s => s.date === dateStr);
        if (specific) return acc + (Number(specific.hours) || 0);
        // Robust lookup for mobile compatibility
        return acc + (baseSchedule[dayIdx] ?? baseSchedule[dayIdx.toString()] ?? 0);
      }, 0);

      return {
        month: m,
        data,
        isNow,
        isFuture,
        isReported,
        monthGoal,
        reachedGoal,
        projectedSchedule
      };
    });

    return {
      reportsByMonth,
      totalYearlyHours,
      currentMonthName,
      currentMonthHoursLogged,
      dynamicMonthlyGoal,
      progressPercentage,
      totalRemaining,
      hoursDifference,
      reportedMonthsCount,
      avgHours,
      avgStudies,
      monthlySummary,
      months: SERVICE_YEAR_MONTHS,
      yearlyQuota: YEARLY_QUOTA
    };

  }, [reports, submissions, monthlySchedules, dailySchedules, serviceYearStartDate, serviceYearEndDate]);

  return {
    isDataLoaded,
    ...memoizedData,
    submissions
  };
};

