import { useState, useEffect } from 'react';
import { User, Settings, HelpCircle, LogOut, ChevronDown, Key, Mail, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { supabase } from '../lib/supabase';
import { useServiceYear } from '../context/ServiceYearContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../context/UIContext';

const Profile = () => {
  const { setIsModalOpen: setGlobalModalOpen } = useUI();
  const { user, signOut } = useAuth();
  const { serviceYear, setServiceYear } = useServiceYear();
  
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{isOpen: boolean, type: 'success'|'error', message: string}>({
    isOpen: false,
    type: 'success',
    message: ''
  });
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (feedbackModal.isOpen) {
      setGlobalModalOpen(true);
      return () => setGlobalModalOpen(false);
    }
  }, [feedbackModal.isOpen, setGlobalModalOpen]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: '', width: '0%', textClass: '' };
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score < 2) return { label: 'Weak', color: 'bg-red-400', width: '33%', textClass: 'text-red-500' };
    if (score < 4) return { label: 'Medium', color: 'bg-yellow-400', width: '66%', textClass: 'text-yellow-600' };
    return { label: 'Strong', color: 'bg-nature-green', width: '100%', textClass: 'text-nature-green-dark' };
  };

  const handleUpdate = async (type: 'email' | 'password') => {
    setUpdating(true);
    
    try {
      if (type === 'password') {
        if (!user?.email) throw new Error('No user email found');
        
        // Verify old password by signing in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: oldPassword
        });
        
        if (signInError) throw new Error('Incorrect old password');
        
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        
        setFeedbackModal({ isOpen: true, type: 'success', message: 'Password updated successfully!' });
        setPassword('');
        setOldPassword('');
        setExpandedSection(null);
      } else {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
        setFeedbackModal({ isOpen: true, type: 'success', message: `We sent a confirmation link to ${email}. Please check your new inbox to complete the update.` });
        setExpandedSection(null);
      }
    } catch (error: any) {
      setFeedbackModal({ isOpen: true, type: 'error', message: error.message });
    } finally {
      setUpdating(false);
    }
  };

  const years = [2027, 2026, 2025];

  return (
    <div className="p-6 space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-nature-brown-dark tracking-tight">Settings</h2>
      </div>

      <section className="flex flex-col items-center">
        <div className="w-24 h-24 bg-nature-green rounded-[2.5rem] flex items-center justify-center shadow-xl relative ring-4 ring-white">
          <User size={48} className="text-white" />
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-nature-brown rounded-full border-4 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-nature-green rounded-full animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-nature-brown-dark mt-6">{user?.email?.split('@')[0] || 'Faithful Servant'}</h2>
        <p className="text-nature-brown font-bold text-sm tracking-wide bg-nature-cream-light px-4 py-1 rounded-full mt-2 border border-nature-brown-light/20">Regular Pioneer</p>
      </section>



      <div className="space-y-6">
        <section className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light ml-2">App Preferences</h4>
          <div className="bg-white rounded-3xl border border-nature-cream shadow-soft overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-nature-cream">
              <div className="flex items-center gap-4 text-nature-brown-dark">
                <div className="p-2 rounded-xl bg-nature-cream"><Settings size={20} /></div>
                <span className="font-bold">Service Year</span>
              </div>
              <select 
                value={serviceYear} 
                onChange={(e) => setServiceYear(Number(e.target.value))}
                className="bg-nature-cream-light text-nature-brown-dark font-bold text-sm rounded-xl px-3 py-2 border-2 border-nature-cream outline-none focus:border-nature-green transition-all"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}-{y+1}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light ml-2">Personal Information</h4>
          <div className="bg-white rounded-3xl border border-nature-cream shadow-soft overflow-hidden">
            
            {/* Email Section */}
            <div>
              <button onClick={() => setExpandedSection(expandedSection === 'email' ? null : 'email')} className="w-full p-5 flex items-center justify-between hover:bg-nature-cream transition-colors group text-left border-b border-nature-cream">
                <div className="flex items-center gap-4 text-nature-brown-dark">
                  <div className="p-2 rounded-xl bg-nature-cream group-hover:scale-110 transition-transform"><Mail size={20} /></div>
                  <span className="font-bold">Update Email</span>
                </div>
                <ChevronDown size={18} className={`text-nature-brown-light transition-transform ${expandedSection === 'email' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedSection === 'email' && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-nature-cream-light">
                    <div className="p-5 space-y-4">
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field bg-white" placeholder="New Email Address" />
                      <button onClick={() => handleUpdate('email')} disabled={updating || email === user?.email} className="btn-primary w-full disabled:opacity-50">
                        Update Email
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password Section */}
            <div>
              <button onClick={() => setExpandedSection(expandedSection === 'password' ? null : 'password')} className="w-full p-5 flex items-center justify-between hover:bg-nature-cream transition-colors group text-left">
                <div className="flex items-center gap-4 text-nature-brown-dark">
                  <div className="p-2 rounded-xl bg-nature-cream group-hover:scale-110 transition-transform"><Key size={20} /></div>
                  <span className="font-bold">Update Password</span>
                </div>
                <ChevronDown size={18} className={`text-nature-brown-light transition-transform ${expandedSection === 'password' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedSection === 'password' && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-nature-cream-light border-t border-nature-cream">
                    <div className="p-5 space-y-4">
                      <div className="relative">
                        <input type={showOldPassword ? "text" : "password"} value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="input-field bg-white pr-12" placeholder="Old Password" />
                        <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-nature-brown-light hover:text-nature-brown transition-colors">
                          {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div>
                        <div className="relative">
                          <input type={showNewPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="input-field bg-white pr-12" placeholder="New Password" />
                          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-nature-brown-light hover:text-nature-brown transition-colors">
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {password && (
                          <div className="mt-2 space-y-1.5 px-1">
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                              <span className="text-nature-brown-light">Strength</span>
                              <span className={getPasswordStrength(password).textClass}>{getPasswordStrength(password).label}</span>
                            </div>
                            <div className="h-1.5 w-full bg-nature-cream rounded-full overflow-hidden">
                              <div className={`h-full ${getPasswordStrength(password).color} transition-all duration-300`} style={{ width: getPasswordStrength(password).width }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleUpdate('password')} disabled={updating || !password || password.length < 6 || !oldPassword} className="btn-primary w-full disabled:opacity-50">
                        Update Password
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light ml-2">Support & Info</h4>
          <div className="bg-white rounded-3xl border border-nature-cream shadow-soft overflow-hidden">
            <div>
              <button onClick={() => setExpandedSection(expandedSection === 'faq' ? null : 'faq')} className="w-full p-5 flex items-center justify-between hover:bg-nature-cream transition-colors group text-left border-b border-nature-cream">
                <div className="flex items-center gap-4 text-nature-brown-dark">
                  <div className="p-2 rounded-xl bg-nature-cream group-hover:scale-110 transition-transform"><HelpCircle size={20} /></div>
                  <span className="font-bold">FAQ</span>
                </div>
                <ChevronDown size={18} className={`text-nature-brown-light transition-transform ${expandedSection === 'faq' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedSection === 'faq' && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-nature-cream-light">
                    <div className="p-5 space-y-4">
                      <div className="space-y-2">
                        <h5 className="font-bold text-sm text-nature-brown-dark">How are monthly goals calculated?</h5>
                        <p className="text-xs text-nature-brown leading-relaxed">Monthly goals are calculated based on your weekly hourly schedule. Since some months have 4 weeks and others 5, the monthly goal adjusts automatically.</p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-sm text-nature-brown-dark">Goal Hours vs. Sched Hours?</h5>
                        <p className="text-xs text-nature-brown leading-relaxed">
                          <span className="font-bold text-nature-green-dark">Goal Hours</span> is your official target for the month (e.g. 50 hrs). 
                          <span className="font-bold text-nature-brown-dark"> Sched Hours</span> is the total time you've actually planned in your personal schedule for the month.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-sm text-nature-brown-dark">What are "Credit Hours"?</h5>
                        <p className="text-xs text-nature-brown leading-relaxed">Credit hours are for extra activities (like LDC or construction) that count towards your yearly total but aren't logged as field service time.</p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-sm text-nature-brown-dark">How does the Companion Tree grow?</h5>
                        <p className="text-xs text-nature-brown leading-relaxed">Your tree flourishes as you reach milestones in your service year. There are 13 growth stages—keep logging to see it evolve!</p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-sm text-nature-brown-dark">Can I work offline?</h5>
                        <p className="text-xs text-nature-brown leading-relaxed"><span className="font-bold text-nature-green-dark">Yes!</span> MinisTree now fully supports offline mode. You can log hours and manage your garden anywhere—your data will sync automatically when you're back online.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button onClick={signOut} className="w-full p-5 flex items-center justify-between hover:bg-nature-cream transition-colors group text-left">
              <div className="flex items-center gap-4 text-red-500">
                <div className="p-2 rounded-xl bg-red-50 group-hover:scale-110 transition-transform"><LogOut size={20} /></div>
                <span className="font-bold">Sign Out</span>
              </div>
            </button>
          </div>
        </section>
      </div>

      <div className="p-6 bg-nature-green/5 rounded-3xl border border-nature-green/10 flex flex-col items-center text-center">
        <p className="text-xs font-bold text-nature-green-dark uppercase tracking-widest">MinisTree v1.0.0</p>
        <p className="text-[10px] text-nature-brown-light mt-1 font-bold">Made with ❤️ for the Ministry</p>
      </div>

      <AnimatePresence>
        {feedbackModal.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
              className="fixed inset-0 z-[100] bg-nature-brown-dark/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[320px] bg-white rounded-3xl p-6 z-[101] shadow-2xl flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${feedbackModal.type === 'success' ? 'bg-nature-green/10 text-nature-green' : 'bg-red-50 text-red-500'}`}>
                {feedbackModal.type === 'success' ? <CheckCircle size={32} /> : <XCircle size={32} />}
              </div>
              <h3 className={`text-xl font-black mb-2 ${feedbackModal.type === 'success' ? 'text-nature-green-dark' : 'text-red-600'}`}>
                {feedbackModal.type === 'success' ? 'Success!' : 'Update Failed'}
              </h3>
              <p className="text-nature-brown font-medium text-sm mb-6">{feedbackModal.message}</p>
              <button
                onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                className={`w-full py-3 rounded-xl font-bold text-white transition-transform active:scale-95 ${feedbackModal.type === 'success' ? 'bg-nature-green hover:bg-nature-green-dark' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {feedbackModal.type === 'success' ? 'Awesome' : 'Try Again'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
