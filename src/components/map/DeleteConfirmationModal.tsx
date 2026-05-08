import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    itemType: string;
}

export const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    itemType
}: DeleteConfirmationModalProps) => {
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
                        className="fixed inset-0 z-[4000] bg-nature-brown-dark/20 backdrop-blur-sm"
                    />
                    <div className="fixed inset-0 z-[4100] flex items-center justify-center p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border-2 border-nature-cream pointer-events-auto relative overflow-hidden"
                        >
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-rose-50 rounded-full opacity-50" />
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-nature-cream/30 rounded-full" />

                            <div className="relative text-center space-y-6">
                                <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                                    <AlertTriangle size={40} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-nature-brown-dark uppercase tracking-tight">Remove {itemType === 'Bible Study' ? 'Tree' : 'Seedling'}?</h3>
                                    <p className="text-nature-brown text-sm font-medium leading-relaxed px-2">
                                        Are you sure you want to remove <span className="font-black text-rose-500">{itemName}</span>? This will permanently delete this {itemType.toLowerCase()} and all its visit history from your garden.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        onClick={onConfirm}
                                        className="w-full h-14 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20 hover:bg-rose-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} /> Delete Permanently
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full h-14 bg-nature-cream text-nature-brown-dark rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-nature-brown/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-nature-brown-light hover:text-nature-brown-dark transition-colors"
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
