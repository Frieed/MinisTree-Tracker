import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { offlineStore } from '../lib/offline';

export const useVisits = () => {
    const { user } = useAuth();
    const [visits, setVisits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visitLogs, setVisitLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const fetchVisits = useCallback(async () => {
        if (!user) return;
        const cacheKey = `visits_${user.id}`;
        
        // Load from cache first
        const cached = await offlineStore.getItem<any[]>(cacheKey);
        if (cached) setVisits(cached);

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('return_visits')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                setVisits(data);
                await offlineStore.setItem(cacheKey, data);
            }
        } catch (err) {
            console.warn('[Offline] Using cached visits');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchVisitLogs = async (visitId: string) => {
        const cacheKey = `logs_${visitId}`;
        const cached = await offlineStore.getItem<any[]>(cacheKey);
        if (cached) setVisitLogs(cached);

        setLoadingLogs(true);
        try {
            const { data, error } = await supabase
                .from('visit_logs')
                .select('*')
                .eq('visit_id', visitId)
                .order('visit_date', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                setVisitLogs(data);
                await offlineStore.setItem(cacheKey, data);
            }
        } catch (err) {
            console.warn('[Offline] Using cached logs');
        } finally {
            setLoadingLogs(false);
        }
    };

    const saveVisit = async (visitData: any, editingId?: string) => {
        if (!user) return { error: 'User not authenticated' };
        
        // Optimistic UI
        const tempId = editingId || `temp-${Date.now()}`;
        const optimisticVisit = { ...visitData, id: tempId, user_id: user.id };
        if (editingId) {
            setVisits(visits.map(v => v.id === editingId ? optimisticVisit : v));
        } else {
            setVisits([optimisticVisit, ...visits]);
        }

        try {
            let result;
            if (editingId) {
                result = await supabase.from('return_visits').update(visitData).eq('id', editingId);
            } else {
                result = await supabase.from('return_visits').insert({ ...visitData, user_id: user.id }).select().single();
            }
            if (result.error) throw result.error;
            await fetchVisits();
            return result;
        } catch (err) {
            await offlineStore.addToOutbox({
                table: 'return_visits',
                action: editingId ? 'UPDATE' : 'INSERT',
                payload: editingId ? { ...visitData, id: editingId } : { ...visitData, user_id: user.id }
            });
            return { error: null, offline: true };
        }
    };

    const deleteVisit = async (id: string) => {
        if (!user) return { error: new Error('User not authenticated') };
        
        setVisits(visits.filter(v => v.id !== id));

        try {
            const { error } = await supabase.from('return_visits').delete().eq('id', id).eq('user_id', user.id);
            if (error) throw error;
            await fetchVisits();
        } catch (err) {
            await offlineStore.addToOutbox({
                table: 'return_visits',
                action: 'DELETE',
                payload: { id }
            });
        }
        return { error: null };
    };

    const waterVisit = async (visitId: string, logData: any, latestUpdate: any) => {
        if (!user) return { error: new Error('User not authenticated') };
        
        // Optimistic UI
        const tempLogId = `temp-log-${Date.now()}`;
        setVisitLogs([{ ...logData, id: tempLogId, visit_id: visitId }, ...visitLogs]);
        setVisits(visits.map(v => v.id === visitId ? { ...v, ...latestUpdate } : v));

        try {
            const { error: logError } = await supabase.from('visit_logs').insert({ visit_id: visitId, ...logData });
            if (logError) throw logError;

            const result = await supabase.from('return_visits').update(latestUpdate).eq('id', visitId).eq('user_id', user.id);
            if (result.error) throw result.error;

            await fetchVisits();
            await fetchVisitLogs(visitId);
            return result;
        } catch (err) {
            await offlineStore.addToOutbox({
                table: 'visit_logs',
                action: 'INSERT',
                payload: { visit_id: visitId, ...logData }
            });
            await offlineStore.addToOutbox({
                table: 'return_visits',
                action: 'UPDATE',
                payload: { ...latestUpdate, id: visitId }
            });
            return { error: null, offline: true };
        }
    };

    const toggleBibleStudy = async (visitId: string, isBibleStudy: boolean) => {
        if (!user) return { error: new Error('User not authenticated') };
        
        const newStatus = !isBibleStudy;
        setVisits(visits.map(v => v.id === visitId ? { ...v, is_bible_study: newStatus } : v));

        try {
            const result = await supabase.from('return_visits').update({ is_bible_study: newStatus }).eq('id', visitId).eq('user_id', user.id);
            if (result.error) throw result.error;
            await fetchVisits();
            return result;
        } catch (err) {
            await offlineStore.addToOutbox({
                table: 'return_visits',
                action: 'UPDATE',
                payload: { id: visitId, is_bible_study: newStatus }
            });
            return { error: null, offline: true };
        }
    };

    const deleteLog = async (logId: string, visitId: string) => {
        setVisitLogs(visitLogs.filter(l => l.id !== logId));

        try {
            const { error } = await supabase.from('visit_logs').delete().eq('id', logId);
            if (error) throw error;
            await fetchVisitLogs(visitId);
        } catch (err) {
            await offlineStore.addToOutbox({
                table: 'visit_logs',
                action: 'DELETE',
                payload: { id: logId }
            });
        }
        return { error: null };
    };

    // Auto-Cleanup logic
    useEffect(() => {
        const performCleanup = async () => {
            if (!user) return;
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const dateThreshold = threeMonthsAgo.toISOString().split('T')[0];

            const { data: candidates } = await supabase
                .from('return_visits')
                .select('id, created_at')
                .eq('user_id', user.id)
                .eq('is_bible_study', false);

            if (!candidates || candidates.length === 0) return;

            const { data: recentLogs } = await supabase
                .from('visit_logs')
                .select('visit_id')
                .gte('visit_date', dateThreshold);

            const activeVisitIds = new Set(recentLogs?.map(l => l.visit_id) || []);
            const toDelete = candidates.filter(rv => {
                const isOld = new Date(rv.created_at) < threeMonthsAgo;
                return isOld && !activeVisitIds.has(rv.id);
            });

            if (toDelete.length > 0) {
                const idsToDelete = toDelete.map(v => v.id);
                const { error } = await supabase.from('return_visits').delete().in('id', idsToDelete);
                if (!error) fetchVisits();
            }
        };

        performCleanup();
    }, [user, fetchVisits]);

    useEffect(() => {
        fetchVisits();
    }, [fetchVisits]);

    return {
        visits,
        loading,
        visitLogs,
        loadingLogs,
        fetchVisits,
        fetchVisitLogs,
        saveVisit,
        deleteVisit,
        waterVisit,
        toggleBibleStudy,
        deleteLog
    };
};
