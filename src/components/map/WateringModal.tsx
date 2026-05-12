import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, BookOpen, HelpCircle, FileText, Loader2, Droplets } from 'lucide-react';
import { createPortal } from 'react-dom';

interface WateringModalProps {
    isOpen: boolean;
    onClose: () => void;
    visitName: string;
    lastVisited: string;
    setLastVisited: (d: string) => void;
    newGiven: string;
    setNewGiven: (g: string) => void;
    newQuestions: string;
    setNewQuestions: (q: string) => void;
    newNotes: string;
    setNewNotes: (n: string) => void;
    isAttempt: boolean;
    setIsAttempt: (a: boolean) => void;
    attemptReason: string;
    setAttemptReason: (r: string) => void;
    onSave: () => void;
    saving: boolean;
}

export const WateringModal = ({
    isOpen, onClose, visitName, lastVisited, setLastVisited,
    newGiven, setNewGiven, newQuestions, setNewQuestions,
    newNotes, setNewNotes, isAttempt, setIsAttempt, 
    attemptReason, setAttemptReason, onSave, saving
}: WateringModalProps) => {
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
                        className="fixed inset-0 bg-nature-brown-dark/40 backdrop-blur-[2px] z-[1000]" 
                    />
                    <motion.div 
                        initial={{ y: '100%' }} 
                        animate={{ y: 0 }} 
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ willChange: 'transform' }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-[1100] shadow-2xl max-h-[95svh] flex flex-col"
                    >
                        {/* Compact Header with Save Button */}
                        <div className="px-5 py-4 border-b border-nature-cream flex justify-between items-center bg-water-blue/5 rounded-t-[2rem] shrink-0">
                            <div className="flex-1 min-w-0 mr-3">
                                <h3 className="text-base font-black text-nature-brown-dark truncate">{visitName}</h3>
                                <p className="text-[8px] font-bold text-water-blue uppercase tracking-widest">{isAttempt ? 'Log Attempted Visit' : 'Nourish & Update'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={onSave} 
                                    disabled={saving} 
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 ${isAttempt ? 'bg-amber-500 shadow-amber-500/20' : 'bg-water-blue shadow-water-blue/20'} text-white`}
                                >
                                    {saving ? <Loader2 className="animate-spin" size={12} /> : <><Droplets size={12} /> Save</>}
                                </button>
                                <button onClick={onClose} className="p-2 bg-nature-cream hover:bg-nature-brown/10 rounded-xl text-nature-brown transition-colors"><X size={16} /></button>
                            </div>
                        </div>

                        {/* Highly Compact Body */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 space-y-3">
                            {/* Attempt Toggle */}
                            <div className="flex items-center justify-between p-3 bg-nature-cream-light/30 rounded-2xl border border-nature-cream/50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light flex items-center gap-2">
                                    <div className={`p-1 rounded-md ${isAttempt ? 'bg-amber-100 text-amber-600' : 'bg-nature-brown/5 text-nature-brown-light'}`}>
                                        <Droplets size={12} />
                                    </div>
                                    Attempted Only?
                                </label>
                                <button 
                                    onClick={() => setIsAttempt(!isAttempt)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${isAttempt ? 'bg-amber-400' : 'bg-nature-cream'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${isAttempt ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 bg-nature-cream-light/50 p-3 rounded-2xl border border-nature-cream/50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light flex-1 flex items-center gap-2"><Calendar size={12} /> Date of {isAttempt ? 'Attempt' : 'Visit'}</label>
                                <div className="w-36">
                                    <input 
                                        type="date" 
                                        value={lastVisited} 
                                        onChange={(e) => setLastVisited(e.target.value)} 
                                        className="w-full bg-white rounded-xl py-2 px-2 text-sm font-bold text-nature-brown-dark outline-none border border-nature-cream focus:border-water-blue" 
                                    />
                                </div>
                            </div>

                            {!isAttempt ? (
                                <>
                                    <div className="flex flex-col gap-1 bg-nature-cream-light/30 p-3 rounded-2xl border border-nature-cream/50">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-nature-brown-light flex items-center gap-2"><BookOpen size={12} /> Placed Literature</label>
                                        <input 
                                            type="text" 
                                            value={newGiven} 
                                            onChange={(e) => setNewGiven(e.target.value)} 
                                            className="w-full bg-white rounded-xl py-2 px-3 text-sm font-bold text-nature-brown-dark outline-none border border-nature-cream focus:border-water-blue focus:placeholder:text-transparent" 
                                            placeholder="E.g. Enjoy Life Forever!" 
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1 bg-nature-cream-light/30 p-3 rounded-2xl border border-nature-cream/50">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-nature-brown-light flex items-center gap-2"><HelpCircle size={12} /> Next Topic</label>
                                        <input 
                                            type="text" 
                                            value={newQuestions} 
                                            onChange={(e) => setNewQuestions(e.target.value)} 
                                            className="w-full bg-white rounded-xl py-2 px-3 text-sm font-bold text-nature-brown-dark outline-none border border-nature-cream focus:border-water-blue focus:placeholder:text-transparent" 
                                            placeholder="E.g. Why allow suffering?" 
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-1 bg-nature-cream-light/30 p-3 rounded-2xl border border-nature-cream/50">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-nature-brown-light flex items-center gap-2"><HelpCircle size={12} /> Reason for failed attempt</label>
                                    <input 
                                        type="text" 
                                        value={attemptReason} 
                                        onChange={(e) => setAttemptReason(e.target.value)} 
                                        className="w-full bg-white rounded-xl py-2 px-3 text-sm font-bold text-nature-brown-dark outline-none border border-nature-cream focus:border-amber-400 focus:placeholder:text-transparent" 
                                        placeholder="E.g. Not at home, busy..." 
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-1 bg-nature-cream-light/30 p-3 rounded-2xl border border-nature-cream/50">
                                <label className="text-[9px] font-black uppercase tracking-widest text-nature-brown-light flex items-center gap-2"><FileText size={12} /> Visit Notes</label>
                                <textarea 
                                    value={newNotes} 
                                    onChange={(e) => setNewNotes(e.target.value)} 
                                    className={`w-full bg-white rounded-xl py-2 px-3 text-sm font-bold text-nature-brown-dark outline-none border border-nature-cream ${isAttempt ? 'focus:border-amber-400' : 'focus:border-water-blue'} h-20 resize-none focus:placeholder:text-transparent`}
                                    placeholder="Brief summary..." 
                                />
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
