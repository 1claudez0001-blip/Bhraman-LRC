import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UB_LOGO_URL, DEMO_CREDENTIALS } from '@/lib/constants';
import { GraduationCap, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useApp();
  const [tab, setTab] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(tab, username.trim(), password);
    if (!res.success) {
      setError(res.error);
      return;
    }
    setSuccess(true);
    toast.success(`Welcome, ${DEMO_CREDENTIALS[tab].name}!`);
    setTimeout(() => {
      /* session state change re-renders to the dashboard */
    }, 870);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-ub-lightGold via-white to-gray-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img
            src={UB_LOGO_URL}
            alt="University of Batangas"
            className="h-20 object-contain mb-3"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="font-display text-2xl font-bold text-ub-red flex items-center gap-2">🏛️ UB Library</h1>
          <p className="text-sm text-ub-gray mt-1">Library &amp; Resource Center</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-scale-in">
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl mb-5">
            <button
              onClick={() => setTab('student')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${tab === 'student' ? 'bg-white text-ub-red shadow-sm' : 'text-ub-gray'}`}
            >
              <GraduationCap size={16} /> Student
            </button>
            <button
              onClick={() => setTab('admin')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${tab === 'admin' ? 'bg-white text-ub-red shadow-sm' : 'text-ub-gray'}`}
            >
              <Shield size={16} /> Admin
            </button>
          </div>

          <h2 className="font-heading text-lg font-semibold text-gray-900">
            {tab === 'student' ? 'Student Login' : 'Admin Login'}
          </h2>
          <p className="text-sm text-ub-gray mb-4">
            {tab === 'student' ? 'Access the catalog and reserve resources.' : 'Manage reservations and the catalog.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ub-gray hover:text-gray-700 cursor-pointer"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">Login successful! Redirecting…</div>
            )}

            <button
              type="submit"
              disabled={success}
              className="w-full py-2.5 rounded-xl bg-ub-red text-white font-semibold hover:bg-ub-darkRed transition cursor-pointer disabled:opacity-60"
            >
              {tab === 'student' ? 'Sign In as Student' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-ub-gray mb-2">Demo credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-ub-lightGold rounded-lg px-3 py-2">
                <p className="font-semibold text-ub-red">Student</p>
                <p className="text-ub-gray">user123 / pass123</p>
              </div>
              <div className="bg-ub-lightGold rounded-lg px-3 py-2">
                <p className="font-semibold text-ub-red">Admin</p>
                <p className="text-ub-gray">admin / admin123</p>
              </div>
            </div>
            <button
              onClick={() => alert('Please visit the Library front desk to request an account.')}
              className="mt-3 text-xs text-ub-gray hover:text-ub-red underline cursor-pointer"
            >
              No account? Contact Library
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-ub-gray mt-4">University of Batangas · Library Resource Center</p>
      </div>
    </div>
  );
}