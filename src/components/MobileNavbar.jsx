import React from 'react';
import { useApp } from '@/context/AppContext';
import { LogOut, ExternalLink } from 'lucide-react';
import { LMS_URL } from '@/lib/constants';
import ubLogo from '@/assets/UB_LIPA_LOGO.png';

export default function MobileNavbar({ tabs, activeTab, setActiveTab }) {
  const { session, logout } = useApp();

  return (
    <header className="md:hidden sticky top-0 z-30"
      style={{ background: 'linear-gradient(90deg, #1a0a0a 0%, #2d1010 100%)' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <img src={ubLogo} alt="UB" className="w-8 h-8 object-contain" />
          <div>
            <p className="text-white font-bold text-xs leading-tight">UB Library</p>
            <p className="text-white/40 text-[10px] leading-tight">LRC</p>
          </div>
        </div>
        <span className="text-white/50 text-xs truncate max-w-[35%]">{session.userName}</span>
        <div className="flex items-center gap-1.5">
          <a
            href={LMS_URL}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white/80 text-[11px] font-semibold flex items-center gap-1 hover:bg-white/20 transition"
          >
            LMS <ExternalLink size={10} />
          </a>
          <button
            onClick={logout}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white/80 text-[11px] font-semibold flex items-center gap-1 hover:bg-red-900/40 hover:text-red-400 transition cursor-pointer"
          >
            <LogOut size={12} />
          </button>
        </div>
      </div>

      {/* Tab row */}
      <div className="flex border-t border-white/10">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-all duration-200 cursor-pointer
                ${active
                  ? 'text-white border-b-2 border-ub-red'
                  : 'text-white/35 border-b-2 border-transparent hover:text-white/60'
                }`}
            >
              <Icon size={16} className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
              {t.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
