import { useState, useRef, useEffect } from 'react';
import { Clock, Plus, Minus, Trash2, Info, CalendarDays, Save, CheckCircle2, Loader2, ChevronDown, Copy } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface MonthlyScheduleLogProps {
    currentDate: Date;
    monthlySchedule: Record<string | number, number>;
    setMonthlySchedule: React.Dispatch<React.SetStateAction<Record<string | number, number>>>;
    specificSchedules: any[];
    onDeleteSpecific: (id: string) => void;
    onCopyFrom: (monthStr: string) => void;
    savedSchedules: any[];
    onAddSpecific: () => void;
    onSave: () => void;
    saving: boolean;
    success: boolean;
}

export const MonthlyScheduleLog = ({
    currentDate, monthlySchedule, setMonthlySchedule, specificSchedules,
    onDeleteSpecific, onCopyFrom, savedSchedules, onAddSpecific, onSave, saving, success
}: MonthlyScheduleLogProps) => {
    const [isCopyMenuOpen, setIsCopyMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const weekdays = [
        { id: 1, name: 'Monday' }, { id: 2, name: 'Tuesday' }, { id: 3, name: 'Wednesday' },
        { id: 4, name: 'Thursday' }, { id: 5, name: 'Friday' }, { id: 6, name: 'Saturday' },
        { id: 0, name: 'Sunday' }
    ];

    const updateDayHours = (day: number, delta: number) => {
        setMonthlySchedule(prev => ({
            ...prev,
            [day]: Math.max(0, Math.min(24, (prev[day] || 0) + delta))
        }));
    };

    // Filter out the current month from copy options
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
    const otherSchedules = savedSchedules
        .filter(s => s.month !== currentMonthStr)
        .sort((a, b) => b.month.localeCompare(a.month));

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsCopyMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative rounded-[2.5rem] py-10 px-6 overflow-hidden bg-[#CD853F]/10 shadow-[inset_1px_1px_10px_rgba(75,44,32,0.2)] border border-[#4B2C20]/10">
            {/* Warm Golden Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#DAA520]/10 to-transparent pointer-events-none" />
            
            {/* Content Wrapper */}
            <div className="relative z-30">
                {/* Specific Schedules Section */}
                <div className="px-2 mb-10">
                    <div className="flex items-center justify-between mb-5 px-2">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={18} className="text-[#4B2C20] opacity-40" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#4B2C20] opacity-50">Specific Schedules</span>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(75, 44, 32, 0.08)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onAddSpecific} 
                            className="px-4 py-2 bg-[#4B2C20]/5 text-[#4B2C20]/70 rounded-full border border-[#4B2C20]/15 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            <Plus size={14} className="inline mr-1" /> New Date
                        </motion.button>
                    </div>

                    <div className="space-y-4">
                        {specificSchedules.length === 0 ? (
                            <div className="text-center py-6 bg-[#4B2C20]/5 rounded-2xl border border-dashed border-[#4B2C20]/10">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B2C20]/30 italic">No specific dates added</span>
                            </div>
                        ) : specificSchedules.map((item) => (
                            <motion.div 
                                key={item.id} 
                                className="relative flex items-center justify-between p-4 bg-[#4B2C20]/5 rounded-2xl border-t border-[#4B2C20]/5 shadow-[inset_1px_1px_4px_rgba(75,44,32,0.1)]"
                            >
                                <div className="flex flex-col">
                                    <span className="text-base font-black text-[#4B2C20]/90 tracking-tighter">{format(parseISO(item.date), 'MMMM d')}</span>
                                    <span className="text-[9px] font-black text-[#4B2C20]/40 uppercase tracking-widest">{format(parseISO(item.date), 'EEEE')}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#FDF5E6]/50 px-4 py-1.5 rounded-xl border border-[#4B2C20]/10 shadow-[inset_0_1px_2px_rgba(75,44,32,0.05)]">
                                        <span className="text-base font-black text-[#4B2C20]/90">{item.hours}h</span>
                                    </div>
                                    <button onClick={() => onDeleteSpecific(item.id)} className="p-2 text-[#4B2C20]/20 hover:text-rose-800 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Weekly Routine Section */}
                <div className="px-2 mb-10">
                    <div className="flex items-center justify-between mb-6 px-2 pt-6 border-t border-[#4B2C20]/10">
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-[#4B2C20] opacity-40" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#4B2C20] opacity-50">Weekly Routine</span>
                        </div>
                        
                        {/* Custom Artisanal Dropdown */}
                        <div className="relative" ref={menuRef}>
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(75, 44, 32, 0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsCopyMenuOpen(!isCopyMenuOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#4B2C20]/5 text-[#4B2C20]/70 rounded-full border border-[#4B2C20]/15 shadow-sm transition-all relative z-50"
                            >
                                <Copy size={14} className="opacity-60" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Copy From...</span>
                                <motion.div animate={{ rotate: isCopyMenuOpen ? 180 : 0 }}>
                                    <ChevronDown size={14} className="opacity-40" />
                                </motion.div>
                            </motion.button>

                            <AnimatePresence>
                                {isCopyMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 5, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className="absolute right-0 top-full w-48 mt-2 py-2 bg-[#FDF5E6] rounded-2xl shadow-[0_15px_30px_rgba(75,44,32,0.4)] border border-[#4B2C20]/20 z-50 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply" />
                                        
                                        {otherSchedules.length === 0 ? (
                                            <div className="px-4 py-3 text-[10px] font-bold text-[#4B2C20]/40 uppercase tracking-widest text-center italic">No history found</div>
                                        ) : otherSchedules.map((s) => (
                                            <motion.button
                                                whileHover={{ x: 5, backgroundColor: 'rgba(205, 133, 63, 0.1)' }}
                                                key={s.id}
                                                onClick={() => {
                                                    onCopyFrom(s.month);
                                                    setIsCopyMenuOpen(false);
                                                }}
                                                className="w-full px-4 py-2.5 text-left flex flex-col gap-0.5 border-b border-[#4B2C20]/5 last:border-0"
                                            >
                                                <span className="text-[11px] font-black text-[#4B2C20]/80 uppercase tracking-wider">{format(parseISO(s.month), 'MMMM yyyy')}</span>
                                                <span className="text-[8px] font-bold text-[#4B2C20]/40 uppercase tracking-[0.2em]">Click to apply</span>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {weekdays.map((day) => (
                            <motion.div 
                                key={day.id} 
                                className="relative flex items-center justify-between p-3 pl-6 bg-[#4B2C20]/5 rounded-[2rem] border-t border-[#4B2C20]/5 shadow-[inset_1px_1px_4px_rgba(75,44,32,0.1)]"
                            >
                                <span className="text-base font-black text-[#4B2C20]/90 tracking-tighter">{day.name}</span>
                                <div className="flex items-center gap-3">
                                    <motion.button 
                                        whileHover={{ scale: 1.08, y: -1 }}
                                        whileTap={{ scale: 0.92, y: 1 }}
                                        onClick={() => updateDayHours(day.id, -0.5)} 
                                        className="w-10 h-10 rounded-full bg-[#CD853F]/30 text-[#4B2C20]/70 flex items-center justify-center shadow-[0_3px_8px_rgba(75,44,32,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[#4B2C20]/15"
                                    >
                                        <Minus size={16} strokeWidth={3} />
                                    </motion.button>
                                    
                                    <div className="w-14 h-12 flex items-center justify-center bg-[#FDF5E6]/50 rounded-xl border border-[#4B2C20]/10 shadow-[inset_0_1px_2px_rgba(75,44,32,0.1)] overflow-hidden">
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={(monthlySchedule[day.id] ?? monthlySchedule[day.id.toString()] ?? 0) === 0 ? '' : (monthlySchedule[day.id] ?? monthlySchedule[day.id.toString()])}
                                            onChange={(e) => setMonthlySchedule(prev => ({ ...prev, [day.id]: parseFloat(e.target.value) || 0 }))}
                                            onFocus={(e) => e.target.select()}
                                            className="w-full text-center bg-transparent border-none text-xl font-black text-[#4B2C20]/90 focus:outline-none placeholder:text-[#4B2C20]/20"
                                            placeholder="0"
                                        />
                                    </div>

                                    <motion.button 
                                        whileHover={{ scale: 1.08, y: -1 }}
                                        whileTap={{ scale: 0.92, y: 1 }}
                                        onClick={() => updateDayHours(day.id, 0.5)} 
                                        className="w-10 h-10 rounded-full bg-[#CD853F]/30 text-[#4B2C20]/70 flex items-center justify-center shadow-[0_3px_8px_rgba(75,44,32,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[#4B2C20]/15"
                                    >
                                        <Plus size={16} strokeWidth={3} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Master Save Button - Premium Wood Token */}
                <div className="px-2 mt-6">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98, y: 2 }}
                        onClick={onSave}
                        disabled={saving}
                        className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all font-black uppercase tracking-[0.2em] text-xs relative overflow-hidden border-b-4 border-[#3E2723]/30 ${
                            success 
                                ? 'bg-[#4A7C59] text-[#FDF5E6] shadow-[0_10px_20px_rgba(74,124,89,0.3)]' 
                                : 'bg-[#4B2C20] text-[#FDF5E6] shadow-[0_15px_30px_rgba(75,44,32,0.3)] hover:bg-[#5D3729]'
                        }`}
                    >
                        <div className="absolute inset-0 opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-overlay" />
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10" />
                        
                        {saving ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : success ? (
                            <><CheckCircle2 size={20} /> Plan Carved!</>
                        ) : (
                            <><Save size={20} /> Save for {format(currentDate, 'MMMM')}</>
                        )}
                    </motion.button>
                </div>

                {/* Footer Info */}
                <div className="pt-10 px-2">
                    <div className="flex items-start gap-3 bg-[#4B2C20]/5 p-5 rounded-[2rem] border border-[#4B2C20]/5">
                        <Info size={18} className="text-[#4B2C20]/20 mt-0.5 shrink-0" />
                        <p className="text-[11px] font-bold text-[#4B2C20]/30 leading-relaxed uppercase tracking-widest italic">
                            This schedule helps you visualize how much time you'll gain if you stick to your routine. Total hours are calculated by counting exactly how many times each day occurs in {format(currentDate, 'MMMM')}.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
