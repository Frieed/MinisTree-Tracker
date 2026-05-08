import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useServiceYear } from '../context/ServiceYearContext';
import { YEARLY_QUOTA } from '../constants/serviceYear';

export const useScheduleData = (initialDate: Date) => {
    const { user } = useAuth();
    const { startDate: syStart, endDate: syEnd } = useServiceYear();
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [baseSchedule, setBaseSchedule] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 });
    const [dynamicMonthlyGoal, setDynamicMonthlyGoal] = useState<number>(50);
    const [allSchedules, setAllSchedules] = useState<any[]>([]);
    const [allDailySchedules, setAllDailySchedules] = useState<any[]>([]);
    const [specificSchedules, setSpecificSchedules] = useState<any[]>([]);

    const fetchAllData = useCallback(async () => {
        if (!user) return;
        const monthStart = startOfMonth(currentDate);
        const monthStr = format(monthStart, 'yyyy-MM-dd');

        setLoading(true);
        const [monthlyRes, allMonthlyRes, allDailyRes, specificRes] = await Promise.all([
            supabase.from('monthly_schedules').select('schedule').eq('user_id', user.id).eq('month', monthStr).maybeSingle(),
            supabase.from('monthly_schedules').select('*').eq('user_id', user.id).gte('month', format(syStart, 'yyyy-MM-dd')).lte('month', format(syEnd, 'yyyy-MM-dd')).order('month', { ascending: true }),
            supabase.from('daily_schedules').select('*').eq('user_id', user.id).gte('date', format(syStart, 'yyyy-MM-dd')).lte('date', format(syEnd, 'yyyy-MM-dd')),
            supabase.from('daily_schedules').select('*').eq('user_id', user.id).gte('date', format(monthStart, 'yyyy-MM-dd')).lte('date', format(endOfMonth(currentDate), 'yyyy-MM-dd')).order('date', { ascending: true })
        ]);

        if (monthlyRes.data) setBaseSchedule(monthlyRes.data.schedule);
        else setBaseSchedule({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 });
        
        if (allMonthlyRes.data) setAllSchedules(allMonthlyRes.data);
        if (allDailyRes.data) setAllDailySchedules(allDailyRes.data);
        if (specificRes.data) setSpecificSchedules(specificRes.data);

        // Dynamic Goal
        const syMonths = ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'];
        const monthIdx = syMonths.indexOf(format(currentDate, 'MMMM'));
        if (monthIdx !== -1) {
            const { data: previousReports } = await supabase
                .from('reports')
                .select('hours')
                .gte('date', format(syStart, 'yyyy-MM-dd'))
                .lt('date', monthStr);
            const accumulatedHours = (previousReports || []).reduce((acc, r) => acc + (Number(r.hours) || 0), 0);
            const goal = (YEARLY_QUOTA - accumulatedHours) / Math.max(1, 12 - monthIdx);
            setDynamicMonthlyGoal(Number(goal.toFixed(1)));
        }
        setLoading(false);
    }, [user, currentDate, syStart, syEnd]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const saveMonthlySchedule = async () => {
        if (!user) return { error: new Error('User not authenticated') };
        setSaving(true);
        const { error } = await supabase.from('monthly_schedules').upsert({
            user_id: user.id,
            month: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
            schedule: baseSchedule
        }, { onConflict: 'user_id,month' });
        if (!error) {
            setSuccess(true);
            fetchAllData();
            setTimeout(() => setSuccess(false), 3000);
        }
        setSaving(false);
        return { error };
    };

    const saveSpecificSchedule = async (date: string, hours: number) => {
        if (!user) return { error: new Error('User not authenticated') };
        const { error } = await supabase.from('daily_schedules').upsert({
            user_id: user.id,
            date,
            hours
        }, { onConflict: 'user_id,date' });
        if (!error) fetchAllData();
        return { error };
    };

    const deleteSpecificSchedule = async (id: string) => {
        const { error } = await supabase.from('daily_schedules').delete().eq('id', id);
        if (!error) fetchAllData();
        return { error };
    };

    const copyFromMonth = async (monthStr: string) => {
        if (!user) return;
        const { data } = await supabase.from('monthly_schedules').select('schedule').eq('user_id', user.id).eq('month', monthStr).maybeSingle();
        if (data) setBaseSchedule(data.schedule);
    };

    const projectedTotal = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    }).reduce((acc, day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const specific = specificSchedules.find(s => s.date === dateStr);
        if (specific) return acc + (Number(specific.hours) || 0);
        return acc + (baseSchedule[getDay(day)] || 0);
    }, 0);

    return {
        currentDate, setCurrentDate, baseSchedule, setBaseSchedule,
        dynamicMonthlyGoal, allSchedules, allDailySchedules, specificSchedules,
        projectedTotal, loading, saving, success,
        saveMonthlySchedule, saveSpecificSchedule, deleteSpecificSchedule, copyFromMonth
    };
};
