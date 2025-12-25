import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthProps {
  onLogin: (email: string, pass: string) => void;
  onSignup: (name: string, email: string, pass: string) => void;
  onGuest: () => void;
  isLoading: boolean;
  error: string | null;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onSignup, onGuest, isLoading, error }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(formData.email, formData.password);
    } else {
      onSignup(formData.name, formData.email, formData.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 dark:border-slate-800">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl mb-4">
              <Leaf className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">KnowYourBite</h1>
            <p className="text-slate-500 dark:text-slate-400">Your personal nutrition AI assistant</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center space-y-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
            
            <div className="w-full flex items-center justify-between">
                <span className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></span>
                <span className="px-4 text-xs text-slate-400 font-bold uppercase">or</span>
                <span className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></span>
            </div>

            <button
              onClick={onGuest}
              className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};