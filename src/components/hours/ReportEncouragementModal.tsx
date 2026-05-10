import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowRight, Target, PartyPopper } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { CountUp } from '../common/CountUp';

import { createPortal } from 'react-dom';

interface ReportEncouragementModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalHours: number;
    dynamicGoal: number;
    nextMonthGoal: number;
    currentDate: Date;
}

export const ReportEncouragementModal: React.FC<ReportEncouragementModalProps> = ({
    isOpen,
    onClose,
    totalHours,
    dynamicGoal,
    nextMonthGoal,
    currentDate,
}) => {
    if (!isOpen) return null;

    const achievedGoal = totalHours >= dynamicGoal;
    const nextMonth = format(addMonths(currentDate, 1), 'MMMM');
    const isAugust = format(currentDate, 'MMMM') === 'August';

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    onClick={onClose}
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-sm overflow-hidden"
                >
                    {/* Glassmorphic Container */}
                    <div className="bg-[#2A3B2A]/90 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl overflow-hidden p-6 text-center">
                        
                        {/* Decorative Background Glows */}
                        <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#DAA520]/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                        {/* Icon Header */}
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: achievedGoal ? [0, -10, 10, -10, 10, 0] : 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#DAA520] to-[#CD853F] p-[2px] shadow-lg mb-4"
                        >
                            <div className="w-full h-full bg-[#1A251A] rounded-full flex items-center justify-center relative overflow-hidden">
                                {achievedGoal ? (
                                    <PartyPopper size={36} className="text-[#DAA520]" />
                                ) : (
                                    <Leaf size={36} className="text-[#4A7C59]" />
                                )}
                            </div>
                        </motion.div>

                        {/* Title */}
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                            Month Reported!
                        </h2>
                        
                        {/* Encouragement Message */}
                        <p className="text-white/70 text-sm mb-6 leading-relaxed">
                            {achievedGoal 
                                ? "Incredible work! You've reached your goal for the month and are building a strong momentum. Your dedication is truly inspiring!" 
                                : "Great effort this month! Every hour counts and contributes to your growth. Keep pushing forward—you're doing wonderfully!"}
                        </p>

                        {/* Stats Container */}
                        <div className="bg-black/30 rounded-2xl p-4 border border-white/5 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-left">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-1">
                                        {format(currentDate, 'MMM')} Hours
                                    </p>
                                    <p className="text-3xl font-black text-white leading-none">
                                        <CountUp value={totalHours} decimals={1} />
                                    </p>
                                </div>
                                
                                <ArrowRight className="text-white/20" />
                                
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-[#DAA520] mb-1">
                                        {isAugust ? 'End of Year' : `${nextMonth} Goal`}
                                    </p>
                                    <p className="text-2xl font-black text-[#DAA520] leading-none">
                                        {isAugust ? '🎉' : <><CountUp value={nextMonthGoal} decimals={1} /><span className="text-sm"> hrs</span></>}
                                    </p>
                                </div>
                            </div>
                            
                            {!isAugust && (
                                <div className="flex items-start gap-2 bg-white/5 rounded-xl p-3 text-left">
                                    <Target className="w-4 h-4 text-[#DAA520] shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-white/60 leading-tight">
                                        {achievedGoal 
                                            ? `Because you hit your mark, your target for ${nextMonth} is a manageable ${nextMonthGoal.toFixed(1)} hrs. Keep it up!` 
                                            : `Your hours carried over! Aim for ${nextMonthGoal.toFixed(1)} hrs in ${nextMonth} to stay on track for the year.`}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-[#DAA520] to-[#CD853F] text-[#1A1A1A] font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-lg"
                        >
                            Keep Growing
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};
