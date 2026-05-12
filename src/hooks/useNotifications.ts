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

    const createNotification = async (
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
    };

    const checkAndGenerateNotifications = useCallback(async (visits: any[], stageIdx: number) => {
        if (!user) return;
        
        // Wait for notifications to load if they are currently loading
        if (loading) return;

        // 0. Auto-Cleanup (Delete notifications older than 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        try {
            const { error: cleanupError } = await supabase
                .from('notifications')
                .delete()
                .eq('user_id', user.id)
                .lt('created_at', twentyFourHoursAgo);
            
            if (cleanupError) throw cleanupError;
        } catch (err) {
            console.error('[Notifications] Auto-cleanup failed:', err);
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
            const alreadyNotified = notifications.some(n => n.type === 'warning' && n.message.includes(v.name) && n.message.includes('1 week left'));
            if (!alreadyNotified) {
                await createNotification(
                    'Plant Drying Out!',
                    `Warning: ${v.name} has only 1 week left before they are permanently removed from your garden. Give them some water soon!`,
                    'warning'
                );
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

        // 3. Missing Report Reminder
        const now = new Date();
        if (now.getDate() >= 1 && now.getDate() <= 10) {
            const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const prevMonthStr = format(prevMonth, 'yyyy-MM-01');
            const monthName = format(prevMonth, 'MMMM');
            
            const alreadyNotified = notifications.some(n => n.type === 'warning' && n.title.includes(`${monthName} Report`));
            
            if (!alreadyNotified) {
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
            }
        }
    }, [user, loading, notifications]);

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
