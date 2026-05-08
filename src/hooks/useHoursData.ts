import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useServiceYear } from '../context/ServiceYearContext';
import { YEARLY_QUOTA } from '../constants/serviceYear';
import { offlineStore } from '../lib/offline';

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
        const cacheKey = `hours_${user.id}_${monthStr}`;

        setLoading(true);

        // Load from cache first for instant UI
        const cached = await offlineStore.getItem<any>(cacheKey);
        if (cached) {
            setReports(cached.reports || []);
            setIsReported(cached.isReported || false);
            setMonthlyStudies(cached.monthlyStudies || 0);
            setPlannedSchedule(cached.plannedSchedule || {});
            setDailySchedules(cached.dailySchedules || []);
            setDynamicGoal(cached.dynamicGoal || 50);
        }

        try {
            const [reportsRes, statusRes, scheduleRes, dailyRes] = await Promise.all([
                supabase.from('reports').select('*').eq('user_id', user.id).gte('date', format(monthStart, 'yyyy-MM-dd')).lte('date', format(monthEnd, 'yyyy-MM-dd')),
                supabase.from('monthly_submissions').select('is_reported, bible_studies').eq('user_id', user.id).eq('month', monthStr).maybeSingle(),
                supabase.from('monthly_schedules').select('schedule').eq('user_id', user.id).eq('month', monthStr).maybeSingle(),
                supabase.from('daily_schedules').select('*').eq('user_id', user.id).gte('date', format(monthStart, 'yyyy-MM-dd')).lte('date', format(monthEnd, 'yyyy-MM-dd'))
            ]);

            const newReports = reportsRes.data || [];
            const newIsReported = statusRes.data?.is_reported || false;
            const newMonthlyStudies = statusRes.data?.bible_studies || 0;
            const newPlannedSchedule = scheduleRes.data?.schedule || {};
            const newDailySchedules = dailyRes.data || [];

            setReports(newReports);
            setIsReported(newIsReported);
            setMonthlyStudies(newMonthlyStudies);
            setPlannedSchedule(newPlannedSchedule);
            setDailySchedules(newDailySchedules);

            // Fetch Dynamic Goal
            const syMonths = ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'];
            const monthIdx = syMonths.indexOf(format(currentDate, 'MMMM'));
            let newDynamicGoal = 50;
            if (monthIdx !== -1) {
                const { data: previousReports } = await supabase
                    .from('reports')
                    .select('hours')
                    .eq('user_id', user.id)
                    .gte('date', format(serviceYearStartDate, 'yyyy-MM-dd'))
                    .lt('date', monthStr);
                const accumulatedHours = (previousReports || []).reduce((acc, r) => acc + r.hours, 0);
                const goal = (YEARLY_QUOTA - accumulatedHours) / (12 - monthIdx);
                newDynamicGoal = Number(goal.toFixed(1));
                setDynamicGoal(newDynamicGoal);
            }

            // Update Cache
            await offlineStore.setItem(cacheKey, {
                reports: newReports,
                isReported: newIsReported,
                monthlyStudies: newMonthlyStudies,
                plannedSchedule: newPlannedSchedule,
                dailySchedules: newDailySchedules,
                dynamicGoal: newDynamicGoal
            });
        } catch (err) {
            console.warn('[Offline] Failed to fetch fresh data, using cache.');
        } finally {
            setLoading(false);
        }
    }, [user, currentDate, serviceYearStartDate]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const saveReport = async (date: Date, hours: number, credit: number) => {
        if (!user) return;
        const dateStr = format(date, 'yyyy-MM-dd');
        const existing = reports.find(r => r.date === dateStr);
        
        // Optimistic UI Update
        const optimisticReports = [...reports];
        if (existing) {
            const idx = optimisticReports.findIndex(r => r.id === existing.id);
            optimisticReports[idx] = { ...existing, hours, credit };
        } else {
            optimisticReports.push({ id: `temp-${Date.now()}`, user_id: user.id, hours, date: dateStr, credit });
        }
        setReports(optimisticReports);

        let res;
        try {
            if (existing) {
                res = await supabase.from('reports').update({ hours, credit }).eq('id', existing.id).eq('user_id', user.id);
            } else {
                res = await supabase.from('reports').insert({ user_id: user.id, hours, date: dateStr, credit }).select().single();
            }

            if (res.error) throw res.error;
            await fetchAllData();
        } catch (err) {
            console.log('[Offline] Saving to outbox...');
            await offlineStore.addToOutbox({
                table: 'reports',
                action: existing ? 'UPDATE' : 'INSERT',
                payload: { user_id: user.id, hours, date: dateStr, credit, ...(existing ? { id: existing.id } : {}) }
            });
            return { error: null, offline: true };
        }
        return res;
    };

    const deleteReport = async (date: Date) => {
        if (!user) return { error: new Error('User not authenticated') };
        const dateStr = format(date, 'yyyy-MM-dd');
        const existing = reports.find(r => r.date === dateStr);
        if (!existing) return;

        // Optimistic UI
        setReports(reports.filter(r => r.id !== existing.id));

        try {
            const { error } = await supabase.from('reports').delete().eq('id', existing.id).eq('user_id', user.id);
            if (error) throw error;
            await fetchAllData();
        } catch (err) {
            await offlineStore.addToOutbox({
                table: 'reports',
                action: 'DELETE',
                payload: { id: existing.id }
            });
        }
        return { error: null };
    };

    const toggleReported = async () => {
        if (!user) return;
        setStatusLoading(true);
        const monthStr = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        const newStatus = !isReported;
        
        setIsReported(newStatus); // Optimistic

        try {
            const { error } = await supabase.from('monthly_submissions').upsert({
                user_id: user.id,
                month: monthStr,
                is_reported: newStatus,
                bible_studies: monthlyStudies
            }, { onConflict: 'user_id,month' });
            if (error) throw error;
        } catch (err) {
            await offlineStore.addToOutbox({
                table: 'monthly_submissions',
                action: 'UPDATE',
                payload: { user_id: user.id, month: monthStr, is_reported: newStatus, bible_studies: monthlyStudies }
            });
        } finally {
            setStatusLoading(false);
        }
    };

    const saveStudies = async (studies: number) => {
        if (!user) return;
        setStatusLoading(true);
        const monthStr = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        
        setMonthlyStudies(studies); // Optimistic

        try {
            const { error } = await supabase.from('monthly_submissions').upsert({
                user_id: user.id,
                month: monthStr,
                bible_studies: studies,
                is_reported: isReported
            }, { onConflict: 'user_id,month' });
            if (error) throw error;
        } catch (err) {
            await offlineStore.addToOutbox({
                table: 'monthly_submissions',
                action: 'UPDATE',
                payload: { user_id: user.id, month: monthStr, bible_studies: studies, is_reported: isReported }
            });
        } finally {
            setStatusLoading(false);
        }
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
