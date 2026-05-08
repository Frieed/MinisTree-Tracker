import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useServiceYear } from '../context/ServiceYearContext';
import { YEARLY_QUOTA } from '../constants/serviceYear';
import { offlineStore } from '../lib/offline';

export const useScheduleData = (initialDate: Date) => {
    const { user } = useAuth();
    const { startDate: syStart, endDate: syEnd } = useServiceYear();
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [baseSchedule, setBaseSchedule] = useState<Record<string | number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 });
    const [dynamicMonthlyGoal, setDynamicMonthlyGoal] = useState<number>(50);
    const [allSchedules, setAllSchedules] = useState<any[]>([]);
    const [allDailySchedules, setAllDailySchedules] = useState<any[]>([]);
    const [specificSchedules, setSpecificSchedules] = useState<any[]>([]);

    const fetchAllData = useCallback(async () => {
        if (!user) return;
        const monthStart = startOfMonth(currentDate);
        const monthStr = format(monthStart, 'yyyy-MM-dd');
        const cacheKey = `schedule_${user.id}_${monthStr}`;

        // Load from cache
        const cached = await offlineStore.getItem<{
            baseSchedule: Record<string | number, number>;
            allSchedules: any[];
            allDailySchedules: any[];
            specificSchedules: any[];
            dynamicMonthlyGoal: number;
        }>(cacheKey);
        if (cached) {
            // AGGRESSIVE CACHE VALIDATION:
            // If Sunday (0) is missing in the cached routine, treat it as stale.
            const hasSunday = cached.baseSchedule && (cached.baseSchedule[0] !== undefined || cached.baseSchedule["0"] !== undefined);
            const schedule = hasSunday ? cached.baseSchedule : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
            
            setBaseSchedule(schedule);
            setAllSchedules(cached.allSchedules || []);
            setAllDailySchedules(cached.allDailySchedules || []);
            setSpecificSchedules(cached.specificSchedules || []);
            setDynamicMonthlyGoal(cached.dynamicMonthlyGoal || 50);
        }

        setLoading(true);
        try {
            const [monthlyRes, allMonthlyRes, allDailyRes, specificRes] = await Promise.all([
                supabase.from('monthly_schedules').select('schedule').eq('user_id', user.id).eq('month', monthStr).maybeSingle(),
                supabase.from('monthly_schedules').select('*').eq('user_id', user.id).gte('month', format(syStart, 'yyyy-MM-dd')).lte('month', format(syEnd, 'yyyy-MM-dd')).order('month', { ascending: true }),
                supabase.from('daily_schedules').select('*').eq('user_id', user.id).gte('date', format(syStart, 'yyyy-MM-dd')).lte('date', format(syEnd, 'yyyy-MM-dd')),
                supabase.from('daily_schedules').select('*').eq('user_id', user.id).gte('date', format(monthStart, 'yyyy-MM-dd')).lte('date', format(endOfMonth(currentDate), 'yyyy-MM-dd')).order('date', { ascending: true })
            ]);

            const newBase = monthlyRes.data?.schedule || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
            const newAllSchedules = allMonthlyRes.data || [];
            const newAllDaily = allDailyRes.data || [];
            const newSpecific = specificRes.data || [];

            setBaseSchedule(newBase);
            setAllSchedules(newAllSchedules);
            setAllDailySchedules(newAllDaily);
            setSpecificSchedules(newSpecific);

            // Dynamic Goal
            const syMonths = ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'];
            const monthIdx = syMonths.indexOf(format(currentDate, 'MMMM'));
            let newGoal = 50;
            if (monthIdx !== -1) {
                const { data: previousReports } = await supabase
                    .from('reports')
                    .select('hours')
                    .gte('date', format(syStart, 'yyyy-MM-dd'))
                    .lt('date', monthStr);
                const accumulatedHours = (previousReports || []).reduce((acc, r) => acc + (Number(r.hours) || 0), 0);
                newGoal = Number(((YEARLY_QUOTA - accumulatedHours) / Math.max(1, 12 - monthIdx)).toFixed(1));
                setDynamicMonthlyGoal(newGoal);
            }

            await offlineStore.setItem(cacheKey, {
                baseSchedule: newBase,
                allSchedules: newAllSchedules,
                allDailySchedules: newAllDaily,
                specificSchedules: newSpecific,
                dynamicMonthlyGoal: newGoal
            });
        } catch (err) {
            console.warn('[Offline] Using cached schedule');
        } finally {
            setLoading(false);
        }
    }, [user, currentDate, syStart, syEnd]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const saveMonthlySchedule = async () => {
        if (!user) return { error: new Error('User not authenticated') };
        setSaving(true);
        const monthStr = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        
        try {
            const { error } = await supabase.from('monthly_schedules').upsert({
                user_id: user.id,
                month: monthStr,
                schedule: baseSchedule
            }, { onConflict: 'user_id,month' });
            if (error) throw error;
            setSuccess(true);
            fetchAllData();
            setTimeout(() => setSuccess(false), 3000);
            return { error: null };
        } catch (err) {
            await offlineStore.addToOutbox({
                table: 'monthly_schedules',
                action: 'UPDATE',
                payload: { user_id: user.id, month: monthStr, schedule: baseSchedule }
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            return { error: null, offline: true };
        } finally {
            setSaving(false);
        }
    };

    const saveSpecificSchedule = async (date: string, hours: number) => {
        if (!user) return { error: new Error('User not authenticated') };
        
        // Optimistic
        setSpecificSchedules([{ date, hours }, ...specificSchedules]);

        try {
            const { error } = await supabase.from('daily_schedules').upsert({
                user_id: user.id,
                date,
                hours
            }, { onConflict: 'user_id,date' });
            if (error) throw error;
            fetchAllData();
            return { error: null };
        } catch (err) {
            await offlineStore.addToOutbox({
                table: 'daily_schedules',
                action: 'UPDATE',
                payload: { user_id: user.id, date, hours }
            });
            return { error: null, offline: true };
        }
    };

    const deleteSpecificSchedule = async (id: string) => {
        setSpecificSchedules(specificSchedules.filter(s => s.id !== id));
        try {
            const { error } = await supabase.from('daily_schedules').delete().eq('id', id);
            if (error) throw error;
            fetchAllData();
        } catch (err) {
            await offlineStore.addToOutbox({
                table: 'daily_schedules',
                action: 'DELETE',
                payload: { id }
            });
        }
        return { error: null };
    };

    const copyFromMonth = async (monthStr: string) => {
        if (!user) return;
        try {
            const { data } = await supabase.from('monthly_schedules').select('schedule').eq('user_id', user.id).eq('month', monthStr).maybeSingle();
            if (data) setBaseSchedule(data.schedule);
        } catch (err) {
            console.warn('[Offline] Could not copy from month');
        }
    };

    const projectedTotal = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    }).reduce((acc, day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayIdx = getDay(day);
        const specific = specificSchedules.find(s => s.date === dateStr);
        if (specific) return acc + (Number(specific.hours) || 0);
        // Handle both number and string keys for mobile compatibility
        return acc + (baseSchedule[dayIdx] ?? baseSchedule[dayIdx.toString()] ?? 0);
    }, 0);

    return {
        currentDate, setCurrentDate, baseSchedule, setBaseSchedule,
        dynamicMonthlyGoal, allSchedules, allDailySchedules, specificSchedules,
        projectedTotal, loading, saving, success,
        saveMonthlySchedule, saveSpecificSchedule, deleteSpecificSchedule, copyFromMonth
    };
};
