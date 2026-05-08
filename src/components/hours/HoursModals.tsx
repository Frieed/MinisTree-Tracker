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
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-[2100] shadow-2xl max-h-[95svh] flex flex-col"
                    >
                        {/* Compact Header with Save Button */}
                        <div className="px-5 py-4 border-b border-nature-cream flex justify-between items-center bg-nature-cream/10 rounded-t-[2rem] shrink-0">
                            <div className="flex-1 min-w-0 mr-3">
                                <h3 className="text-base font-black text-nature-brown-dark truncate">{format(selectedDay, 'MMM do, yyyy')}</h3>
                                <p className="text-[8px] font-bold text-nature-brown-light uppercase tracking-widest">Update Activity</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={onSave} 
                                    disabled={loading} 
                                    className="bg-nature-green text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-nature-green/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={12} /> : <><CheckCircle2 size={12} /> Save</>}
                                </button>
                                <button onClick={onClose} className="p-2 bg-nature-cream hover:bg-nature-brown/10 rounded-xl text-nature-brown transition-colors"><X size={16} /></button>
                            </div>
                        </div>

                        {/* Highly Compact Body */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 space-y-3">
                            <div className="flex items-center gap-4 bg-nature-cream-light/50 p-3 rounded-2xl border border-nature-cream/50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light flex-1 flex items-center gap-2"><Clock size={12} /> Time Spent</label>
                                <div className="flex gap-2 w-48">
                                    <div className="flex-1 relative">
                                        <input 
                                            type="text" inputMode="decimal"
                                            value={hours === 0 ? '' : hours} 
                                            onChange={(e) => setHours(e.target.value === '' ? 0 : Number(e.target.value))} 
                                            onFocus={(e) => e.target.select()}
                                            className="w-full bg-white rounded-xl py-2 px-2 text-lg font-black text-center focus:ring-2 ring-nature-green/20 outline-none border border-nature-cream focus:placeholder:text-transparent" 
                                            placeholder="0" 
                                        />
                                        <span className="absolute -bottom-4 left-0 right-0 text-[7px] uppercase font-black text-nature-brown-light text-center">Hours</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <input 
                                            type="text" inputMode="decimal"
                                            value={minutes === 0 ? '' : minutes} 
                                            onChange={(e) => setMinutes(e.target.value === '' ? 0 : Number(e.target.value))} 
                                            onFocus={(e) => e.target.select()}
                                            className="w-full bg-white rounded-xl py-2 px-2 text-lg font-black text-center focus:ring-2 ring-nature-green/20 outline-none border border-nature-cream focus:placeholder:text-transparent" 
                                            placeholder="0" 
                                        />
                                        <span className="absolute -bottom-4 left-0 right-0 text-[7px] uppercase font-black text-nature-brown-light text-center">Mins</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-nature-cream-light/50 p-3 rounded-2xl border border-nature-cream/50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light flex-1 flex items-center gap-2"><Plus size={12} className="text-nature-green" /> Credit Hours</label>
                                <div className="w-20">
                                    <input 
                                        type="text" inputMode="decimal"
                                        value={credit === 0 ? '' : credit} 
                                        onChange={(e) => setCredit(e.target.value === '' ? 0 : Number(e.target.value))} 
                                        onFocus={(e) => e.target.select()}
                                        className="w-full bg-white rounded-xl py-2 px-2 text-lg font-black text-center focus:ring-2 ring-nature-green/20 outline-none border border-nature-cream text-nature-green-dark focus:placeholder:text-transparent" 
                                        placeholder="0" 
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest text-center pt-2">{error}</p>
                            )}

                            {hasExistingReport && (
                                <button 
                                    onClick={onDelete} 
                                    className="w-full py-3 mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-50/50 rounded-xl border border-rose-100 hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={12} /> Remove Entry
                                </button>
                            )}
                        </div>
                        
                        {/* Bottom Spacer for Keyboard */}
                        <div className="h-6 bg-white shrink-0" />
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
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-[2100] shadow-2xl max-h-[95svh] flex flex-col"
                    >
                        {/* Compact Header with Save Button */}
                        <div className="px-5 py-4 border-b border-nature-cream flex justify-between items-center bg-nature-cream/10 rounded-t-[2rem] shrink-0">
                            <div className="flex-1 min-w-0 mr-3">
                                <h3 className="text-base font-black text-nature-brown-dark truncate">{format(currentDate, 'MMMM yyyy')}</h3>
                                <p className="text-[8px] font-bold text-nature-brown-light uppercase tracking-widest">Monthly Studies</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={onSave} 
                                    disabled={loading} 
                                    className="bg-nature-green text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-nature-green/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={12} /> : <><Heart size={12} /> Save</>}
                                </button>
                                <button onClick={onClose} className="p-2 bg-nature-cream hover:bg-nature-brown/10 rounded-xl text-nature-brown transition-colors"><X size={16} /></button>
                            </div>
                        </div>

                        {/* Highly Compact Body */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 space-y-4">
                            <div className="flex items-center gap-4 bg-nature-cream-light/50 p-4 rounded-2xl border border-nature-cream/50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light flex-1 flex items-center gap-2"><Heart size={12} className="text-nature-green" /> Total Bible Studies</label>
                                <div className="w-24">
                                    <input 
                                        type="text" inputMode="decimal"
                                        value={studies === 0 ? '' : studies} 
                                        onChange={(e) => setStudies(e.target.value === '' ? 0 : Number(e.target.value))} 
                                        onFocus={(e) => e.target.select()}
                                        className="w-full bg-white rounded-xl py-3 px-2 text-2xl font-black text-center focus:ring-2 ring-nature-green/20 outline-none border border-nature-cream text-nature-green-dark focus:placeholder:text-transparent" 
                                        placeholder="0" 
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Bottom Spacer for Keyboard */}
                        <div className="h-6 bg-white shrink-0" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
