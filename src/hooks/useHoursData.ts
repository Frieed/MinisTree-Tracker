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
    const [plannedSchedule, setPlannedSchedule] = useState<Record<string | number, number>>({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    const [dailySchedules, setDailySchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);

    const fetchAllData = useCallback(async () => {
        if (!user) return;
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const year = monthStart.getFullYear() > 2100 ? monthStart.getFullYear() - 543 : monthStart.getFullYear();
        const monthStr = `${year}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-01`;
        const cacheKey = `hours_${user.id}_${monthStr}`;

        setLoading(true);

        // Load from cache first for instant UI
        const cached = await offlineStore.getItem<{
            reports: any[];
            isReported: boolean;
            monthlyStudies: number;
            plannedSchedule: Record<string | number, number>;
            dailySchedules: any[];
            dynamicGoal: number;
        }>(cacheKey);
        if (cached) {
            setReports(cached.reports || []);
            setIsReported(cached.isReported || false);
            setMonthlyStudies(cached.monthlyStudies || 0);
            
            // AGGRESSIVE CACHE VALIDATION:
            // If the cache exists but Sunday (0) is missing, we treat the whole schedule as stale.
            const hasSunday = cached.plannedSchedule && (cached.plannedSchedule[0] !== undefined || cached.plannedSchedule["0"] !== undefined);
            const schedule = hasSunday ? cached.plannedSchedule : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
            
            setPlannedSchedule(schedule);
            setDailySchedules(cached.dailySchedules || []);
            setDynamicGoal(cached.dynamicGoal || 50);

            // If Sunday was missing, we immediately trigger a fresh fetch even if we have other cached data
            if (!hasSunday) {
                console.log('[Cache] Sunday missing, forcing refresh...');
            }
        }

        try {
            const sYear = monthStart.getFullYear() > 2100 ? monthStart.getFullYear() - 543 : monthStart.getFullYear();
            const eYear = monthEnd.getFullYear() > 2100 ? monthEnd.getFullYear() - 543 : monthEnd.getFullYear();
            const [reportsRes, statusRes, scheduleRes, dailyRes] = await Promise.all([
                supabase.from('reports').select('*').eq('user_id', user.id).gte('date', `${sYear}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-01`).lte('date', `${eYear}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`),
                supabase.from('monthly_submissions').select('is_reported, bible_studies').eq('user_id', user.id).eq('month', monthStr).maybeSingle(),
                supabase.from('monthly_schedules').select('schedule').eq('user_id', user.id).eq('month', monthStr).maybeSingle(),
                supabase.from('daily_schedules').select('*').eq('user_id', user.id).gte('date', `${sYear}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-01`).lte('date', `${eYear}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`)
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
        const year = date.getFullYear() > 2100 ? date.getFullYear() - 543 : date.getFullYear();
        const dateStr = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
        } catch (err: any) {
            console.log('[Offline] Saving to outbox...');
            await offlineStore.addToOutbox({
                table: 'reports',
                action: existing ? 'UPDATE' : 'INSERT',
                payload: { user_id: user.id, hours, date: dateStr, credit, ...(existing ? { id: existing.id } : {}) }
            });
            return { error: null, offline: true };
        }
        return { error: (res as any).error, data: (res as any).data };
    };

    const deleteReport = async (date: Date) => {
        if (!user) return { error: new Error('User not authenticated') };
        const year = date.getFullYear() > 2100 ? date.getFullYear() - 543 : date.getFullYear();
        const dateStr = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
        const monthStart = startOfMonth(currentDate);
        const year = monthStart.getFullYear() > 2100 ? monthStart.getFullYear() - 543 : monthStart.getFullYear();
        const monthStr = `${year}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-01`;
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
        const monthStart = startOfMonth(currentDate);
        const year = monthStart.getFullYear() > 2100 ? monthStart.getFullYear() - 543 : monthStart.getFullYear();
        const monthStr = `${year}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-01`;
        
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

    const refreshData = async () => {
        setLoading(true);
        await fetchAllData();
        setLoading(false);
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
        saveStudies,
        refreshData
    };
};
