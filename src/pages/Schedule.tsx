import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import { useServiceYear } from '../context/ServiceYearContext';
import { useScheduleData } from '../hooks/useScheduleData';
import { MonthlyScheduleLog } from '../components/schedule/MonthlyScheduleLog';

import { SpecificScheduleModal } from '../components/schedule/SpecificScheduleModal';
import { useUI } from '../context/UIContext';

import { CountUp } from '../components/common/CountUp';

const Schedule = () => {
    const { setIsModalOpen: setGlobalModalOpen, setHasUnsavedChanges } = useUI();
    const { startDate: syStart, endDate: syEnd } = useServiceYear();
    const {
        currentDate, setCurrentDate, baseSchedule: monthlySchedule, setBaseSchedule: setMonthlySchedule,
        dynamicMonthlyGoal, allSchedules, specificSchedules,
        projectedTotal, loading, saving, success,
        saveMonthlySchedule, saveSpecificSchedule, deleteSpecificSchedule, copyFromMonth
    } = useScheduleData(new Date());

    const [isSpecificModalOpen, setIsSpecificModalOpen] = useState(false);
    const [newSpecificDate, setNewSpecificDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [newSpecificHours, setNewSpecificHours] = useState('0');
    const [isSpecificSaving, setIsSpecificSaving] = useState(false);

    useEffect(() => {
        if (isSpecificModalOpen) {
            setGlobalModalOpen(true);
            return () => setGlobalModalOpen(false);
        }
    }, [isSpecificModalOpen, setGlobalModalOpen]);

    const handleSaveSpecific = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSpecificSaving(true);
        const { error } = await saveSpecificSchedule(newSpecificDate, parseFloat(newSpecificHours));
        if (!error) {
            setIsSpecificModalOpen(false);
            setNewSpecificHours('0');
        }
        setIsSpecificSaving(false);
    };

    const [lastSavedSchedule, setLastSavedSchedule] = useState<Record<string | number, number> | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Track original state to detect changes
    useEffect(() => {
        if (loading) {
            setLastSavedSchedule(null);
            setHasChanges(false);
            setHasUnsavedChanges(false);
        } else if (monthlySchedule && !lastSavedSchedule) {
            setLastSavedSchedule({ ...monthlySchedule });
        }
    }, [loading, monthlySchedule, lastSavedSchedule, setHasUnsavedChanges]);

    // Compare current with last saved and update global UI state
    useEffect(() => {
        if (lastSavedSchedule && monthlySchedule) {
            // Normalize keys to strings for stable comparison
            const normalize = (obj: any) => {
                const normalized: any = {};
                Object.keys(obj).forEach(key => {
                    normalized[String(key)] = obj[key];
                });
                return JSON.stringify(normalized);
            };

            const changed = normalize(lastSavedSchedule) !== normalize(monthlySchedule);
            setHasChanges(changed);
            setHasUnsavedChanges(changed);
        } else {
            setHasChanges(false);
            setHasUnsavedChanges(false);
        }
    }, [monthlySchedule, lastSavedSchedule, setHasUnsavedChanges]);

    // Clear global unsaved changes on unmount
    useEffect(() => {
        return () => setHasUnsavedChanges(false);
    }, [setHasUnsavedChanges]);

    // Navigation guard (Browser level)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    const handleSaveMonthly = async () => {
        const res = await saveMonthlySchedule();
        if (res.error === null) {
            setLastSavedSchedule({ ...monthlySchedule });
            setHasChanges(false);
            setHasUnsavedChanges(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-6 pb-24">
            {/* Header Section */}
            <section className="flex justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black text-nature-brown-dark tracking-tight flex items-center gap-1.5">
                        Monthly
                        <span className="text-nature-green">Plan</span>
                    </h2>
                    <p className="text-nature-brown font-medium mt-0.5">Carve your monthly plans into habits that help your garden grow.</p>
                </div>
                <div className="bg-nature-green/10 px-3 py-2 rounded-xl flex items-center gap-1.5 text-nature-green-dark shrink-0">
                    <CalendarDays size={14} />
                    <span className="font-black text-[10px] uppercase tracking-widest whitespace-nowrap">{format(currentDate, 'MMM yyyy')}</span>
                </div>
            </section>

            {/* Ultra-High Fidelity Skeuomorphic Artisanal Tablet */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-[2.5rem] shadow-[0_25px_50px_rgba(160,82,45,0.15)] overflow-hidden border border-nature-brown-light/30 min-h-[180px] bg-[#D7C4B1]"
            >
                {/* 3D Wood Carving Base Background */}
                <div className="absolute inset-0 bg-cover bg-no-repeat z-0 pointer-events-none" style={{ backgroundImage: `url('/images/carved_calendar.webp')`, backgroundPosition: 'center 45%', backgroundSize: 'cover' }} />
                <div className="absolute inset-0 bg-cover bg-no-repeat z-0 pointer-events-none sm:hidden" style={{ backgroundImage: `url('/images/carved_calendar.webp')`, backgroundPosition: '70% 45%', backgroundSize: 'cover' }} />

                {/* Tactile Fine Detail: Fiber Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1] bg-[url('https://www.transparenttextures.com/patterns/felt.png')] mix-blend-overlay" />

                {/* Tactile Fine Detail: Hand-Beveled Edge Highlight */}
                <div className="absolute inset-0 pointer-events-none z-[2] shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.1)] rounded-[2.5rem]" />

                {/* Compact Dual-Layered Artisanal Slate */}
                <div className="relative z-10 flex flex-col h-full min-h-[160px]">
                    {/* Top Navigator Row - Artisanal Bone/Light Wood Finish */}
                    <div className="p-2 px-4 sm:px-8 flex items-center justify-between bg-nature-cream-light/90 backdrop-blur-md border-b border-nature-brown-light/20 shadow-[0_2px_10px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]">
                        <motion.button
                            whileHover={{ y: -1, scale: 1.05 }}
                            whileTap={{ y: 0.5, scale: 0.95 }}
                            onClick={() => {
                                const prev = subMonths(currentDate, 1);
                                if (prev >= startOfMonth(syStart)) setCurrentDate(prev);
                            }}
                            disabled={subMonths(startOfMonth(currentDate), 1) < startOfMonth(syStart)}
                            className="w-7 h-7 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-nature-brown-light/20 rounded-full flex items-center justify-center disabled:opacity-20 transition-all text-nature-brown-dark"
                        >
                            <ChevronLeft size={14} className="drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.1)]" />
                        </motion.button>

                        <div className="text-center">
                            <p className="font-black text-nature-green/50 text-[6px] uppercase tracking-[0.4em] mb-0.5">Monthly Plan</p>
                            <h3 className="font-black text-nature-brown-dark text-base tracking-tighter leading-none drop-shadow-[0_1px_0_white]">{format(currentDate, 'MMMM yyyy')}</h3>
                        </div>

                        <motion.button
                            whileHover={{ y: -1, scale: 1.05 }}
                            whileTap={{ y: 0.5, scale: 0.95 }}
                            onClick={() => {
                                const next = addMonths(currentDate, 1);
                                if (next <= syEnd) setCurrentDate(next);
                            }}
                            disabled={addMonths(startOfMonth(currentDate), 1) > startOfMonth(syEnd)}
                            className="w-7 h-7 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-nature-brown-light/20 rounded-full flex items-center justify-center disabled:opacity-20 transition-all text-nature-brown-dark"
                        >
                            <ChevronRight size={14} className="drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.1)]" />
                        </motion.button>
                    </div>

                    {/* Main Content Body - CRYSTAL CLEAR with Carved Separator */}
                    <div className="flex-1 px-5 sm:px-8 pt-2 pb-4 relative bg-white/0 rounded-b-[2.5rem] overflow-hidden">
                        {/* Carved Groove Separator Shadow */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-black/5 shadow-[0_1px_1px_rgba(255,255,255,0.5)]" />

                        <div className="space-y-1 sm:space-y-2 relative z-10 w-full max-w-[85%] sm:max-w-[50%]">
                            {/* Main Stat Label */}
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-nature-green-dark shadow-[0_0_6px_rgba(74,124,89,0.6),inset_0_1px_1px_rgba(0,0,0,0.2)]" />
                                <p className="text-nature-brown-dark/80 text-[10px] font-black uppercase tracking-[0.4em] [text-shadow:0_1px_1px_rgba(255,255,255,0.8)]">Projected Schedule</p>
                            </div>

                            {/* Hero Stat - Warmer Engraved Artisanal Typography */}
                            <div className="flex flex-col">
                                <h4 className="text-5xl sm:text-6xl font-black tracking-tighter text-nature-brown-dark leading-[0.85] [text-shadow:_-1.5px_-1.5px_2px_rgba(78,52,46,0.5),_1px_1px_1.5px_rgba(255,255,255,0.4),_0_0.5px_0.5px_rgba(78,52,46,0.2)]">
                                    <CountUp value={projectedTotal} decimals={1} />
                                </h4>
                                <div className="flex items-baseline gap-2 mt-1 sm:mt-2">
                                    <span className="text-xl sm:text-2xl text-nature-brown-dark/90 font-black italic tracking-tighter [text-shadow:_-1px_-1px_1.5px_rgba(78,52,46,0.4),_1px_1px_1px_rgba(255,255,255,0.3)]">/ {dynamicMonthlyGoal}</span>
                                    <span className="text-[8px] sm:text-[10px] font-black tracking-[0.3em] text-nature-brown-dark/70 [text-shadow:_-0.5px_-0.5px_1px_rgba(78,52,46,0.3),_0.5px_0.5px_0.5px_rgba(255,255,255,0.2)] whitespace-nowrap">MONTH GOAL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Monthly Schedule Inputs */}
            <MonthlyScheduleLog
                currentDate={currentDate}
                monthlySchedule={monthlySchedule}
                setMonthlySchedule={setMonthlySchedule}
                specificSchedules={specificSchedules}
                onDeleteSpecific={deleteSpecificSchedule}
                onCopyFrom={copyFromMonth}
                savedSchedules={allSchedules}
                onAddSpecific={() => {
                    setNewSpecificDate(format(currentDate, 'yyyy-MM-01'));
                    setIsSpecificModalOpen(true);
                }}
                onSave={handleSaveMonthly}
                saving={saving}
                success={success}
                hasChanges={hasChanges}
            />


            <SpecificScheduleModal
                isOpen={isSpecificModalOpen} onClose={() => setIsSpecificModalOpen(false)} currentDate={currentDate}
                date={newSpecificDate} setDate={setNewSpecificDate} hours={newSpecificHours} setHours={setNewSpecificHours}
                onSave={handleSaveSpecific} loading={isSpecificSaving}
            />
        </div>
    );
};

export default Schedule;
