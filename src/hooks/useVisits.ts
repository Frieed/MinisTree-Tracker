import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useVisits = () => {
    const { user } = useAuth();
    const [visits, setVisits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visitLogs, setVisitLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const fetchVisits = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data } = await supabase
            .from('return_visits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setVisits(data);
        setLoading(false);
    }, [user]);

    const fetchVisitLogs = async (visitId: string) => {
        setLoadingLogs(true);
        const { data } = await supabase
            .from('visit_logs')
            .select('*')
            .eq('visit_id', visitId)
            .order('visit_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (data) setVisitLogs(data);
        setLoadingLogs(false);
    };

    const saveVisit = async (visitData: any, editingId?: string) => {
        if (!user) return { error: 'User not authenticated' };
        
        let result;
        if (editingId) {
            result = await supabase
                .from('return_visits')
                .update(visitData)
                .eq('id', editingId);
        } else {
            result = await supabase.from('return_visits').insert({ ...visitData, user_id: user.id });
        }
        
        if (!result.error) await fetchVisits();
        return result;
    };

    const deleteVisit = async (id: string) => {
        if (!user) return { error: new Error('User not authenticated') };
        const { error } = await supabase.from('return_visits').delete().eq('id', id).eq('user_id', user.id);
        if (!error) await fetchVisits();
        return { error };
    };

    const waterVisit = async (visitId: string, logData: any, latestUpdate: any) => {
        if (!user) return { error: new Error('User not authenticated') };
        // 1. Log the update
        const { error: logError } = await supabase.from('visit_logs').insert({ visit_id: visitId, ...logData });
        if (logError) return { error: logError };

        // 2. Auto-Prune logs (keep last 3)
        const { data: allHistory } = await supabase
            .from('visit_logs')
            .select('id')
            .eq('visit_id', visitId)
            .order('visit_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (allHistory && allHistory.length > 3) {
            const logsToDelete = allHistory.slice(3).map(l => l.id);
            await supabase.from('visit_logs').delete().in('id', logsToDelete);
        }

        // 3. Update main record
        const result = await supabase
            .from('return_visits')
            .update(latestUpdate)
            .eq('id', visitId)
            .eq('user_id', user.id);

        if (!result.error) {
            await fetchVisits();
            await fetchVisitLogs(visitId);
        }
        return result;
    };

    const toggleBibleStudy = async (visitId: string, isBibleStudy: boolean) => {
        if (!user) return { error: new Error('User not authenticated') };
        const result = await supabase
            .from('return_visits')
            .update({ is_bible_study: !isBibleStudy })
            .eq('id', visitId)
            .eq('user_id', user.id);
        if (!result.error) await fetchVisits();
        return result;
    };

    const deleteLog = async (logId: string, visitId: string) => {
        const { error } = await supabase.from('visit_logs').delete().eq('id', logId);
        if (!error) await fetchVisitLogs(visitId);
        return { error };
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
