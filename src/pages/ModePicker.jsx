import React from 'react';
import { GraduationCap, ClipboardList, ArrowRight } from 'lucide-react';
import ubLogo from '@/assets/UB_LIPA_LOGO.png';

export default function ModePicker({ session, onPick }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #6b1010 40%, #922b21 70%, #c0392b 100%)' }}>

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={ubLogo} alt="UB" className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-lg" />
          <h1 className="font-display text-2xl font-bold text-white">Welcome back!</h1>
          <p className="text-white/60 text-sm mt-1">{session.userName} · {session.userId}</p>
        </div>

        {/* Mode cards */}
        <div className="space-y-3">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest text-center mb-4">
            How are you accessing today?
          </p>

          <button
            onClick={() => onPick('student')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-white text-base">Student Mode</p>
              <p className="text-white/50 text-sm mt-0.5">Browse books, reserve rooms, track your requests</p>
            </div>
            <ArrowRight size={18} className="text-white/40 group-hover:text-white/80 transition" />
          </button>

          <button
            onClick={() => onPick('sa')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-ub-red/80 hover:bg-ub-red border border-ub-red/50 hover:border-ub-red transition-all duration-200 cursor-pointer group shadow-lg shadow-ub-red/30"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition">
              <ClipboardList size={24} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-white text-base">Assistant Mode</p>
              <p className="text-white/60 text-sm mt-0.5">Manage requests, catalog, and room bookings</p>
            </div>
            <ArrowRight size={18} className="text-white/60 group-hover:text-white transition" />
          </button>
        </div>

        <p className="text-center text-white/30 text-xs mt-8">
          University of Batangas · Library & Resource Center
        </p>
      </div>
    </div>
  );
}
