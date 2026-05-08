import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Mail, Lock, Loader2, ArrowRight, UserPlus, CheckCircle2, XCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Strength calculation
  const strength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 5) score += 25;
    if (password.length > 8) score += 25;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    return score;
  }, [password]);

  const strengthColor = strength > 75 ? 'bg-nature-green' : strength > 50 ? 'bg-orange-400' : 'bg-red-400';
  const strengthLabel = strength > 75 ? 'Strong' : strength > 50 ? 'Good' : 'Weak';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    
    if (isSignUp) {
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) {
        setError(authError.message);
      } else if (data.user && data.session === null) {
        setMessage("Success! Please check your email for a confirmation link.");
      }
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) setError(authError.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-nature-cream flex flex-col items-center justify-center p-6 select-none transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-nature-green rounded-[2.5rem] flex items-center justify-center shadow-premium mb-4">
                <Leaf className="text-white w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-nature-brown-dark tracking-tighter">MinisTree</h1>
            <p className="text-nature-brown font-bold text-sm uppercase tracking-widest mt-2">{isSignUp ? 'Join the Ministry' : 'Ministry Tracker'}</p>
        </div>

        {/* Card */}
        <div className="card shadow-2xl relative overflow-hidden backdrop-blur-sm bg-white/90">
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-3">
              <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light ml-2">Email Address</label>
                  <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-nature-brown-light group-focus-within:text-nature-green transition-colors" size={18} />
                      <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input-field pl-12" 
                          placeholder="your@email.com" 
                      />
                  </div>
              </div>

              <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light ml-2">Password</label>
                  <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-nature-brown-light group-focus-within:text-nature-green transition-colors" size={18} />
                      <input 
                          type={showPassword ? "text" : "password"} 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input-field pl-12 pr-12" 
                          placeholder="••••••••" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-nature-brown-light hover:text-nature-green transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                  </div>
                  
                  {/* Strength Indicator */}
                  {isSignUp && password && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-2 mt-2 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                        <span className="text-nature-brown-light flex items-center gap-1">
                            <ShieldCheck size={12} /> Strength: <span className="text-nature-brown-dark">{strengthLabel}</span>
                        </span>
                        <span className="text-nature-brown-light">{strength}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-nature-cream rounded-full overflow-hidden border border-nature-cream-light">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${strength}%` }}
                          className={`h-full ${strengthColor} transition-all duration-500 shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                        />
                      </div>
                    </motion.div>
                  )}
              </div>

              <AnimatePresence>
                {isSignUp && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                        <label className="text-[10px] font-black uppercase tracking-widest text-nature-brown-light ml-2">Confirm Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-nature-brown-light group-focus-within:text-nature-green transition-colors" size={18} />
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                required={isSignUp}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field pl-12 pr-12" 
                                placeholder="••••••••" 
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button 
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="text-nature-brown-light hover:text-nature-green transition-colors"
                                >
                                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                {confirmPassword && (
                                    password === confirmPassword 
                                        ? <CheckCircle2 className="text-nature-green" size={18} />
                                        : <XCircle className="text-red-400" size={18} />
                                )}
                            </div>
                        </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-nature-green/10 border border-nature-green/20 rounded-xl text-nature-green-dark text-xs font-bold leading-tight"
                >
                    {message}
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold leading-tight"
                >
                    {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
                type="submit"
                disabled={loading}
                className="w-full btn-primary h-14 text-lg font-bold shadow-xl overflow-hidden relative active:scale-95"
            >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <motion.div 
                    key={isSignUp ? 'up' : 'in'}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    {isSignUp ? <><UserPlus size={20} /> Create Account</> : <>Sign In <ArrowRight size={20} /></>}
                  </motion.div>
                )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-nature-cream flex flex-col items-center gap-4">
              <p className="text-xs font-bold text-nature-brown-light">
                {isSignUp ? "Already have an account?" : "New to MinisTree?"}
              </p>
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); setPassword(''); setConfirmPassword(''); setShowPassword(false); setShowConfirmPassword(false); }}
                className="btn-secondary w-full"
              >
                  {isSignUp ? "Back to Login" : "Create New Account"}
              </button>
          </div>
        </div>

        <p className="text-center mt-8 text-nature-brown-light text-[10px] font-bold uppercase tracking-tighter opacity-60">
            Secure tracking for your sacred service
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
