import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShieldAlert, Trash2, CheckCircle2, Inbox, Loader2, Trophy } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { NotificationsClearModal } from '../components/notifications/NotificationsClearModal';
import { NotificationDetailModal } from '../components/notifications/NotificationDetailModal';
import { useState } from 'react';
import { type Notification } from '../hooks/useNotifications';

const Notifications = () => {
    const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, respondToHandover } = useNotifications();
    const [showClearModal, setShowClearModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification);
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
    };

    const handleClearAll = async () => {
        for (const n of notifications) {
            await deleteNotification(n.id);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="px-6 space-y-6 pb-20">
            <header className="space-y-4 mb-2">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-black text-nature-brown-dark uppercase tracking-tight">Notifications</h2>
                </div>

                <div className="flex items-center justify-between gap-3 px-1">
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 bg-nature-green text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-nature-green/20 hover:scale-105 transition-all"
                            >
                                <CheckCircle2 size={14} />
                                Mark All Read ({unreadCount})
                            </button>
                        )}
                    </div>
                    
                    {notifications.length > 0 && (
                        <button 
                            onClick={() => setShowClearModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-rose-100 transition-all border border-rose-100"
                        >
                            <Trash2 size={14} />
                            Clear All
                        </button>
                    )}
                </div>
            </header>

            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-nature-brown-light/50">
                        <Loader2 size={40} className="animate-spin mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Gathering Updates...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {notifications.map((notification) => (
                            <motion.div 
                                key={notification.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: -20 }}
                                onClick={() => handleNotificationClick(notification)}
                                className={`group p-5 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden ${
                                    notification.is_read 
                                        ? 'bg-white/50 border-nature-cream/50' 
                                        : 'bg-white border-nature-green/20 shadow-sm'
                                }`}
                            >
                                {!notification.is_read && (
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-nature-green" />
                                )}
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                        notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                        notification.type === 'success' ? 'bg-nature-green/10 text-nature-green' :
                                        'bg-nature-cream text-nature-brown-light'
                                    }`}>
                                        {notification.type === 'warning' ? <ShieldAlert size={24} /> :
                                         notification.type === 'success' ? (
                                             notification.title.includes('Tree Level') ? <Trophy size={24} /> : <CheckCircle2 size={24} />
                                         ) :
                                         <Bell size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm font-black uppercase tracking-wide truncate ${notification.is_read ? 'text-nature-brown-light' : 'text-nature-brown-dark'}`}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-[10px] font-bold text-nature-brown-light/60 whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className={`text-xs leading-relaxed ${notification.is_read ? 'text-nature-brown-light/70' : 'text-nature-brown-light'}`}>
                                            {notification.message}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-nature-brown-light/30 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-24 h-24 bg-nature-cream rounded-[2.5rem] flex items-center justify-center text-nature-brown-light/30">
                            <Inbox size={48} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-nature-brown-light uppercase tracking-widest">Inbox Empty</p>
                            <p className="text-xs text-nature-brown-light/60 font-medium">You don't have any notifications at the moment.</p>
                        </div>
                    </div>
                )}
            </div>

            <NotificationsClearModal 
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={handleClearAll}
                count={notifications.length}
            />

            <NotificationDetailModal 
                notification={selectedNotification}
                onClose={() => setSelectedNotification(null)}
                onDelete={deleteNotification}
                onRespond={respondToHandover}
            />
        </div>
    );
};

export default Notifications;
