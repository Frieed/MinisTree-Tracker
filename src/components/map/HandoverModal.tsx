import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, UserPlus, Send, Check, Loader2, MapPin, FileText, AlertCircle } from 'lucide-react';

interface HandoverModalProps {
    isOpen: boolean;
    onClose: () => void;
    visit: any;
    onHandover: (email: string) => Promise<{ success?: boolean; error?: string }>;
}

export const HandoverModal = ({ isOpen, onClose, visit, onHandover }: HandoverModalProps) => {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleClose = () => {
        if (isSending) return;
        setRecipientEmail('');
        setStatus('idle');
        setErrorMessage('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!recipientEmail.trim() || isSending) return;
        setIsSending(true);
        setStatus('idle');
        setErrorMessage('');

        const result = await onHandover(recipientEmail);

        setIsSending(false);
        if (result.success) {
            setStatus('success');
            setTimeout(() => {
                handleClose();
            }, 2000);
        } else {
            setStatus('error');
            setErrorMessage(result.error || 'Something went wrong. Please try again.');
        }
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && visit && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleClose}
                        style={{ willChange: 'opacity' }}
                        className="fixed inset-0 bg-nature-brown-dark/40 backdrop-blur-sm z-[1200]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.5 }}
                        style={{ willChange: 'transform, opacity' }}
                        className="fixed inset-0 z-[1201] flex items-center justify-center p-6 pointer-events-none"
                    >
                        <div className="w-full max-w-sm bg-nature-cream rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-white/50 pointer-events-auto">
                            {/* Header */}
                            <div className="relative bg-nature-green/5 border-b border-nature-green/10 px-8 pt-8 pb-6 text-center">
                                <div className="w-16 h-16 bg-nature-green/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-inner">
                                    <UserPlus size={32} className="text-nature-green" />
                                </div>
                                <h3 className="text-xl font-black text-nature-brown-dark uppercase tracking-tight">Handover Visit</h3>
                                <p className="text-[11px] font-medium text-nature-brown-light mt-1 leading-snug px-4">
                                    Transfer this person to another MinisTree user. They will receive a request to accept.
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="absolute top-6 right-6 p-2 text-nature-brown-light/40 hover:text-nature-brown transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Visit Preview Card */}
                                <div className="bg-white rounded-[2rem] border border-nature-cream shadow-sm p-4 space-y-3">
                                    <p className="text-[9px] font-black text-nature-brown-light/60 uppercase tracking-widest">Transferring</p>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-inner shrink-0 ${
                                            visit.is_bible_study ? 'bg-[#e8f5f1] border-[#c2e5db]' : 'bg-[#ebf3fe] border-[#d4e4f9]'
                                        }`}>
                                            <span className="text-2xl">{visit.is_bible_study ? '🌳' : '🌱'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-black text-nature-brown-dark leading-tight truncate">{visit.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                                                    visit.is_bible_study ? 'bg-nature-green/10 text-nature-green' : 'bg-[#ebf3fe] text-[#5c8ed1]'
                                                }`}>
                                                    {visit.is_bible_study ? 'Bible Study' : 'Return Visit'}
                                                </span>
                                                {visit.gender && (
                                                    <span className="text-[8px] font-bold text-nature-brown-light/60 uppercase">{visit.gender}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 pt-1 border-t border-nature-cream/60">
                                        <div className="flex items-start gap-2">
                                            <MapPin size={11} className="text-nature-green mt-0.5 shrink-0" />
                                            <p className="text-[11px] text-nature-brown font-medium leading-tight italic">
                                                {visit.address || 'No address provided'}
                                            </p>
                                        </div>
                                        {visit.remarks && (
                                            <div className="flex items-start gap-2">
                                                <FileText size={11} className="text-nature-brown-light mt-0.5 shrink-0" />
                                                <p className="text-[11px] text-nature-brown-light leading-snug line-clamp-2">
                                                    {visit.remarks}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-nature-brown-light uppercase tracking-widest pl-1">
                                        Recipient's MinisTree Email
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="colleague@email.com"
                                            value={recipientEmail}
                                            onChange={(e) => {
                                                setRecipientEmail(e.target.value);
                                                if (status === 'error') setStatus('idle');
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                            disabled={isSending || status === 'success'}
                                            className={`w-full h-14 bg-white border-2 rounded-2xl px-5 pr-14 text-sm font-medium outline-none transition-all ${
                                                status === 'error' ? 'border-rose-300 focus:border-rose-500' :
                                                status === 'success' ? 'border-nature-green' :
                                                'border-nature-cream focus:border-nature-green'
                                            }`}
                                        />
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSending || status === 'success' || !recipientEmail.trim()}
                                            className={`absolute right-2 top-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                                status === 'success' ? 'bg-nature-green text-white' :
                                                !recipientEmail.trim() ? 'bg-nature-cream text-nature-brown-light/40 cursor-not-allowed' :
                                                'bg-nature-green/10 text-nature-green hover:bg-nature-green hover:text-white active:scale-90'
                                            }`}
                                        >
                                            {isSending ? <Loader2 size={18} className="animate-spin" /> :
                                             status === 'success' ? <Check size={18} /> :
                                             <Send size={18} />}
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {status === 'error' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center gap-2 px-1"
                                            >
                                                <AlertCircle size={12} className="text-rose-500 shrink-0" />
                                                <p className="text-[11px] font-bold text-rose-500">{errorMessage}</p>
                                            </motion.div>
                                        )}
                                        {status === 'success' && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-[11px] font-black text-nature-green text-center uppercase tracking-widest"
                                            >
                                                ✅ Request sent successfully!
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleClose}
                                        disabled={isSending}
                                        className="flex-1 h-12 bg-white border-2 border-nature-cream text-nature-brown-light font-black uppercase tracking-widest text-[10px] rounded-2xl hover:border-nature-brown/30 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSending || status === 'success' || !recipientEmail.trim()}
                                        className="flex-1 h-12 bg-nature-green text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-nature-green/20 hover:bg-nature-green-dark transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                                        {isSending ? 'Sending...' : 'Send Request'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
