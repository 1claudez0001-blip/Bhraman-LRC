import React from 'react';
import { useApp } from '@/context/AppContext';
import { LogOut, ExternalLink } from 'lucide-react';
import { LMS_URL, LRC_URL, UB_LOGO_URL } from '@/lib/constants';

export default function Sidebar({ tabs, activeTab, setActiveTab }) {
  const { session, logout } = useApp();
  const isStudent = session.userType === 'student';

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-[#1a1a1a] min-h-screen">

      {/* Logo area */}
      <div className="flex flex-col items-center px-4 py-6 border-b border-white/10">
        <img
          src={UB_LOGO_URL}
          alt="University of Batangas"
          className="w-16 h-16 object-contain rounded-full mb-3"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <p className="text-white font-bold text-sm text-center leading-tight">University of Batangas</p>
        <p className="text-white/40 text-xs mt-1">{isStudent ? 'Library Portal' : 'Admin Portal'}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer
                ${active
                  ? 'bg-ub-red text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
            >
              <Icon size={17} />
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <a
          href={LMS_URL}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition"
        >
          <ExternalLink size={17} />
          UBian LMS
        </a>
        {isStudent && (
          <a
            href={LRC_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <ExternalLink size={17} />
            LRC Site
          </a>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-red-900/40 hover:text-red-400 transition cursor-pointer"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>

    </aside>
  );
}
