import { motion } from 'framer-motion';
import { CountUp } from '../common/CountUp';
import { Leaf, Clock, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

// Custom Artisanal Tree Log (Growth Rings) Icon
const TreeLogIcon = ({ className = "w-5 h-5", color = "#DAA520" }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
    >
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" strokeOpacity="0.8" strokeDasharray="2 1" />
        <circle cx="12" cy="12" r="7.5" stroke={color} strokeWidth="1.2" strokeOpacity="0.6" />
        <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="1 1" />
        <circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth="1.5" strokeOpacity="0.9" />
        {/* Subtle irregular grain lines */}
        <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke={color} strokeWidth="0.5" strokeOpacity="0.3" />
    </svg>
);

interface ActivityLogHeaderProps {
    totalHours: number;
    dynamicGoal: number;
    totalCredit: number;
    monthlyStudies: number;
    currentDate: Date;
}

export const ActivityLogHeader = ({ totalHours, dynamicGoal, totalCredit, monthlyStudies, currentDate }: ActivityLogHeaderProps) => {
    const progressPercentage = Math.min(100, Math.round((totalHours / dynamicGoal) * 100)) || 0;
    const currentMonth = format(currentDate, 'MMMM');

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-4 mb-6 rounded-[2rem] overflow-hidden shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] border border-white/10 bg-[#3E2723]"
        >
            {/* Photorealistic Log Background - Centered and shifted downward */}
            <div 
                className="absolute inset-0 bg-no-repeat z-0 transition-all duration-700" 
                style={{ 
                    backgroundImage: `url('/images/log_bg.png')`, 
                    backgroundPosition: '50% 65%', 
                    backgroundSize: '160%'
                }} 
            />
            
            {/* Stronger Scrim Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/10 to-black/50 z-[1]" />
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[100%] bg-radial-gradient from-[#DAA520]/15 to-transparent pointer-events-none z-[1]" />

            {/* Content Wrapper */}
            <div className="relative z-10 space-y-4">
                {/* Top Section: Goal Status - More Compact */}
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Leaf className="text-[#DAA520] w-3 h-3" />
                            <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Ministry for {currentMonth}</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black tracking-tighter text-white leading-none drop-shadow-lg">
                                <CountUp value={totalHours} decimals={1} />
                            </h3>
                            <span className="text-xl opacity-60 font-black italic text-white tracking-tighter">/ {dynamicGoal} hrs</span>
                        </div>
                    </div>
                    
                    {/* Custom Tree Log Button */}
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-2xl rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                        <TreeLogIcon className="w-6 h-6" color="#DAA520" />
                    </div>
                </div>

                {/* Progress Section: Month Progress Bar - Sleeker */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end px-1">
                        <div className="flex items-baseline gap-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/50">Month Progress</p>
                            <p className="text-xs font-black text-white/90 leading-none">
                                <CountUp value={totalHours} decimals={1} /> <span className="text-[9px] opacity-40 font-bold ml-0.5">of {dynamicGoal}</span>
                            </p>
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white leading-none drop-shadow-md">{progressPercentage}%</span>
                    </div>
                    
                    <div className="h-2.5 bg-black/40 rounded-full p-0.5 overflow-hidden backdrop-blur-xl border border-white/5 relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="h-full bg-gradient-to-r from-[#DAA520] via-[#FDF5E6] to-[#CD853F] rounded-full shadow-[0_0_15px_rgba(218,165,32,0.4)]"
                        />
                    </div>
                </div>

                {/* Bottom Cards: Credit and Studies - More Compact */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Credit Hours Card */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="group relative bg-white/10 backdrop-blur-md rounded-[1.5rem] p-3 border border-white/10 border-l-[3px] border-l-[#4A7C59] shadow-xl overflow-hidden"
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 bg-black/30 rounded-lg flex items-center justify-center border border-white/10">
                                <Clock size={14} className="text-[#4A7C59]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[8px] uppercase font-black text-white/60 tracking-widest">Credit</p>
                                <h4 className="text-2xl font-black tracking-tighter text-white leading-none">
                                    <CountUp value={totalCredit} /> <span className="text-[10px] opacity-40 font-bold tracking-normal">hrs</span>
                                </h4>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bible Studies Card */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="group relative bg-white/10 backdrop-blur-md rounded-[1.5rem] p-3 border border-white/10 border-l-[3px] border-l-sky-400 shadow-xl overflow-hidden"
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 bg-black/30 rounded-lg flex items-center justify-center border border-white/10">
                                <BookOpen size={14} className="text-sky-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[8px] uppercase font-black text-white/60 tracking-widest">Studies</p>
                                <h4 className="text-2xl font-black tracking-tighter text-white leading-none">
                                    <CountUp value={monthlyStudies} /> <span className="text-[10px] opacity-40 font-bold tracking-normal">BS</span>
                                </h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
