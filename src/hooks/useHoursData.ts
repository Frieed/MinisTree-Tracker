import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useServiceYear } from '../context/ServiceYearContext';
import { YEARLY_QUOTA } from '../constants/serviceYear';

export const useHoursData = (initialDate: Date) => {
    const { user } = useAuth();
    const { startDate: serviceYearStartDate } = useServiceYear();
    
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [reports, setReports] = useState<any[]>([]);
    const [isReported, setIsReported] = useState(false);
    const [monthlyStudies, setMonthlyStudies] = useState(0);
    const [dynamicGoal, setDynamicGoal] = useState(50);
    const [plannedSchedule, setPlannedSchedule] = useState<Record<number, number>>({});
    const [dailySchedules, setDailySchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);

    const fetchAllData = useCallback(async () => {
        if (!user) return;
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const monthStr = format(monthStart, 'yyyy-MM-dd');

        setLoading(true);
        const [reportsRes, statusRes, scheduleRes, dailyRes] = await Promise.all([
            supabase.from('reports').select('*').eq('user_id', user.id).gte('date', format(monthStart, 'yyyy-MM-dd')).lte('date', format(monthEnd, 'yyyy-MM-dd')),
            supabase.from('monthly_submissions').select('is_reported, bible_studies').eq('user_id', user.id).eq('month', monthStr).maybeSingle(),
            supabase.from('monthly_schedules').select('schedule').eq('user_id', user.id).eq('month', monthStr).maybeSingle(),
            supabase.from('daily_schedules').select('*').eq('user_id', user.id).gte('date', format(monthStart, 'yyyy-MM-dd')).lte('date', format(monthEnd, 'yyyy-MM-dd'))
        ]);

        if (reportsRes.data) setReports(reportsRes.data);
        if (statusRes.data) {
            setIsReported(statusRes.data.is_reported);
            setMonthlyStudies(statusRes.data.bible_studies || 0);
        } else {
            setIsReported(false);
            setMonthlyStudies(0);
        }
        if (scheduleRes.data) setPlannedSchedule(scheduleRes.data.schedule);
        else setPlannedSchedule({});
        if (dailyRes.data) setDailySchedules(dailyRes.data);

        // Fetch Dynamic Goal
        const syMonths = ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'];
        const monthIdx = syMonths.indexOf(format(currentDate, 'MMMM'));
        if (monthIdx !== -1) {
            const { data: previousReports } = await supabase
                .from('reports')
                .select('hours')
                .eq('user_id', user.id)
                .gte('date', format(serviceYearStartDate, 'yyyy-MM-dd'))
                .lt('date', monthStr);
            const accumulatedHours = (previousReports || []).reduce((acc, r) => acc + r.hours, 0);
            const goal = (YEARLY_QUOTA - accumulatedHours) / (12 - monthIdx);
            setDynamicGoal(Number(goal.toFixed(1)));
        }
        setLoading(false);
    }, [user, currentDate, serviceYearStartDate]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const saveReport = async (date: Date, hours: number, credit: number) => {
        if (!user) return;
        const dateStr = format(date, 'yyyy-MM-dd');
        const existing = reports.find(r => r.date === dateStr);
        let res;
        if (existing) {
            res = await supabase.from('reports').update({ hours, credit }).eq('id', existing.id).eq('user_id', user.id);
        } else {
            res = await supabase.from('reports').insert({ user_id: user.id, hours, date: dateStr, credit });
        }
        if (!res.error) await fetchAllData();
        return res;
    };

    const deleteReport = async (date: Date) => {
        if (!user) return { error: new Error('User not authenticated') };
        const dateStr = format(date, 'yyyy-MM-dd');
        const existing = reports.find(r => r.date === dateStr);
        if (!existing) return;
        const { error } = await supabase.from('reports').delete().eq('id', existing.id).eq('user_id', user.id);
        if (!error) await fetchAllData();
        return { error };
    };

    const toggleReported = async () => {
        if (!user) return;
        setStatusLoading(true);
        const monthStr = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        const { error } = await supabase.from('monthly_submissions').upsert({
            user_id: user.id,
            month: monthStr,
            is_reported: !isReported,
            bible_studies: monthlyStudies
        }, { onConflict: 'user_id,month' });
        if (!error) setIsReported(!isReported);
        setStatusLoading(false);
    };

    const saveStudies = async (studies: number) => {
        if (!user) return;
        setStatusLoading(true);
        const monthStr = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        await supabase.from('monthly_submissions').upsert({
            user_id: user.id,
            month: monthStr,
            bible_studies: studies,
            is_reported: isReported
        }, { onConflict: 'user_id,month' });
        setMonthlyStudies(studies);
        setStatusLoading(false);
    };

    return {
        currentDate,
        setCurrentDate,
        reports,
        isReported,
        monthlyStudies,
        dynamicGoal,
        plannedSchedule,
        dailySchedules,
        loading,
        statusLoading,
        saveReport,
        deleteReport,
        toggleReported,
        saveStudies
    };
};
