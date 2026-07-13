import React from 'react';
import { useApp } from '@/context/AppContext';
import { LogOut, ExternalLink } from 'lucide-react';
import { LMS_URL, LRC_URL, UB_LOGO_URL } from '@/lib/constants';

export default function MobileNavbar({ tabs, activeTab, setActiveTab }) {
  const { session, logout } = useApp();
  const isStudent = session.userType === 'student';

  return (
    <header className="md:hidden bg-[#1a1a1a] sticky top-0 z-30">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img
            src={UB_LOGO_URL}
            alt="UB"
            className="w-8 h-8 object-contain rounded-full"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="text-white font-bold text-sm">UB Library</span>
        </div>
        <span className="text-white/60 text-xs truncate max-w-[30%]">{session.userName}</span>
        <div className="flex items-center gap-1.5">
          <a
            href={LMS_URL}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white/80 text-xs font-semibold flex items-center gap-1"
          >
            LMS <ExternalLink size={10} />
          </a>
          <button
            onClick={logout}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white/80 text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition cursor-pointer
                ${active
                  ? 'text-white border-b-2 border-ub-red'
                  : 'text-white/40 border-b-2 border-transparent'
                }`}
            >
              <Icon size={17} />
              {t.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
