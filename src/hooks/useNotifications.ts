import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    is_read: boolean;
    created_at: string;
    payload?: any;
}

export const useNotificationsData = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);
            if (error) throw error;
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);
            if (error) throw error;
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const createNotification = useCallback(async (
        title: string, 
        message: string, 
        type: 'info' | 'warning' | 'success' = 'info',
        targetUserId?: string
    ) => {
        const userId = targetUserId || user?.id;
        if (!userId) {
            console.warn('[Notifications] No user found, cannot create notification');
            return;
        }
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({ user_id: userId, title, message, type });
            if (error) throw error;
            await fetchNotifications();
        } catch (err) {
            console.error('[Notifications] Failed to create:', err);
        }
    }, [user, fetchNotifications]);

    const checkAndGenerateNotifications = useCallback(async (visits: any[], stageIdx: number) => {
        if (!user) return;
        
        // Wait for notifications to load if they are currently loading
        if (loading) return;

        const nowTime = Date.now();

        // 0. Auto-Cleanup (Delete notifications older than 24 hours) - Throttled to once every 24 hours per user
        const cleanupKey = `minisTree_lastNotifCleanup_${user.id}`;
        const lastNotifCleanup = localStorage.getItem(cleanupKey);
        if (!lastNotifCleanup || nowTime - Number(lastNotifCleanup) > 24 * 60 * 60 * 1000) {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            try {
                const { error: cleanupError } = await supabase
                    .from('notifications')
                    .delete()
                    .eq('user_id', user.id)
                    .lt('created_at', twentyFourHoursAgo);
                
                if (cleanupError) throw cleanupError;
                localStorage.setItem(cleanupKey, nowTime.toString());
            } catch (err) {
                console.error('[Notifications] Auto-cleanup failed:', err);
            }
        }

        // 1. Drying Tree Warning (1 week left)
        const dryingVisits = (visits || []).filter(v => {
            const lastDate = v.last_visit_date || v.created_at;
            if (!lastDate) return false;
            const diff = new Date().getTime() - new Date(lastDate).getTime();
            const weeksPassed = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
            return weeksPassed === 11;
        });

        for (const v of dryingVisits) {
            // Use a localStorage key per plant so we don't spam even after the 24h DB cleanup
            const dryingKey = `minisTree_dryingNotif_${user.id}_${v.id}`;
            const lastDryingNotif = localStorage.getItem(dryingKey);
            // Only fire once per 7-day window (the plant has ~1 week left, one warning is enough)
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (!lastDryingNotif || nowTime - Number(lastDryingNotif) > sevenDays) {
                await createNotification(
                    'Plant Drying Out!',
                    `Warning: ${v.name} has only 1 week left before they are permanently removed from your garden. Give them some water soon!`,
                    'warning'
                );
                localStorage.setItem(dryingKey, nowTime.toString());
            }
        }

        // 2. Tree Level Up
        const notifiedKey = `minisTree_lastNotifiedStage_${user.id}`;
        const lastNotified = parseInt(localStorage.getItem(notifiedKey) || '-1', 10);
        
        // We trigger if it's a NEW level (climbing up)
        // OR if it's the first time EVER using notifications (initial sync)
        const isFirstTimeSync = lastNotified === -1;
        const currentLevelInDB = notifications.some(n => 
            n.type === 'success' && 
            n.title.includes('Tree Level Up') && 
            n.message.includes(`Stage ${stageIdx + 1}`)
        );

        if (stageIdx > lastNotified || (isFirstTimeSync && stageIdx >= 0 && !currentLevelInDB)) {
            if (!currentLevelInDB) {
                await createNotification(
                    'Tree Level Up! 🎉',
                    `Congratulations! Your tree has reached Stage ${stageIdx + 1}. Keep up the great work in your ministry!`,
                    'success'
                );
            }
            // Update local tracking
            localStorage.setItem(notifiedKey, stageIdx.toString());
        } else if (stageIdx < lastNotified) {
            // Reset tracking if stage drops
            localStorage.setItem(notifiedKey, stageIdx.toString());
        }

        // 3. Missing Report Reminder - Throttled to once every 15 minutes per user
        const now = new Date();
        if (now.getDate() >= 1 && now.getDate() <= 10) {
            const reportCheckKey = `minisTree_lastReportCheck_${user.id}`;
            const lastReportCheck = localStorage.getItem(reportCheckKey);
            if (!lastReportCheck || nowTime - Number(lastReportCheck) > 15 * 60 * 1000) {
                const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const prevMonthStr = format(prevMonth, 'yyyy-MM-01');
                const monthName = format(prevMonth, 'MMMM');
                
                const alreadyNotified = notifications.some(n => n.type === 'warning' && n.title.includes(`${monthName} Report`));
                
                if (!alreadyNotified) {
                    try {
                        const { data: submission } = await supabase
                            .from('monthly_submissions')
                            .select('is_reported')
                            .eq('user_id', user.id)
                            .eq('month', prevMonthStr)
                            .maybeSingle();

                        if (!submission?.is_reported) {
                            await createNotification(
                                `${monthName} Report Reminder`,
                                `You haven't reported your activity for ${monthName} yet. Don't forget to mark it as reported in the Hours section!`,
                                'warning'
                            );
                        }
                        localStorage.setItem(reportCheckKey, nowTime.toString());
                    } catch (err) {
                        console.error('[Notifications] Failed to check monthly submissions:', err);
                    }
                } else {
                    // Even if already notified, update the check timestamp to prevent query attempts
                    localStorage.setItem(reportCheckKey, nowTime.toString());
                }
            }
        }

        // 4. New Service Year Welcome Notification & Motivational Message
        const currentSYStartYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
        const syNotifKey = `minisTree_syNotified_${user.id}_${currentSYStartYear}`;
        const alreadyNotifiedSY = localStorage.getItem(syNotifKey);

        if (!alreadyNotifiedSY) {
            const nextSYYear = currentSYStartYear + 1;
            const inNotifDB = notifications.some(n => n.type === 'success' && n.title.includes(`Service Year ${currentSYStartYear}–${nextSYYear}`));
            
            if (!inNotifDB) {
                await createNotification(
                    `Welcome to Service Year ${currentSYStartYear}–${nextSYYear}! 🌿✨`,
                    `A brand new service year has arrived! "Trust in Jehovah and do good; reside in the earth, and act with faithfulness." — Psalm 37:3. May Jehovah abundantly bless your zealous efforts and personal goals this year!`,
                    'success'
                );
            }
            localStorage.setItem(syNotifKey, 'true');
        }
    }, [user, loading, notifications, createNotification]);

    const respondToHandover = async (notificationId: string, transferId: string, accept: boolean) => {
        if (!user) return;
        
        try {
            // 1. Get transfer details
            const { data: transfer, error: fetchError } = await supabase
                .from('visit_transfers')
                .select('*, return_visits(name)')
                .eq('id', transferId)
                .single();

            if (fetchError || !transfer) throw new Error('Transfer request not found.');

            if (accept) {
                // 2. Use secure RPC function to transfer ownership (bypasses RLS safely)
                const { data: rpcResult, error: rpcError } = await supabase
                    .rpc('accept_visit_handover', { p_transfer_id: transferId });

                if (rpcError) throw rpcError;
                if (rpcResult?.error) throw new Error(rpcResult.error);

                // 3. Notify the sender of success
                await createNotification(
                    'Handover Accepted! ✅',
                    `${user.email} accepted your handover for ${transfer.return_visits?.name || 'a visit'}. It has been moved to their garden.`,
                    'success',
                    transfer.from_user_id
                );

                // 4. Trigger global refresh for the garden
                window.dispatchEvent(new CustomEvent('refresh-visits'));
            } else {
                // Notify the sender of rejection
                await createNotification(
                    'Handover Declined ❌',
                    `${user.email} declined your handover request for ${transfer.return_visits?.name || 'a visit'}.`,
                    'info',
                    transfer.from_user_id
                );
            }

            // 5. Clean up: notification only (transfer record deleted by RPC on accept)
            await deleteNotification(notificationId);
            
            return { success: true };
        } catch (err: any) {
            console.error('Response error:', err);
            return { error: err.message };
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createNotification,
        checkAndGenerateNotifications,
        respondToHandover,
        refresh: fetchNotifications
    };
};
