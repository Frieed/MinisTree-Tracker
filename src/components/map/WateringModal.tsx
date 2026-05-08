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
    onSave: () => void;
    saving: boolean;
}

export const WateringModal = ({
    isOpen, onClose, visitName, lastVisited, setLastVisited,
    newGiven, setNewGiven, newQuestions, setNewQuestions,
    newNotes, setNewNotes, onSave, saving
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
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] px-6 pt-4 pb-8 z-[1100] shadow-2xl min-h-[60vh] max-h-[90vh] overflow-y-auto"
                    >
                        <div className="w-12 h-1.5 bg-nature-cream rounded-full mx-auto mb-6" />
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-3xl font-black text-nature-brown-dark tracking-tight">{visitName}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="px-2 py-0.5 bg-water-blue/10 rounded-full border border-water-blue/20">
                                        <p className="text-[9px] uppercase font-black text-water-blue tracking-widest">Nourish & Update</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 bg-nature-cream hover:bg-nature-brown/10 rounded-full text-nature-brown transition-colors"><X size={20} /></button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light flex items-center gap-2"><Calendar size={12} /> Date of Visit</label>
                                <input type="date" value={lastVisited} onChange={(e) => setLastVisited(e.target.value)} className="w-full bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl font-bold text-nature-brown-dark outline-none focus:border-water-blue transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light flex items-center gap-2"><BookOpen size={12} /> Placed Literature</label>
                                <input type="text" value={newGiven} onChange={(e) => setNewGiven(e.target.value)} className="w-full bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl font-bold text-nature-brown-dark outline-none focus:border-water-blue transition-all" placeholder="E.g. Enjoy Life Forever!" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light flex items-center gap-2"><HelpCircle size={12} /> Next Topic / Question</label>
                                <input type="text" value={newQuestions} onChange={(e) => setNewQuestions(e.target.value)} className="w-full bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl font-bold text-nature-brown-dark outline-none focus:border-water-blue transition-all" placeholder="E.g. Why does God allow suffering?" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light flex items-center gap-2"><FileText size={12} /> Conversation Remarks</label>
                                <textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="w-full bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl font-bold text-nature-brown-dark outline-none focus:border-water-blue transition-all h-24" placeholder="Briefly summarize what was discussed..." />
                            </div>

                            <button
                                onClick={onSave} disabled={saving}
                                className="w-full h-16 bg-water-blue text-white rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-water-blue/20 font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <><Droplets size={20} /> Save Update & Nourish</>}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
