import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Leaf, Star, Trophy } from 'lucide-react';

interface TreeEvolutionDisplayProps {
    stageIndex: number;
    currentStage: any;
    nextStage: any;
    totalHours: number;
    progressToNext: number;
    hoursToNext: number;
}

export const TreeEvolutionDisplay = ({ 
    stageIndex, currentStage, nextStage, totalHours, progressToNext, hoursToNext 
}: TreeEvolutionDisplayProps) => {
    return (
        <>
            <section className="relative flex flex-col items-center justify-center py-0 z-10 -mt-10 mb-8">
                <div className="relative w-full h-[450px] flex items-end justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-nature-green/20 rounded-full blur-[60px] -z-10"
                    />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={stageIndex} initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 1.1, opacity: 0, rotate: 5 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            <motion.img
                                src={currentStage.image} alt={currentStage.name}
                                animate={{ scale: stageIndex >= 8 ? 1.1 + (stageIndex - 8) * 0.1 : 1 }}
                                className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
                            />
                        </motion.div>
                    </AnimatePresence>
                    <div className="absolute bottom-4 w-48 h-8 bg-nature-brown-dark/20 blur-xl rounded-[100%] -z-10" />
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className={`-mt-16 px-6 py-2.5 rounded-full shadow-premium border flex items-center gap-3 relative z-20 transition-all duration-1000 ${
                        stageIndex === 12 ? 'bg-gradient-to-r from-yellow-600 via-yellow-100 to-yellow-600 border-yellow-400/50 text-yellow-950' : 
                        stageIndex === 10 ? 'bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-950 border-emerald-500/30 text-white' : 
                        'bg-white/90 backdrop-blur-md border-nature-cream text-nature-brown-dark'
                    }`}
                >
                    <div className="relative">
                        <div className={`w-3 h-3 rounded-full animate-ping absolute inset-0 ${stageIndex === 12 ? 'bg-yellow-600' : stageIndex === 10 ? 'bg-emerald-400' : 'bg-nature-green'}`} />
                        <div className={`w-3 h-3 rounded-full relative z-10 ${stageIndex === 12 ? 'bg-yellow-800' : stageIndex === 10 ? 'bg-emerald-500' : 'bg-nature-green'}`} />
                    </div>
                    <span className="font-black uppercase tracking-widest text-sm">Stage {stageIndex + 1}</span>
                    {stageIndex === 12 && <div className="absolute -top-1 -right-1"><Sparkles size={14} className="text-yellow-400 animate-pulse" /></div>}
                </motion.div>
            </section>

            <section className={`relative z-10 card backdrop-blur-xl border shadow-2xl p-5 space-y-4 transition-all duration-1000 ${
                stageIndex === 12 ? 'bg-gradient-to-br from-yellow-600 via-yellow-50 to-yellow-600 border-yellow-400/50 shadow-yellow-500/20' : 
                stageIndex === 11 ? 'bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 border-amber-300/40 shadow-amber-900/10' :
                stageIndex === 10 ? 'bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 border-emerald-500/40 text-white shadow-emerald-900/20' : 
                'bg-white/70 border-nature-cream text-nature-brown-dark'
            }`}>
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-70`}>Total Logged Hours</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black tracking-tighter">{totalHours.toFixed(1)}</h3>
                            <span className="text-lg font-bold italic opacity-70">hrs</span>
                        </div>
                    </div>
                    {nextStage && (
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Target</p>
                            <div className="px-2 py-1 rounded-lg border border-current/20 bg-current/10">
                                <p className="font-black text-md leading-none">{nextStage.minHours}h</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2"><Leaf size={14} /><span className="text-xs font-black uppercase tracking-wider">Growth Progress</span></div>
                        <span className="text-sm font-black">{Math.round(progressToNext)}%</span>
                    </div>
                    <div className="h-4 bg-nature-cream/50 rounded-full p-1 border border-nature-cream shadow-inner overflow-hidden relative">
                        <motion.div
                            initial={{ width: 0 }} animate={{ width: `${progressToNext}%` }} transition={{ duration: 2, ease: "circOut" }}
                            className={`h-full bg-gradient-to-r rounded-xl shadow-lg relative overflow-hidden ${
                                stageIndex === 12 ? 'from-yellow-700 via-yellow-400 to-yellow-600' : 
                                stageIndex === 10 ? 'from-emerald-600 via-green-500 to-emerald-400' :
                                stageIndex === 11 ? 'from-amber-600 via-orange-500 to-amber-400' : 
                                'from-nature-green via-[#95C544] to-nature-green-light'
                            }`}
                        >
                            <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 skew-x-12" />
                        </motion.div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[11px] font-bold italic pt-1 opacity-80">
                        {nextStage ? <><Star size={12} /><span>Only {hoursToNext.toFixed(1)} hours left to unlock Stage {stageIndex + 2}!</span></> : 
                        <><Trophy size={14} /><span>Maximum Growth Reached! You are a Legend.</span></>}
                    </div>
                </div>
            </section>
        </>
    );
};
