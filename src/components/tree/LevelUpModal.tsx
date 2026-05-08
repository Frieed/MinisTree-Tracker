import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy } from 'lucide-react';

interface LevelUpModalProps {
    show: boolean;
    onClose: () => void;
    stageIndex: number;
    message: string;
}

export const LevelUpModal = ({ show, onClose, stageIndex, message }: LevelUpModalProps) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2000] flex items-center justify-center px-6 bg-nature-brown-dark/90 backdrop-blur-xl"
            >
                <motion.div
                    initial={{ scale: 0.8, y: 40, rotate: -5 }} animate={{ scale: 1, y: 0, rotate: 0 }}
                    className="bg-white rounded-[4rem] p-8 w-full max-w-sm text-center space-y-8 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i} className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                                    width: '8px', height: '8px',
                                    backgroundColor: ['#6B8E23', '#A8D5BA', '#FFD700', '#FF6347'][Math.floor(Math.random() * 4)],
                                    borderRadius: '50%'
                                }}
                                animate={{ y: [0, -100], opacity: [1, 0], rotate: [0, 360] }}
                                transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                            />
                        ))}
                    </div>

                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-nature-green to-nature-green-dark text-white rounded-[2.5rem] rotate-12 flex items-center justify-center mx-auto shadow-2xl shadow-nature-green/40">
                            <Sparkles size={48} />
                        </div>
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -top-4 -right-4 bg-yellow-400 text-white p-2 rounded-full shadow-lg"><Trophy size={20} /></motion.div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-4xl font-black text-nature-brown-dark tracking-tighter">Evolution!</h2>
                        <p className="text-nature-brown font-bold text-lg leading-tight px-4">
                            Your tree has grown to <br />
                            <span className="text-nature-green text-3xl uppercase tracking-widest font-black">STAGE {stageIndex + 1}</span>
                        </p>
                    </div>

                    <div className="p-6 bg-nature-cream/50 rounded-[2.5rem] border border-nature-cream italic text-sm text-nature-brown-dark font-bold leading-relaxed">
                        "{message}"
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-nature-green hover:bg-nature-green-dark text-white rounded-[2rem] py-5 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-nature-green/30 transition-all"
                    >
                        Continue Growing
                    </button>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);
