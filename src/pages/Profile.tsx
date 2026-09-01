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

  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchAvailableYears = async () => {
      const today = new Date();
      const currentSY = today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;

      try {
        const { data } = await supabase
          .from('reports')
          .select('date')
          .eq('user_id', user.id);

        const recordedYears = new Set<number>();
        (data || []).forEach(r => {
          if (!r.date) return;
          const d = new Date(r.date);
          // Service year starting year: if month >= Sept (8), SY start year is d.getFullYear(), else d.getFullYear() - 1
          const sy = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
          recordedYears.add(sy);
        });

        // Always include current service year
        recordedYears.add(currentSY);

        // Sort descending (latest first)
        const sorted = Array.from(recordedYears).sort((a, b) => b - a);
        setAvailableYears(sorted);
      } catch (err) {
        setAvailableYears([currentSY]);
      }
    };

    fetchAvailableYears();
  }, [user]);

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
                {availableYears.map(y => (
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
                      <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">

                        {/* Category: Dashboard */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-nature-green-dark flex items-center gap-1.5">
                            📊 1. Home Dashboard
                          </p>
                          <div className="space-y-1.5">
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">How do Service Years work?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                Service years run from <strong>September 1 to August 31</strong>. You can switch between active and previous service years in Settings or the header to view historical reports and growth charts.
                              </p>
                            </div>
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">What is Dynamic Goal vs. Progress?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                Your monthly goal dynamically recalculates remaining hours across remaining months of the service year. Progress shows total yearly hours logged toward the 600-hour quota.
                              </p>
                            </div>
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">Garden Summary in Dashboard?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                Shows active Seedlings (🌱) and Trees (🌳). On Trees card, green numbers show active trees while orange numbers show drying trees.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Category: Ministry Logs (Hours) */}
                        <div className="space-y-2 pt-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-nature-green-dark flex items-center gap-1.5">
                            ⏱️ 2. Ministry Logs (Hours)
                          </p>
                          <div className="space-y-1.5">
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">How to log daily hours & credit?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                Tap any calendar day to log hours, minutes, or credit hours (LDC/construction). Green dots show completed service days and purple badges show logged credit.
                              </p>
                            </div>
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">How does Bible Studies auto-fill work?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                MinisTree automatically counts unique Bible Studies (trees) visited/watered during that month. Tap the Bible Studies card to see the breakdown list and adjust the final count before saving.
                              </p>
                            </div>
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">What happens when I click "Mark as Reported"?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                Marking a month as reported locks in your final monthly report and recalculates your remaining dynamic goals for future months.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Category: Schedule (Carving) */}
                        <div className="space-y-2 pt-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-nature-green-dark flex items-center gap-1.5">
                            📅 3. Schedule (Carving)
                          </p>
                          <div className="space-y-1.5">
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">Weekly Schedule vs Daily Overrides?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                Set default planned hours for each day of the week (Sunday–Saturday). You can also set specific hour overrides for individual calendar days.
                              </p>
                            </div>
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">What are Projected Schedule Hours?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                Shows total planned hours for the current month based on your schedule calendar, helping you compare planned time against actual target goals.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Category: Garden (Map) */}
                        <div className="space-y-2 pt-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-nature-green-dark flex items-center gap-1.5">
                            🌱 4. Garden (Visits & Studies)
                          </p>
                          <div className="space-y-1.5">
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">Seedlings (🌱) vs. Trees (🌳)?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                Seedlings (🌱) are Return Visits. Trees (🌳) are Bible Studies. You can convert a Return Visit into a Bible Study anytime inside visit details.
                              </p>
                            </div>
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">Watering & Drying Out Rules?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                Watering records a visit log. If a plant isn't watered for <strong>4 weeks (28 days)</strong>, it turns into a <strong>Drying Out</strong> state until watered again.
                              </p>
                            </div>
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">How does Visit Handover (🤝) work?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                Open any visit/study in your <strong>Garden</strong>, tap <strong>Handover Visit (🤝)</strong>, and enter the publisher's email. They will receive a notification request. If accepted, the visit and its history are securely transferred into their Garden.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Category: Companion Tree */}
                        <div className="space-y-2 pt-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-nature-green-dark flex items-center gap-1.5">
                            🌲 5. Companion Tree
                          </p>
                          <div className="space-y-1.5">
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">How does the Companion Tree evolve?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                Your virtual tree evolves through <strong>13 distinct growth stages</strong> based on your cumulative service hours throughout the service year.
                              </p>
                            </div>
                            <div className="bg-white p-3.5 rounded-2xl border border-nature-cream">
                              <h5 className="font-black text-xs text-nature-brown-dark">Stage Level-Up Notifications?</h5>
                              <p className="text-xs text-nature-brown leading-relaxed mt-1">
                                As soon as your logged hours reach a new stage threshold, you'll receive a celebration prompt and notification!
                              </p>
                            </div>
                          </div>
                        </div>

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
