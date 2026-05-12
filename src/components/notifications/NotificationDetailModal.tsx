import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ShieldAlert, CheckCircle2, Trophy, Clock, Trash2, MapPin, FileText, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { type Notification } from '../../hooks/useNotifications';
import { TREE_STAGES } from '../../constants/treeStages';

interface NotificationDetailModalProps {
    notification: Notification | null;
    onClose: () => void;
    onDelete: (id: string) => void;
    onRespond?: (notificationId: string, transferId: string, accept: boolean) => Promise<any>;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({ 
    notification, onClose, onDelete, onRespond
}) => {
    const [isResponding, setIsResponding] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    if (!notification) return null;

    const handleResponse = async (accept: boolean) => {
        if (!onRespond || !notification.payload?.transfer_id) return;
        
        setIsResponding(true);
        setError(null);
        
        const result = await onRespond(notification.id, notification.payload.transfer_id, accept);
        
        if (result?.error) {
            setError(result.error);
            setIsResponding(false);
        } else {
            onClose();
        }
    };

    const getIcon = () => {
        if (notification.type === 'warning') return <ShieldAlert size={40} />;
        if (notification.type === 'success') {
            return notification.title.includes('Tree Level') ? <Trophy size={40} /> : <CheckCircle2 size={40} />;
        }
        return <Bell size={40} />;
    };

    const getColorClass = () => {
        if (notification.type === 'warning') return 'text-amber-500 bg-amber-50';
        if (notification.type === 'success') return 'text-nature-green bg-nature-green/10';
        return 'text-nature-brown-light bg-nature-cream';
    };

    const isLevelUp = notification.title.includes('Tree Level');
    const stageMatch = notification.message.match(/Stage (\d+)/);
    const reachedStageIdx = stageMatch ? parseInt(stageMatch[1], 10) - 1 : -1;
    const nextStage = isLevelUp && reachedStageIdx >= 0 ? TREE_STAGES[reachedStageIdx + 1] : null;

    const encouragement = [
        "Your spiritual garden is flourishing!",
        "Each hour is a seed of faith planted.",
        "Your dedication is truly inspiring!",
        "Watching you grow is a joy!",
        "Faithful in little, growing to much!"
    ][reachedStageIdx % 5] || "Keep growing!";

    return createPortal(
        <AnimatePresence>
            {notification && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-nature-brown-dark/40 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-nature-cream rounded-[3rem] shadow-2xl overflow-hidden border border-white/50"
                    >
                        <div className="p-8 space-y-6">
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner ${getColorClass()}`}>
                                {getIcon()}
                            </div>
                            
                            <div className="text-center space-y-4">
                                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-nature-brown-light/60 uppercase tracking-widest">
                                    <Clock size={12} />
                                    {format(new Date(notification.created_at), 'MMMM dd, yyyy • hh:mm a')}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-nature-brown-dark leading-tight uppercase tracking-tight">
                                        {notification.title}
                                    </h3>
                                    {isLevelUp && (
                                        <p className="text-[10px] font-black text-nature-green uppercase tracking-[0.2em]">
                                            {encouragement}
                                        </p>
                                    )}
                                </div>
                                <div className="h-1 w-12 bg-nature-green/20 mx-auto rounded-full" />
                                <p className="text-sm font-medium text-nature-brown-light leading-relaxed px-2">
                                    {notification.message}
                                </p>

                                {notification.payload?.visit_details && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-5 bg-white border border-nature-cream rounded-[2rem] shadow-sm text-left space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-inner ${
                                                    notification.payload.visit_details.is_bible_study ? 'bg-[#e8f5f1] border-[#c2e5db]' : 'bg-[#ebf3fe] border-[#d4e4f9]'
                                                }`}>
                                                    <span className="text-xl">
                                                        {notification.payload.visit_details.is_bible_study ? '🌳' : '🌱'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-nature-brown-dark leading-tight">{notification.payload.visit_details.name}</p>
                                                    <p className="text-[9px] font-black text-nature-brown-light uppercase tracking-widest">{notification.payload.visit_details.gender}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 border-t border-nature-cream/50 pt-2">
                                            <div className="flex items-start gap-2">
                                                <MapPin size={12} className="text-nature-green mt-0.5 shrink-0" />
                                                <p className="text-[11px] text-nature-brown font-medium leading-tight italic">
                                                    {notification.payload.visit_details.address || 'No address provided'}
                                                </p>
                                            </div>
                                            {notification.payload.visit_details.remarks && (
                                                <div className="flex items-start gap-2">
                                                    <FileText size={12} className="text-nature-brown-light mt-0.5 shrink-0" />
                                                    <p className="text-[11px] text-nature-brown-light leading-snug line-clamp-2">
                                                        {notification.payload.visit_details.remarks}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {nextStage && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-4 bg-white/60 rounded-3xl border border-nature-green/10 space-y-2"
                                    >
                                        <p className="text-[10px] font-black text-nature-brown-light/40 uppercase tracking-widest">Next Milestone</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-nature-green/5 rounded-xl flex items-center justify-center text-nature-green">
                                                    <Trophy size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-black text-nature-brown-dark uppercase tracking-tight">Stage {reachedStageIdx + 2}</p>
                                                    <p className="text-[9px] font-bold text-nature-brown-light">Requirement: {nextStage.minHours} Hours</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-nature-green uppercase tracking-tighter">Keep Going!</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                {notification.payload?.type === 'handover_request' ? (
                                    <div className="flex flex-col gap-3 w-full">
                                        <div className="flex gap-3">
                                            <button
                                                disabled={isResponding}
                                                onClick={() => handleResponse(false)}
                                                className="flex-1 h-14 bg-white text-rose-500 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <X size={14} />
                                                Reject
                                            </button>
                                            <button
                                                disabled={isResponding}
                                                onClick={() => handleResponse(true)}
                                                className="flex-1 h-14 bg-nature-green text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-nature-green/30 hover:bg-nature-green-dark transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isResponding ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                Accept
                                            </button>
                                        </div>
                                        {error && (
                                            <p className="text-[10px] font-bold text-rose-500 text-center animate-pulse">
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(notification.id);
                                                onClose();
                                            }}
                                            className="w-14 h-14 bg-white text-rose-300 hover:text-rose-500 rounded-2xl flex items-center justify-center border border-nature-cream transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="flex-1 h-14 bg-nature-green text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-nature-green/30 hover:bg-nature-green-dark transition-all active:scale-95"
                                        >
                                            Close Message
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-nature-brown-light/40 hover:text-nature-brown transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
