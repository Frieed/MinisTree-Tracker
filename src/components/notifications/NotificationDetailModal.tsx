import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ShieldAlert, CheckCircle2, Trophy, Clock, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { type Notification } from '../../hooks/useNotifications';
import { TREE_STAGES } from '../../constants/treeStages';

interface NotificationDetailModalProps {
    notification: Notification | null;
    onClose: () => void;
    onDelete: (id: string) => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({ 
    notification, onClose, onDelete 
}) => {
    if (!notification) return null;

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
