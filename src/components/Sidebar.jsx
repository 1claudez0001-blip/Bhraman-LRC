import React from 'react';
import { useApp } from '@/context/AppContext';
import { LogOut, ExternalLink, Repeat } from 'lucide-react';
import { LMS_URL, LRC_URL } from '@/lib/constants';
import ubLogo from '@/assets/UB_LIPA_LOGO.png';

export default function Sidebar({ tabs, activeTab, setActiveTab, isSA, saMode, setSaMode }) {
  const { session, logout } = useApp();
  const isStudent = session.userType === 'student' || (isSA && saMode === 'student');

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 min-h-screen"
      style={{ background: 'linear-gradient(180deg, #1a0a0a 0%, #2d1010 60%, #1a0a0a 100%)' }}>

      {/* Logo area */}
      <div className="flex flex-col items-center px-5 pt-7 pb-5">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-ub-gold/20 blur-md scale-110" />
          <img
            src={ubLogo}
            alt="University of Batangas"
            className="relative w-20 h-20 object-contain drop-shadow-lg"
          />
        </div>
        <div className="mt-3 text-center">
          <p className="text-white font-bold text-sm tracking-wide leading-tight">
            University of Batangas
          </p>
          <p className="text-white/40 text-[11px] mt-0.5 tracking-widest uppercase">
            {isStudent ? 'Library Portal' : 'Admin Portal'}
          </p>
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-5" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer group
                ${active
                  ? 'bg-ub-red text-white shadow-lg shadow-ub-red/30'
                  : 'text-white/50 hover:text-white hover:bg-white/8'
                }`}
            >
              <Icon
                size={16}
                className={`transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`}
              />
              <span className="tracking-wide">{t.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="px-3 pb-5 pt-3 space-y-0.5">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3" />

        {/* SA mode switcher */}
        {isSA && setSaMode && (
          <button
            onClick={() => setSaMode(saMode === 'student' ? 'sa' : 'student')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-ub-gold hover:text-white hover:bg-white/8 transition-all duration-200 cursor-pointer group"
          >
            <Repeat size={15} className="group-hover:scale-110 transition-transform duration-200" />
            <span className="tracking-wide">
              Switch to {saMode === 'student' ? 'Assistant' : 'Student'} Mode
            </span>
          </button>
        )}

        <a
          href={LMS_URL}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white/40 hover:text-white hover:bg-white/8 transition-all duration-200 group"
        >
          <ExternalLink size={15} className="group-hover:scale-110 transition-transform duration-200" />
          <span className="tracking-wide">UBian LMS</span>
        </a>
        {isStudent && (
          <a
            href={LRC_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white/40 hover:text-white hover:bg-white/8 transition-all duration-200 group"
          >
            <ExternalLink size={15} className="group-hover:scale-110 transition-transform duration-200" />
            <span className="tracking-wide">LRC Site</span>
          </a>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white/40 hover:text-red-400 hover:bg-red-950/40 transition-all duration-200 cursor-pointer group"
        >
          <LogOut size={15} className="group-hover:scale-110 transition-transform duration-200" />
          <span className="tracking-wide">Logout</span>
        </button>
      </div>
    </aside>
  );
}
