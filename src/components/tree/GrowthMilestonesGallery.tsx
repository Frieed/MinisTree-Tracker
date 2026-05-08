import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface GrowthMilestonesGalleryProps {
    stages: any[];
    stageIndex: number;
}

export const GrowthMilestonesGallery = ({ stages, stageIndex }: GrowthMilestonesGalleryProps) => {
    return (
        <section className="relative z-10 space-y-4 px-1 pb-10">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-nature-brown-light pl-1">Growth Journey</h4>
                <span className="text-[10px] font-bold text-nature-green-dark bg-nature-green/10 px-2 py-0.5 rounded-full border border-nature-green/20">
                    {stageIndex + 1} / {stages.length} Unlocked
                </span>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
                {stages.map((stage, idx) => {
                    const isUnlocked = idx <= stageIndex;
                    const isCurrent = idx === stageIndex;
                    
                    return (
                        <motion.div
                            key={idx}
                            whileHover={isUnlocked ? { y: -5, scale: 1.05 } : {}}
                            className={`relative aspect-square rounded-2xl border transition-all duration-500 overflow-hidden group ${
                                isCurrent 
                                    ? 'ring-2 ring-nature-green ring-offset-2 border-nature-green shadow-lg bg-nature-green/5' 
                                    : isUnlocked
                                    ? 'bg-white border-nature-cream shadow-sm hover:shadow-md'
                                    : 'bg-nature-cream/30 border-nature-cream/50 grayscale'
                            }`}
                        >
                            <div className={`absolute top-1 right-1 z-10 w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-black ${
                                isUnlocked ? 'bg-nature-green text-white' : 'bg-nature-brown-light/30 text-nature-brown'
                            }`}>
                                {idx + 1}
                            </div>

                            <div className="absolute inset-0 p-2 flex items-center justify-center">
                                <img 
                                    src={stage.image} alt={stage.name}
                                    className={`w-full h-full object-contain transition-all duration-700 ${isUnlocked ? 'opacity-100' : 'opacity-20 blur-[1px]'}`}
                                />
                                {!isUnlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white/40 backdrop-blur-[1px] p-1.5 rounded-full"><Star size={10} className="text-nature-brown-light" /></div>
                                    </div>
                                )}
                            </div>

                            {isUnlocked && (
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-nature-brown-dark/80 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[7px] text-white font-black text-center truncate px-0.5 uppercase">{stage.name}</p>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
            
            <p className="text-[10px] text-center text-nature-brown-light font-medium italic pt-2">
                Your spiritual tree evolves every 50 hours. Keep sharing the good news to see it thrive!
            </p>
        </section>
    );
};
