import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Minus, Plus, Clock, Loader2, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface SpecificScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDate: Date;
    date: string;
    setDate: (d: string) => void;
    hours: string;
    setHours: (h: string) => void;
    onSave: (e: React.FormEvent) => void;
    loading: boolean;
}

export const SpecificScheduleModal = ({ 
    isOpen, onClose, currentDate, date, setDate, hours, setHours, onSave, loading 
}: SpecificScheduleModalProps) => {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-nature-brown-dark/40 backdrop-blur-sm z-[2000]" />
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 z-[2100] shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="w-12 h-1.5 bg-nature-cream rounded-full mx-auto mb-6" />
                        
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-nature-brown-dark tracking-tight">Manual Schedule</h3>
                                <p className="text-[10px] uppercase font-bold text-nature-brown-light tracking-widest mt-1">Specific Day Override for {format(currentDate, 'MMMM')}</p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-nature-cream hover:bg-nature-brown/10 rounded-full text-nature-brown transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={onSave} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light ml-2">Select Date</label>
                                <input 
                                    type="date" value={date} onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl font-bold text-nature-brown-dark focus:border-nature-green outline-none transition-all"
                                    min={format(startOfMonth(currentDate), 'yyyy-MM-dd')}
                                    max={format(endOfMonth(currentDate), 'yyyy-MM-dd')}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light ml-2">Target Hours</label>
                                <div className="bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            type="button" onClick={() => setHours(Math.max(0, parseFloat(hours) - 0.5).toString())}
                                            className="w-10 h-10 rounded-xl bg-white border border-nature-cream text-nature-brown flex items-center justify-center hover:bg-nature-green hover:text-white transition-all shadow-sm"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <div className="flex flex-col items-center">
                                            <input 
                                                type="number" 
                                                step="0.5" 
                                                value={hours} 
                                                onChange={(e) => setHours(e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className="w-16 text-center bg-transparent border-none text-2xl font-black text-nature-brown-dark focus:outline-none focus:placeholder:text-transparent"
                                                required
                                            />
                                            <span className="text-[8px] font-black uppercase text-nature-brown-light -mt-1 tracking-widest italic">hours</span>
                                        </div>
                                        <button 
                                            type="button" onClick={() => setHours((parseFloat(hours) + 0.5).toString())}
                                            className="w-10 h-10 rounded-xl bg-white border border-nature-cream text-nature-brown flex items-center justify-center hover:bg-nature-green hover:text-white transition-all shadow-sm"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <Clock size={24} className="text-nature-green/20" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={onClose} className="flex-1 py-4 px-6 rounded-[2rem] bg-nature-cream text-nature-brown font-black uppercase text-xs tracking-widest transition-colors hover:bg-nature-brown/10">Cancel</button>
                                <button 
                                    type="submit" disabled={loading}
                                    className="flex-[2] py-4 px-6 rounded-[2rem] bg-nature-green text-white font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 shadow-lg shadow-nature-green/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Date"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
