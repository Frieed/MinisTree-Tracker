import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Zap, Droplets, Trash2 } from 'lucide-react';

interface HealthMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HealthMaintenanceModal: React.FC<HealthMaintenanceModalProps> = ({ isOpen, onClose }) => {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        style={{ willChange: 'opacity' }}
                        className="fixed inset-0 z-[3000] bg-nature-brown-dark/40 backdrop-blur-sm"
                    />
                    <div className="fixed inset-0 z-[3100] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.5 }}
                            style={{ willChange: 'transform, opacity' }}
                            className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 relative pointer-events-auto"
                        >
                        {/* Simplified Decorative Background */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-100/30 rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-nature-green/5 rounded-full pointer-events-none" />

                        <div className="p-8 relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-amber-100 rounded-[1.5rem] flex items-center justify-center text-amber-600 shadow-inner">
                                        <ShieldAlert size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-nature-brown-dark tracking-tight uppercase leading-none">Maintenance</h3>
                                        <p className="text-amber-600 font-bold text-xs uppercase tracking-widest mt-1">Self-Cleaning System</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-3 bg-nature-cream rounded-2xl text-nature-brown-light hover:text-nature-brown transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-nature-cream/30 p-6 rounded-[2rem] border border-white shadow-sm space-y-4">
                                    <p className="text-sm font-medium text-nature-brown leading-relaxed">
                                        To ensure your garden remains <span className="font-black text-nature-green">vibrant and meaningful</span>, the system performs automatic self-maintenance.
                                    </p>
                                    
                                    <div className="space-y-3">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-nature-green shrink-0 shadow-sm">
                                                <Droplets size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-nature-brown-dark uppercase tracking-wider">Watering Rule</h4>
                                                <p className="text-[11px] text-nature-brown-light leading-tight">Plants thrive on attention. If a person hasn't been visited for over a month, they start to "dry out."</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                                                <Trash2 size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-nature-brown-dark uppercase tracking-wider">Automatic Cleanup</h4>
                                                <p className="text-[11px] text-nature-brown-light leading-tight">To prevent your list from becoming cluttered with inactive records, any person not visited for <span className="font-black text-nature-brown-dark">3 months</span> will be permanently removed.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-100">
                                    <Zap size={16} className="text-amber-600" />
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">This keeps your ministry organized and focused on active growth.</p>
                                </div>

                                <button 
                                    onClick={onClose}
                                    className="w-full h-14 bg-nature-brown-dark text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-nature-brown transition-all shadow-lg active:scale-95"
                                >
                                    Understood
                                </button>
                            </div>
                        </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
