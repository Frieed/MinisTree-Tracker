import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface NotificationsClearModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    count: number;
}

export const NotificationsClearModal: React.FC<NotificationsClearModalProps> = ({ 
    isOpen, onClose, onConfirm, count 
}) => {
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                                <AlertTriangle size={40} />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-nature-brown-dark leading-tight uppercase tracking-tight">
                                    Clear Inbox?
                                </h3>
                                <p className="text-sm font-bold text-nature-brown-light/80 px-4">
                                    Are you sure you want to delete all <span className="text-rose-500">{count} notifications</span>? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 bg-white text-nature-brown font-black uppercase tracking-widest text-[10px] rounded-2xl border border-nature-cream shadow-sm hover:bg-nature-cream transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className="flex-1 py-4 bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={14} />
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-nature-brown-light/40 hover:text-nature-brown transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
