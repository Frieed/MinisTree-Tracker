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
        const tempId = editingId || crypto.randomUUID();
        const optimisticVisit = { ...visitData, id: tempId, user_id: user.id };
        
        if (editingId) {
            setVisits(prev => prev.map(v => v.id === editingId ? { ...v, ...optimisticVisit } : v));
        } else {
            setVisits(prev => [optimisticVisit, ...prev]);
        }

        try {
            let result;
            if (editingId) {
                result = await supabase.from('return_visits').update(visitData).eq('id', editingId);
            } else {
                result = await supabase.from('return_visits').insert({ ...visitData, user_id: user.id }).select().single();
            }
            if (result.error) throw result.error;
            
            const savedData = result.data;
            if (savedData) {
                if (editingId) {
                    setVisits(prev => prev.map(v => v.id === editingId ? savedData : v));
                } else {
                    // Replace the temp ID visit with the real one
                    setVisits(prev => prev.map(v => v.id === tempId ? savedData : v));
                }
                // Update cache
                const cacheKey = `visits_${user.id}`;
                const current = await offlineStore.getItem<any[]>(cacheKey) || [];
                const updated = editingId 
                    ? current.map(v => v.id === editingId ? savedData : v)
                    : [savedData, ...current];
                await offlineStore.setItem(cacheKey, updated);
            }

            return result;
        } catch (err) {
            const payload = editingId ? { ...visitData, id: editingId } : { ...visitData, id: tempId, user_id: user.id };
            await offlineStore.addToOutbox({
                table: 'return_visits',
                action: editingId ? 'UPDATE' : 'INSERT',
                payload
            });

            // Update cache
            const cacheKey = `visits_${user.id}`;
            const current = await offlineStore.getItem<any[]>(cacheKey) || [];
            const updated = editingId 
                ? current.map(v => v.id === editingId ? { ...v, ...optimisticVisit } : v)
                : [optimisticVisit, ...current];
            await offlineStore.setItem(cacheKey, updated);

            return { error: null, offline: true, data: optimisticVisit };
        }
    };

    const deleteVisit = async (id: string) => {
        if (!user) return { error: new Error('User not authenticated') };
        
        setVisits(prev => prev.filter(v => v.id !== id));

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
        const tempLogId = crypto.randomUUID();
        const optimisticLog = { ...logData, id: tempLogId, visit_id: visitId };
        setVisitLogs(prev => [optimisticLog, ...prev]);
        
        const updateWithDate = { ...latestUpdate, last_visit_date: logData.visit_date };
        setVisits(prev => prev.map(v => v.id === visitId ? { ...v, ...updateWithDate } : v));

        try {
            const { error: logError } = await supabase.from('visit_logs').insert({ visit_id: visitId, ...logData });
            if (logError) throw logError;

            // Log Cleanup Logic: Keep only 3 successful and 3 attempts
            const { data: allLogs } = await supabase
                .from('visit_logs')
                .select('id, is_attempt')
                .eq('visit_id', visitId)
                .order('visit_date', { ascending: false })
                .order('created_at', { ascending: false });

            if (allLogs) {
                const successful = allLogs.filter(l => !l.is_attempt);
                const attempts = allLogs.filter(l => l.is_attempt);

                // If the new visit was successful, delete ALL previous attempts
                if (!logData.is_attempt && attempts.length > 0) {
                    const toDeleteAttempts = attempts.map(l => l.id);
                    await supabase.from('visit_logs').delete().in('id', toDeleteAttempts);
                } else if (attempts.length > 3) {
                    // Otherwise keep only the last 3 attempts
                    const toDelete = attempts.slice(3).map(l => l.id);
                    await supabase.from('visit_logs').delete().in('id', toDelete);
                }

                // Always keep only the last 3 successful visits
                if (successful.length > 3) {
                    const toDelete = successful.slice(3).map(l => l.id);
                    await supabase.from('visit_logs').delete().in('id', toDelete);
                }
            }

            const result = await supabase.from('return_visits').update(updateWithDate).eq('id', visitId).eq('user_id', user.id);
            if (result.error) throw result.error;

            // Update cache
            const cacheKey = `visits_${user.id}`;
            const cachedVisits = await offlineStore.getItem<any[]>(cacheKey) || [];
            await offlineStore.setItem(cacheKey, cachedVisits.map(v => v.id === visitId ? { ...v, ...updateWithDate } : v));
            
            await fetchVisitLogs(visitId);
            return result;
        } catch (err) {
            await offlineStore.addToOutbox({
                table: 'visit_logs',
                action: 'INSERT',
                payload: { ...logData, id: tempLogId, visit_id: visitId }
            });
            await offlineStore.addToOutbox({
                table: 'return_visits',
                action: 'UPDATE',
                payload: { ...updateWithDate, id: visitId }
            });

            // Update cache
            const cacheKey = `visits_${user.id}`;
            const cachedVisits = await offlineStore.getItem<any[]>(cacheKey) || [];
            await offlineStore.setItem(cacheKey, cachedVisits.map(v => v.id === visitId ? { ...v, ...updateWithDate } : v));
            
            const logCacheKey = `logs_${visitId}`;
            const cachedLogs = await offlineStore.getItem<any[]>(logCacheKey) || [];
            await offlineStore.setItem(logCacheKey, [optimisticLog, ...cachedLogs]);

            return { error: null, offline: true };
        }
    };

    const toggleBibleStudy = async (visitId: string, isBibleStudy: boolean) => {
        if (!user) return { error: new Error('User not authenticated') };
        
        const newStatus = !isBibleStudy;
        setVisits(prev => prev.map(v => v.id === visitId ? { ...v, is_bible_study: newStatus } : v));

        try {
            const result = await supabase.from('return_visits').update({ is_bible_study: newStatus }).eq('id', visitId).eq('user_id', user.id);
            if (result.error) throw result.error;
            
            // Update cache
            const cacheKey = `visits_${user.id}`;
            const cached = await offlineStore.getItem<any[]>(cacheKey) || [];
            await offlineStore.setItem(cacheKey, cached.map(v => v.id === visitId ? { ...v, is_bible_study: newStatus } : v));
            
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
        setVisitLogs(prev => prev.filter(l => l.id !== logId));

        try {
            const { error } = await supabase.from('visit_logs').delete().eq('id', logId);
            if (error) throw error;
            
            // After deleting, find the next latest log to update return_visits.last_visit_date
            const { data: nextLatest } = await supabase
                .from('visit_logs')
                .select('visit_date')
                .eq('visit_id', visitId)
                .order('visit_date', { ascending: false })
                .limit(1)
                .single();
            
            await supabase
                .from('return_visits')
                .update({ last_visit_date: nextLatest?.visit_date || null })
                .eq('id', visitId);

            await fetchVisitLogs(visitId);
            await fetchVisits();
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

            // Throttle: Only run cleanup once every 24 hours per user
            const cleanupKey = `minisTree_lastCleanup_${user.id}`;
            const lastCleanup = localStorage.getItem(cleanupKey);
            const now = Date.now();
            if (lastCleanup && now - Number(lastCleanup) < 24 * 60 * 60 * 1000) {
                return;
            }

            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const dateThreshold = threeMonthsAgo.toISOString().split('T')[0];

            try {
                const { data: candidates } = await supabase
                    .from('return_visits')
                    .select('id, created_at')
                    .eq('user_id', user.id)
                    .eq('is_bible_study', false);

                if (!candidates || candidates.length === 0) {
                    localStorage.setItem(cleanupKey, now.toString());
                    return;
                }

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

                // Mark cleanup as completed successfully
                localStorage.setItem(cleanupKey, now.toString());
            } catch (err) {
                console.error('[Offline] Error performing auto-cleanup:', err);
            }
        };

        performCleanup();
    }, [user, fetchVisits]);

    const initiateHandover = async (visitId: string, recipientEmail: string) => {
        if (!user) return { error: 'Not authenticated' };
        
        try {
            // 1. Find recipient ID by email
            const { data: recipient, error: searchError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', recipientEmail.toLowerCase().trim())
                .single();

            if (searchError || !recipient) {
                return { error: 'User not found. Please check the email address.' };
            }

            if (recipient.id === user.id) {
                return { error: 'You cannot share a visit with yourself!' };
            }

            // 2. Create transfer record
            const { data: transfer, error: transferError } = await supabase
                .from('visit_transfers')
                .insert({
                    visit_id: visitId,
                    from_user_id: user.id,
                    to_user_id: recipient.id,
                    status: 'pending'
                })
                .select()
                .single();

            if (transferError) throw transferError;

            // 3. Create notification for recipient
            const { data: visit } = await supabase
                .from('return_visits')
                .select('*')
                .eq('id', visitId)
                .single();

            await supabase.from('notifications').insert({
                user_id: recipient.id,
                title: 'Handover Request 🤝',
                message: `${user.email} wants to hand over their return visit with ${visit?.name || 'someone'} to you.`,
                type: 'info',
                payload: { 
                    transfer_id: transfer.id, 
                    type: 'handover_request',
                    visit_details: {
                        name: visit?.name,
                        address: visit?.address,
                        remarks: visit?.remarks,
                        gender: visit?.gender,
                        is_bible_study: visit?.is_bible_study
                    }
                }
            });

            return { success: true };
        } catch (err: any) {
            console.error('Handover error:', err);
            return { error: err.message };
        }
    };

    useEffect(() => {
        const handleRefresh = () => fetchVisits();
        window.addEventListener('refresh-visits', handleRefresh);
        return () => window.removeEventListener('refresh-visits', handleRefresh);
    }, [fetchVisits]);

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
        deleteLog,
        initiateHandover
    };
};
