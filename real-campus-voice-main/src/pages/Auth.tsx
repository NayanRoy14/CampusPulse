import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { LogIn, UserPlus, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.jpg';

const Auth = () => {
  const navigate = useNavigate();
  const { login, signup } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
      setError('User ID can only contain letters, numbers, underscores, and hyphens.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(userId, password);
      } else {
        await signup(userId, password, fullName);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="blob top-[-10%] left-[-10%] opacity-30 dark:opacity-20" />
      <div className="blob bottom-[-10%] right-[-10%] bg-secondary/30 opacity-30 dark:opacity-20" style={{ animationDelay: '-10s' }} />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group z-10">
        <div className="p-2 rounded-xl bg-card border border-white/5 group-hover:border-primary/20 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-sm font-semibold">Back to Feed</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 glass p-10 rounded-[2rem] shadow-glow border-white/5 relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-gradient-to-br from-primary to-secondary rounded-[1.5rem] shadow-glow mb-2 animate-pulse-vote">
            <img src={logo} alt="CampusPulse" className="w-12 h-12 rounded-xl" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold heading-display text-foreground tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join Community'}
            </h1>
            <p className="text-sm text-muted-foreground font-medium opacity-70">
              {isLogin ? 'Login with your User ID' : 'Create a User ID to post with your identity'}
            </p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">User ID</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-muted/50 focus:bg-card rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground border border-transparent focus:border-primary/30"
                placeholder="Choose a unique ID"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Display Name (Optional)</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-muted/50 focus:bg-card rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground border border-transparent focus:border-primary/30"
                  placeholder="Your real name"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-muted/50 focus:bg-card rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground border border-transparent focus:border-primary/30"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-destructive text-center font-bold bg-destructive/10 py-3 rounded-xl border border-destructive/20"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 gradient-brand text-white rounded-2xl font-bold shadow-glow flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              <><LogIn className="w-5 h-5" /> Login to Account</>
            ) : (
              <><UserPlus className="w-5 h-5" /> Create Account</>
            )}
          </button>
        </form>

        <div className="text-center space-y-6">
          <p className="text-sm text-muted-foreground font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              {isLogin ? 'Sign Up Now' : 'Login Here'}
            </button>
          </p>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]"><span className="bg-card/0 px-4 text-muted-foreground/40 font-bold">Or</span></div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-2xl text-sm font-bold transition-all border border-white/5"
          >
            Continue as Anonymous User
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
