import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { loginCustomer, registerCustomer } from '../services/api';
import { useStore } from '../context/StoreContext';

interface CustomerAuthModalProps {
  onSuccess?: (session: any) => void;
  onClose?: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ onSuccess, onClose }) => {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalReason, customerLogin, showToast } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
  });

  // If managed by props or context
  const isOpen = isAuthModalOpen || !!onClose;

  if (!isOpen) return null;

  const handleClose = () => {
    setError('');
    if (onClose) {
      onClose();
    } else {
      setIsAuthModalOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let session;
      if (isRegister) {
        if (form.password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        session = await registerCustomer({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        });
      } else {
        session = await loginCustomer(form.email, form.password);
      }

      customerLogin(session);
      if (onSuccess) {
        onSuccess(session);
      }
      handleClose();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(', '));
      } else {
        setError('Unable to authenticate. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0A0A0A]/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md my-auto max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-[#C6A15B]/30 bg-[#F6F5F2] shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Header Ribbon */}
        <div className="bg-[#0A0A0A] p-4 sm:p-5 text-white border-b border-[#C6A15B]/30 relative shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-px w-5 bg-[#C6A15B]" />
            <span className="eyebrow text-[9px] text-[#C6A15B] font-bold tracking-[0.25em]">
              BAPAT OPTICS CLIENT PORTAL
            </span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-normal text-white">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-[11px] sm:text-xs text-[#B8BCC2] mt-0.5 font-light">
            {isRegister
              ? 'Join for shopping bag access, digital prescriptions & warranty tracking.'
              : 'Sign in to access your personal shopping bag, saved orders & optical records.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#0A0A0A]/10 bg-white/60 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              !isRegister
                ? 'border-b-2 border-[#C6A15B] text-[#0A0A0A] bg-white'
                : 'text-[#0A0A0A]/50 hover:text-[#0A0A0A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              isRegister
                ? 'border-b-2 border-[#C6A15B] text-[#0A0A0A] bg-white'
                : 'text-[#0A0A0A]/50 hover:text-[#0A0A0A]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          {authModalReason && (
            <div className="p-2.5 rounded-lg bg-[#C6A15B]/15 border border-[#C6A15B]/40 text-xs text-[#8B6B23] font-medium flex items-center gap-2">
              <Sparkles size={14} className="text-[#C6A15B] shrink-0" />
              <span>{authModalReason}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="text-[11px] font-semibold text-[#0A0A0A] block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder="e.g. Rohan Kulkarni"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full bg-white border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-xl py-2 pl-9 pr-3 text-xs outline-none shadow-xs"
                />
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40" />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-[#0A0A0A] block mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                required
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-xl py-2 pl-9 pr-3 text-xs outline-none shadow-xs"
              />
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40" />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-[11px] font-semibold text-[#0A0A0A] block mb-1">
                Phone Number (Optional for WhatsApp updates)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 98220 XXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-xl py-2 pl-9 pr-3 text-xs outline-none shadow-xs"
                />
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40" />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-[#0A0A0A]">
                Password *
              </label>
              {isRegister && (
                <span className="text-[10px] text-[#0A0A0A]/50">Min 6 characters</span>
              )}
            </div>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                minLength={6}
                placeholder={isRegister ? 'Minimum 6 secure characters' : 'Enter your password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-xl py-2 pl-9 pr-9 text-xs outline-none shadow-xs"
              />
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40 hover:text-[#0A0A0A] cursor-pointer"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A] py-2.5 sm:py-3 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md mt-2 cursor-pointer"
          >
            <span>{isLoading ? 'Processing...' : isRegister ? 'Create Luxury Account' : 'Sign In'}</span>
            <ArrowRight size={14} />
          </button>

          {/* Guarantee Footer */}
          <div className="pt-2 border-t border-[#0A0A0A]/10 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#0A0A0A]/60">
              <ShieldCheck size={13} className="text-[#C6A15B]" />
              <span>Encrypted Session · Official Bapat Optics Pune</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
