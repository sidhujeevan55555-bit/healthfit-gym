import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register' | 'admin';
  onLoginSuccess: (token: string, user: any, isAdmin: boolean) => void;
}

export default function AuthModal({ isOpen, onClose, initialMode, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [membershipType, setMembershipType] = useState('None');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Synchronise mode when prop shifts
  React.useEffect(() => {
    setMode(initialMode);
    setErrorText('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Handle standard registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, membershipType })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server registration error');
      }

      onLoginSuccess(data.token, data.user, false);
      onClose();
    } catch (err: any) {
      setErrorText(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  // Handle standard login
  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setLoading(true);

    try {
      const isAdmMode = mode === 'admin';
      const endpoint = isAdmMode ? '/api/auth/admin/login' : '/api/auth/login';
      const payload = isAdmMode
        ? { username: email, password } // for admin, we send username
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      onLoginSuccess(data.token, data.user, isAdmMode);
      onClose();
    } catch (err: any) {
      setErrorText(err.message || 'Invalid administrative or member credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login via Firebase Client Auth
  const handleGoogleLogin = async () => {
    setErrorText('');
    setLoading(true);
    try {
      // Step A: Trigger Google popup via Firebase Client SDK
      const authResult = await signInWithPopup(auth, googleAuthProvider);
      const user = authResult.user;
      
      // Step B: Get standard Id Token to send to server backend
      const firebaseIdToken = await user.getIdToken();

      // Step C: Send to Express backend for verification and sync
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: firebaseIdToken })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Firebase sync error');
      }

      onLoginSuccess(data.token, data.user, false);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Google Sign-In canceled or database synchronisation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass border-white/10 rounded-3xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl space-y-6">
        
        {/* Neon accent glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-600" />

        {/* Header row */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-1.5">
            {mode === 'login' && 'Member Login'}
            {mode === 'register' && 'Create Account'}
            {mode === 'admin' && 'Admin Verification'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {errorText && (
          <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-xl text-xs text-red-400">
            {errorText}
          </div>
        )}

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2 bg-black/30 p-1 rounded-xl text-xs border border-white/5">
          <button
            onClick={() => { setMode('login'); setErrorText(''); }}
            className={`py-1.5 rounded-lg font-medium transition cursor-pointer text-center ${
              mode === 'login' ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Member Login
          </button>
          <button
            onClick={() => { setMode('register'); setErrorText(''); }}
            className={`py-1.5 rounded-lg font-medium transition cursor-pointer text-center ${
              mode === 'register' ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => { setMode('admin'); setErrorText(''); }}
            className={`py-1.5 rounded-lg font-medium transition cursor-pointer text-center ${
              mode === 'admin' ? 'bg-indigo-600/90 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin Log
          </button>
        </div>

        {/* Authentication forms */}
        <form onSubmit={mode === 'register' ? handleRegister : handleLocalLogin} className="space-y-4">
          
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Full Name</label>
              <div className="relative">
                <User size={14} className="text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
              {mode === 'admin' ? 'Admin Username' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail size={14} className="text-slate-400 absolute left-3 top-3" />
              <input
                type={mode === 'admin' ? 'text' : 'email'}
                required
                placeholder={mode === 'admin' ? 'e.g. admin' : 'e.g. amit@gmail.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Phone number</label>
              <div className="relative">
                <Phone size={14} className="text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-300 tracking-wider font-display">Password</label>
            <div className="relative">
              <Lock size={14} className="text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Select Membership Plan</label>
              <select
                value={membershipType}
                onChange={(e) => setMembershipType(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              >
                <option value="None">None (Unsubscribed - Register only)</option>
                <option value="Basic Monthly">Basic Monthly — ₹499/mo</option>
                <option value="Pro Monthly">Pro Monthly — ₹799/mo</option>
                <option value="Quarterly Pack">Quarterly Pack — ₹1499/3mo</option>
                <option value="Annual Pass">Annual Pass — ₹4999/yr</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold font-display text-xs p-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            {loading ? 'Processing...' : mode === 'register' ? 'Submit Registration' : 'Confirm Login'}
            {!loading && <LogIn size={14} />}
          </button>
        </form>

        {/* Google Authentication Section for standard members */}
        {mode !== 'admin' && (
          <div className="space-y-4 border-t border-white/10 pt-4">
            <div className="relative text-center">
              <span className="bg-[#0b0c16] px-3 text-[10px] text-slate-400 uppercase tracking-widest font-semibold relative z-10">Or Join with Google</span>
              <div className="absolute top-1.5 left-0 right-0 h-[1px] bg-white/10" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-black/30 hover:bg-black/50 border border-white/10 text-white font-medium font-sans text-xs p-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Instant Google Sign-In</span>
            </button>
          </div>
        )}

        {/* Footer info note */}
        <div className="text-center text-[10px] text-slate-500">
          {mode === 'admin' ? (
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck size={11} className="text-indigo-400" /> Secured cryptographic console
            </p>
          ) : (
            <p>By proceeding, you agree to traditional Indian data privacy terms.</p>
          )}
        </div>

      </div>
    </div>
  );
}
