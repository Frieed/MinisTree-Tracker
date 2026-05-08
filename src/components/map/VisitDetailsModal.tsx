import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Clock, Edit3, Trash2, Droplets, BookOpen, HelpCircle, FileText, Loader2, Heart } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { WateringCan } from './MapIcons';

interface VisitDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    visit: any;
    logs: any[];
    loadingLogs: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onWater: () => void;
    onToggleStudy: () => void;
    onDeleteLog: (logId: string) => void;
}

export const VisitDetailsModal = ({
    isOpen, onClose, visit, logs, loadingLogs, onEdit, onDelete, onWater, onToggleStudy, onDeleteLog
}: VisitDetailsModalProps) => (
    <AnimatePresence>
        {isOpen && visit && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-nature-brown-dark/40 backdrop-blur-sm z-[1000]" />
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className={`fixed bottom-0 left-0 right-0 ${visit.is_bible_study ? 'bg-[#F0F7F1]' : 'bg-[#FDFBF7]'} rounded-t-[3rem] min-h-[60vh] max-h-[90vh] overflow-y-auto z-[1100] shadow-2xl transition-colors duration-500`}>
                    <div className="w-12 h-1.5 bg-nature-brown/10 rounded-full mx-auto my-4" />
                    
                    <div className="px-6 space-y-6 pb-8">
                        {/* Hero Header */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-3xl font-black text-nature-brown-dark tracking-tight">{visit.name}</h3>
                                </div>
                                <div className="flex items-center gap-2 text-nature-brown-light font-medium text-sm">
                                    <MapPin size={14} className="text-nature-green" />
                                    <span>{visit.address || 'No address provided'}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={onEdit} className="p-3 bg-white border border-nature-cream rounded-2xl text-nature-brown-light hover:text-nature-green transition-all shadow-sm"><Edit3 size={18} /></button>
                                <button onClick={onDelete} className="p-3 bg-white border border-nature-cream rounded-2xl text-nature-brown-light hover:text-rose-500 transition-all shadow-sm"><Trash2 size={18} /></button>
                                <button onClick={onClose} className="p-3 bg-nature-cream rounded-2xl text-nature-brown transition-all"><X size={18} /></button>
                            </div>
                        </div>

                        {/* Overall Remarks */}
                        {visit.notes && (
                            <div className="bg-white p-4 rounded-[2rem] border border-nature-cream shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-nature-brown/5 text-nature-brown rounded-lg"><FileText size={14} /></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light">Remarks</h4>
                                </div>
                                <p className="text-sm font-medium text-nature-brown-dark whitespace-pre-wrap">{visit.notes}</p>
                            </div>
                        )}

                        {/* Availability Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-4 rounded-[2rem] border border-nature-cream shadow-sm flex items-start gap-3">
                                <div className="p-2 bg-nature-green/10 text-nature-green rounded-xl shrink-0"><Calendar size={16} /></div>
                                <div className="flex-1 min-w-0"><p className="text-[8px] font-black uppercase text-nature-brown-light">Availability</p><p className="text-xs font-black text-nature-brown-dark break-words">{visit.availability_day?.replace(/,/g, ', ') || 'Any day'}</p></div>
                            </div>
                            <div className="bg-white p-4 rounded-[2rem] border border-nature-cream shadow-sm flex items-start gap-3">
                                <div className="p-2 bg-water-blue/10 text-water-blue rounded-xl shrink-0"><Clock size={16} /></div>
                                <div className="flex-1 min-w-0"><p className="text-[8px] font-black uppercase text-nature-brown-light">Best Time</p><p className="text-xs font-black text-nature-brown-dark break-words">{visit.availability_time || 'Any time'}</p></div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="space-y-3">
                            <button onClick={onWater} className="w-full h-16 bg-gradient-to-r from-water-blue to-nature-green text-white rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-water-blue/20 font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all">
                                <WateringCan size={24} /> Sprinkle this Seedling
                            </button>
                            <button onClick={onToggleStudy} className={`w-full py-4 rounded-[2rem] border-2 font-black uppercase tracking-widest text-[11px] transition-all flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-95 ${visit.is_bible_study ? 'border-nature-green bg-nature-green/10 text-nature-green' : 'border-nature-brown/20 bg-white text-nature-brown shadow-sm hover:border-nature-green hover:text-nature-green hover:bg-nature-green/5'}`}>
                                <Heart size={16} fill={visit.is_bible_study ? 'currentColor' : 'none'} />
                                {visit.is_bible_study ? 'MARKED AS BIBLE STUDY' : 'Mark as Bible Study'}
                            </button>
                        </div>

                        {/* History Logs */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black uppercase tracking-widest text-nature-brown-light pl-1">Visit History</h4>
                                {loadingLogs && <Loader2 size={14} className="animate-spin text-nature-green" />}
                            </div>

                            <div className="space-y-3">
                                {logs.length > 0 ? logs.map((log) => (
                                    <div key={log.id} className="bg-white p-4 rounded-[2rem] border-2 border-nature-cream shadow-sm space-y-3">
                                        <div className="flex justify-between items-center border-b border-nature-cream/50 pb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-nature-cream flex items-center justify-center text-nature-brown font-black text-[10px]">{format(parseISO(log.visit_date), 'dd')}</div>
                                                <p className="text-sm font-black text-nature-brown-dark">{format(parseISO(log.visit_date), 'MMMM yyyy')}</p>
                                            </div>
                                            <button onClick={() => onDeleteLog(log.id)} className="p-2 text-nature-brown-light hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {log.literature && <div className="flex items-start gap-2"><BookOpen size={12} className="text-nature-green mt-0.5" /><p className="text-xs text-nature-brown"><span className="font-bold">Placed:</span> {log.literature}</p></div>}
                                            {log.questions && <div className="flex items-start gap-2"><HelpCircle size={12} className="text-water-blue mt-0.5" /><p className="text-xs text-nature-brown"><span className="font-bold">Next:</span> {log.questions}</p></div>}
                                            {log.notes && <div className="flex items-start gap-2"><FileText size={12} className="text-nature-brown-light mt-0.5" /><p className="text-xs text-nature-brown-light italic">"{log.notes}"</p></div>}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center bg-white rounded-[2rem] border-2 border-dashed border-nature-cream">
                                        <Droplets size={32} className="mx-auto text-nature-cream mb-2" />
                                        <p className="text-xs font-bold text-nature-brown-light uppercase tracking-widest">No visit logs yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);
