import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTreeGrowth } from '../hooks/useTreeGrowth';
import { TreeEvolutionDisplay } from '../components/tree/TreeEvolutionDisplay';
import { GrowthMilestonesGallery } from '../components/tree/GrowthMilestonesGallery';
import { LevelUpModal } from '../components/tree/LevelUpModal';
import { useUI } from '../context/UIContext';

const TreePet = () => {
  const { setIsModalOpen: setGlobalModalOpen } = useUI();
  const {
    totalHours, loading, showLevelUp, setShowLevelUp,
    stageIndex, currentStage, nextStage, progressToNext, hoursToNext, stages
  } = useTreeGrowth();

  useEffect(() => {
    if (showLevelUp) {
      setGlobalModalOpen(true);
      return () => setGlobalModalOpen(false);
    }
  }, [showLevelUp, setGlobalModalOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-nature-green/20 border-t-nature-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 pt-4 pb-28 min-h-screen bg-[#FDFBF7] space-y-6 overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-nature-green/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[30%] bg-nature-brown/5 rounded-full blur-[80px]" />
      </div>

      <section className="relative flex justify-between items-center z-10">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-nature-green/10 text-nature-green text-[10px] font-black uppercase tracking-widest rounded-full border border-nature-green/20">Growth Visualization</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black text-nature-brown-dark leading-tight tracking-tight">
            Companion <span className="text-nature-green italic">Tree</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-[11px] font-bold text-nature-brown-light leading-snug mt-1 max-w-[200px]">
            The tree will thrive only if you nurture it by sharing the good news.
          </motion.p>
        </div>
      </section>

      <TreeEvolutionDisplay 
        stageIndex={stageIndex} currentStage={currentStage} nextStage={nextStage} 
        totalHours={totalHours} progressToNext={progressToNext} hoursToNext={hoursToNext} 
      />
      
      <GrowthMilestonesGallery stages={stages} stageIndex={stageIndex} />

      <LevelUpModal 
        show={showLevelUp} onClose={() => setShowLevelUp(false)} 
        stageIndex={stageIndex} message={currentStage.message} 
      />
    </div>
  );
};

export default TreePet;
