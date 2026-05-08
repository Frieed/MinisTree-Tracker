import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { X, Clock, CheckCircle2, Trash2, Loader2, Plus, Heart } from 'lucide-react';
import { createPortal } from 'react-dom';

interface LogModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDay: Date | null;
    hours: number;
    setHours: (h: number) => void;
    minutes: number;
    setMinutes: (m: number) => void;
    credit: number;
    setCredit: (c: number) => void;
    onSave: () => void;
    onDelete: () => void;
    loading: boolean;
    hasExistingReport: boolean;
    error?: string | null;
}

export const LogModal = ({ 
    isOpen, onClose, selectedDay, hours, setHours, minutes, setMinutes, 
    credit, setCredit, onSave, onDelete, loading, hasExistingReport, error 
}: LogModalProps) => {
    if (typeof document === 'undefined') return null;
    return createPortal(
        <AnimatePresence>
            {isOpen && selectedDay && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-nature-brown-dark/30 backdrop-blur-[2px] z-[2000]" />
                    <motion.div 
                        initial={{ y: '100%' }} 
                        animate={{ y: 0 }} 
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ willChange: 'transform' }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] px-5 pt-4 pb-5 z-[2100] shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="w-10 h-1 bg-nature-cream rounded-full mx-auto mb-3" />
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-black text-nature-brown-dark tracking-tight">{format(selectedDay, 'EEEE, MMM do')}</h3>
                                <p className="text-nature-brown font-bold text-[9px] uppercase tracking-widest">Daily Activity Log</p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-nature-cream hover:bg-nature-brown/10 rounded-full text-nature-brown transition-colors"><X size={16} /></button>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-nature-brown-light flex items-center gap-1.5"><Clock size={10} /> Time Spent</label>
                                <div className="flex gap-3">
                                    <div className="flex-1 text-center">
                                        <input 
                                            type="number" 
                                            value={hours === 0 ? '' : hours} 
                                            onChange={(e) => setHours(e.target.value === '' ? 0 : Number(e.target.value))} 
                                            onFocus={(e) => e.target.select()}
                                            className="w-full bg-nature-cream-light rounded-2xl py-3 text-xl font-black text-center focus:ring-4 ring-nature-green/10 outline-none transition-all border border-nature-cream focus:placeholder:text-transparent" 
                                            placeholder="0" 
                                        />
                                        <span className="text-[8px] uppercase font-black text-nature-brown-light tracking-widest">Hours</span>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <input 
                                            type="number" 
                                            value={minutes === 0 ? '' : minutes} 
                                            onChange={(e) => setMinutes(e.target.value === '' ? 0 : Number(e.target.value))} 
                                            onFocus={(e) => e.target.select()}
                                            className="w-full bg-nature-cream-light rounded-2xl py-3 text-xl font-black text-center focus:ring-4 ring-nature-green/10 outline-none transition-all border border-nature-cream focus:placeholder:text-transparent" 
                                            placeholder="0" 
                                        />
                                        <span className="text-[8px] uppercase font-black text-nature-brown-light tracking-widest">Minutes</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-nature-brown-light flex items-center gap-1.5"><CheckCircle2 size={10} /> Credit Hours</label>
                                <div className="relative group">
                                    <input 
                                        type="number" 
                                        value={credit === 0 ? '' : credit} 
                                        onChange={(e) => setCredit(e.target.value === '' ? 0 : Number(e.target.value))} 
                                        onFocus={(e) => e.target.select()}
                                        className="w-full bg-nature-cream-light rounded-2xl py-3 text-xl font-black text-center focus:ring-4 ring-nature-green/10 outline-none transition-all border border-nature-cream focus:placeholder:text-transparent" 
                                        placeholder="0" 
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-nature-green"><Plus size={18} /></div>
                                </div>
                            </div>
                            {error && (
                                <motion.p 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center"
                                >
                                    {error}
                                </motion.p>
                            )}
                            <div className="flex gap-3 pt-1">
                                {hasExistingReport && (
                                    <button onClick={onDelete} className="p-3 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 transition-transform active:scale-95"><Trash2 size={20} /></button>
                                )}
                                <button onClick={onSave} disabled={loading} className="flex-1 btn-primary h-11 text-sm font-black uppercase tracking-[0.1em] shadow-lg shadow-nature-green/20">
                                    {loading ? <Loader2 className="animate-spin" /> : 'Save Activity'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

interface StudiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDate: Date;
    studies: number;
    setStudies: (s: number) => void;
    onSave: () => void;
    loading: boolean;
}

export const StudiesModal = ({ isOpen, onClose, currentDate, studies, setStudies, onSave, loading }: StudiesModalProps) => {
    if (typeof document === 'undefined') return null;
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-nature-brown-dark/30 backdrop-blur-[2px] z-[2000]" />
                    <motion.div 
                        initial={{ y: '100%' }} 
                        animate={{ y: 0 }} 
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ willChange: 'transform' }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 z-[2100] shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="w-12 h-1.5 bg-nature-cream rounded-full mx-auto mb-8" />
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-nature-brown-dark tracking-tight">{format(currentDate, 'MMMM yyyy')}</h3>
                                <p className="text-nature-brown font-bold text-[10px] uppercase tracking-widest">Monthly Bible Studies</p>
                            </div>
                            <button onClick={onClose} className="p-3 bg-nature-cream hover:bg-nature-brown/10 rounded-full text-nature-brown transition-colors"><X size={20} /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-widest text-nature-brown-light flex items-center gap-2"><Heart size={12} className="text-nature-green" /> Total Bible Studies</label>
                                <input 
                                    type="number" 
                                    value={studies === 0 ? '' : studies} 
                                    onChange={(e) => setStudies(e.target.value === '' ? 0 : Number(e.target.value))} 
                                    onFocus={(e) => e.target.select()}
                                    className="w-full bg-nature-cream-light rounded-2xl py-6 text-3xl font-black text-nature-green-dark text-center focus:ring-4 ring-nature-green/10 outline-none border border-nature-cream focus:placeholder:text-transparent" 
                                    placeholder="0" 
                                />
                            </div>
                            <button onClick={onSave} disabled={loading} className="w-full bg-nature-green text-white rounded-[2rem] h-14 text-sm font-black uppercase tracking-[0.1em] shadow-lg shadow-nature-green/20">
                                {loading ? <Loader2 className="animate-spin" /> : 'Save Studies'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
