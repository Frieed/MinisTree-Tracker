import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Minus, Plus, Clock, Loader2 } from 'lucide-react';

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
}: SpecificScheduleModalProps) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 space-y-6"
                >
                    <div className="text-center">
                        <h3 className="text-2xl font-black text-nature-brown-dark tracking-tight">Manual Schedule</h3>
                        <p className="text-[10px] uppercase font-bold text-nature-brown-light tracking-widest mt-1">Specific Day Override for {format(currentDate, 'MMMM')}</p>
                    </div>

                    <form onSubmit={onSave} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light ml-2">Select Date</label>
                            <input 
                                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl font-bold text-nature-brown-dark focus:border-nature-green-dark outline-none transition-all"
                                min={format(startOfMonth(currentDate), 'yyyy-MM-dd')}
                                max={format(endOfMonth(currentDate), 'yyyy-MM-dd')}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light ml-2">Target Hours</label>
                            <div className="bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button 
                                        type="button" onClick={() => setHours(Math.max(0, parseFloat(hours) - 0.5).toString())}
                                        className="w-8 h-8 rounded-lg bg-white border border-nature-cream text-nature-brown flex items-center justify-center hover:bg-nature-green hover:text-white transition-all shadow-sm"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <div className="flex flex-col items-center">
                                        <input 
                                            type="number" 
                                            step="0.5" 
                                            value={hours} 
                                            onChange={(e) => setHours(e.target.value)}
                                            onFocus={(e) => e.target.select()}
                                            className="w-12 text-center bg-transparent border-none text-xl font-black text-nature-brown-dark focus:outline-none focus:placeholder:text-transparent"
                                            required
                                        />
                                        <span className="text-[7px] font-black uppercase text-nature-brown-light -mt-1 tracking-widest italic">hrs</span>
                                    </div>
                                    <button 
                                        type="button" onClick={() => setHours((parseFloat(hours) + 0.5).toString())}
                                        className="w-8 h-8 rounded-lg bg-white border border-nature-cream text-nature-brown flex items-center justify-center hover:bg-nature-green hover:text-white transition-all shadow-sm"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <Clock size={20} className="text-nature-green-dark/30" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl bg-nature-cream text-nature-brown font-black uppercase text-xs tracking-widest">Cancel</button>
                            <button 
                                type="submit" disabled={loading}
                                className="flex-1 py-4 px-6 rounded-2xl bg-nature-green-dark text-white font-black uppercase text-xs tracking-widest hover:bg-nature-green shadow-lg shadow-nature-green/20 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Date"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);
