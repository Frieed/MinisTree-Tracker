import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface UnsavedChangesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const UnsavedChangesModal = ({ isOpen, onClose, onConfirm }: UnsavedChangesModalProps) => {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={onClose} 
                        className="fixed inset-0 bg-nature-brown-dark/40 backdrop-blur-md z-[2000]" 
                    />
                    <div className="fixed inset-0 flex items-center justify-center p-6 z-[2001] pointer-events-none">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl pointer-events-auto relative overflow-hidden"
                        >
                            {/* Artisanal Background Details */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-nature-green/5 rounded-full -mr-16 -mt-16" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-nature-brown/5 rounded-full -ml-12 -mb-12" />

                            <div className="relative flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                                    <AlertTriangle size={40} className="text-rose-500" />
                                </div>

                                <h3 className="text-2xl font-black text-nature-brown-dark tracking-tight leading-tight mb-3">
                                    Unsaved <span className="text-rose-600">Changes!</span>
                                </h3>
                                
                                <p className="text-sm font-bold text-nature-brown leading-relaxed mb-8 opacity-80">
                                    You've carefully carved your schedule, but it hasn't been saved yet. Moving now will discard your progress.
                                </p>

                                <div className="w-full space-y-3">
                                    <button 
                                        onClick={onClose}
                                        className="w-full py-4 bg-nature-green text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-nature-green/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        Keep Editing
                                    </button>
                                    
                                    <button 
                                        onClick={onConfirm}
                                        className="w-full py-4 bg-white text-rose-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-2 border border-rose-100"
                                    >
                                        Discard & Leave <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 text-nature-brown/30 hover:text-nature-brown transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
