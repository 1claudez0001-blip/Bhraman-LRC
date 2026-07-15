import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Eye, EyeOff, AlertCircle, Mail, GraduationCap, BookOpen } from 'lucide-react';
import ubLogo from '@/assets/UB_LIPA_LOGO.png';

const TABS = { login: 'login', register: 'register' };

export default function Login({ initialTab = 'login', onBack }) {
  const { login, register } = useApp();

  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [declaredRole, setDeclaredRole] = useState('student');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const isUBEmail = (e) => e.trim().toLowerCase().endsWith('@ub.edu.ph');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!isUBEmail(email)) {
      setError('Please use your UB email address (@ub.edu.ph).');
      return;
    }
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (!res.success) setError(res.error);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!idNumber.trim()) { setError('Please enter your ID number.'); return; }
    if (!isUBEmail(email)) { setError('Please use your UB email address (@ub.edu.ph).'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const res = await register(email.trim(), password, name.trim(), idNumber.trim(), declaredRole);
    setLoading(false);

    if (!res.success) { setError(res.error); return; }
    setVerificationSent(true);
  };

  // ── Verification sent screen ─────────────────────────────────────────────
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-ub-lightGold via-white to-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center animate-scale-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Check your UB Mail!</h2>
          <p className="text-ub-gray text-sm mb-4">
            We sent a verification link to <span className="font-semibold text-gray-800">{email}</span>.
            Click the link to activate your account.
          </p>
          {declaredRole === 'faculty' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800 mb-4 text-left">
              <p className="font-semibold mb-1">Faculty account note</p>
              <p className="text-xs">Your account will be reviewed by the library admin before you can access faculty features. You'll be notified once approved.</p>
            </div>
          )}
          <button
            onClick={() => { setVerificationSent(false); setTab(TABS.login); }}
            className="w-full py-2.5 rounded-xl bg-ub-red text-white font-semibold hover:bg-ub-darkRed transition cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-ub-lightGold via-white to-gray-50">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          {onBack && (
            <button onClick={onBack} className="self-start mb-4 text-sm text-ub-gray hover:text-ub-red flex items-center gap-1 cursor-pointer">
              ← Back to Home
            </button>
          )}
          <img src={ubLogo} alt="University of Batangas" className="h-20 object-contain mb-3" />
          <h1 className="font-display text-2xl font-bold text-ub-red">UB Library</h1>
          <p className="text-sm text-ub-gray mt-1">Library & Resource Center</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-scale-in">

          {/* Tab switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl mb-5">
            <button
              onClick={() => { setTab(TABS.login); setError(''); }}
              className={`py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${tab === TABS.login ? 'bg-white text-ub-red shadow-sm' : 'text-ub-gray'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab(TABS.register); setError(''); }}
              className={`py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${tab === TABS.register ? 'bg-white text-ub-red shadow-sm' : 'text-ub-gray'}`}
            >
              Register
            </button>
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === TABS.login && (
            <>
              <h2 className="font-heading text-lg font-semibold text-gray-900">Welcome back!</h2>
              <p className="text-sm text-ub-gray mb-4">Sign in with your UB email address.</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UB Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
                    placeholder="2300000@ub.edu.ph"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
                      placeholder="Enter password"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ub-gray hover:text-gray-700 cursor-pointer">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-ub-red text-white font-semibold hover:bg-ub-darkRed transition cursor-pointer disabled:opacity-60">
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
              <p className="text-center text-xs text-ub-gray mt-4">
                Don't have an account?{' '}
                <button onClick={() => { setTab(TABS.register); setError(''); }}
                  className="text-ub-red font-semibold hover:underline cursor-pointer">
                  Register here
                </button>
              </p>
            </>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === TABS.register && (
            <>
              <h2 className="font-heading text-lg font-semibold text-gray-900">Create account</h2>
              <p className="text-sm text-ub-gray mb-4">Use your UB email to register.</p>
              <form onSubmit={handleRegister} className="space-y-4">

                {/* Role selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeclaredRole('student')}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition cursor-pointer
                        ${declaredRole === 'student'
                          ? 'border-ub-red bg-red-50 text-ub-red'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      <GraduationCap size={18} /> Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeclaredRole('faculty')}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition cursor-pointer
                        ${declaredRole === 'faculty'
                          ? 'border-ub-red bg-red-50 text-ub-red'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      <BookOpen size={18} /> Faculty
                    </button>
                  </div>
                  {declaredRole === 'faculty' && (
                    <p className="text-xs text-ub-gray mt-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                      Faculty accounts need admin approval before full access is granted.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
                    placeholder="Juan Dela Cruz"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {declaredRole === 'faculty' ? 'Faculty ID' : 'Student ID'}
                  </label>
                  <input
                    value={idNumber}
                    onChange={e => setIdNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
                    placeholder={declaredRole === 'faculty' ? 'e.g. F-2024-001' : 'e.g. 2300000'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UB Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
                    placeholder={declaredRole === 'faculty' ? 'mjsantos@ub.edu.ph' : '2300000@ub.edu.ph'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
                      placeholder="At least 6 characters"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ub-gray hover:text-gray-700 cursor-pointer">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
                    placeholder="Repeat password"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-ub-red text-white font-semibold hover:bg-ub-darkRed transition cursor-pointer disabled:opacity-60">
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
              <p className="text-center text-xs text-ub-gray mt-4">
                Already have an account?{' '}
                <button onClick={() => { setTab(TABS.login); setError(''); }}
                  className="text-ub-red font-semibold hover:underline cursor-pointer">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
        <p className="text-center text-xs text-ub-gray mt-4">
          University of Batangas · Library Resource Center
        </p>
      </div>
    </div>
  );
}
