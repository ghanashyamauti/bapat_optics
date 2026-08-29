import React, { useState } from 'react';
import { Lock, Mail, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLogin: React.FC = () => {
  const { login, isLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#C6A15B]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#C6A15B]/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#C6A15B]/15 text-[#A4813E] mb-1">
            <Sparkles size={22} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-slate-900 font-normal tracking-tight">
            BAPAT OPTICS
          </h1>
          <p className="eyebrow text-[9px] text-[#A4813E] tracking-[0.25em] font-semibold">
            Executive CRM & Portal
          </p>
          <p className="text-xs text-slate-500 font-light">
            Authorized Optometrist & Management Access
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 block mb-1 font-medium">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-admin-email@example.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] focus:bg-white rounded-xl py-3 pl-10 pr-4 text-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] focus:bg-white rounded-xl py-3 pl-10 pr-10 text-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#C6A15B] hover:bg-[#A4813E] text-[#0A0A0A] font-bold py-3.5 rounded-xl tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Executive CRM'}</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
