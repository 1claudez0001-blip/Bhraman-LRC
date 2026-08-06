import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LogOut, ExternalLink, Menu, X } from 'lucide-react';
import { LMS_URL } from '@/lib/constants';
import ubLogo from '@/assets/UB_LIPA_LOGO.png';

export default function MobileNavbar({ tabs, activeTab, setActiveTab }) {
  const { session, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden sticky top-0 z-30"
        style={{ background: 'linear-gradient(90deg, #1a0a0a 0%, #2d1010 100%)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo + name */}
          <div className="flex items-center gap-2.5">
            <img src={ubLogo} alt="UB" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-white font-bold text-xs leading-tight">UB Library</p>
              <p className="text-white/40 text-[10px] leading-tight">LRC</p>
            </div>
          </div>

          {/* User name */}
          <span className="text-white/50 text-xs truncate max-w-[35%]">{session.userName}</span>

          {/* Hamburger menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition cursor-pointer"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-scale-in">
                <a
                  href={LMS_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <ExternalLink size={15} className="text-ub-gray" />
                  Open LMS
                </a>
                <a
                  href="https://ub.edu.ph"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <ExternalLink size={15} className="text-ub-gray" />
                  UB Website
                </a>
                <div className="border-t border-gray-100" />
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut size={15} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-white/10"
        style={{ background: 'linear-gradient(90deg, #1a0a0a 0%, #2d1010 100%)' }}>
        <div className="flex">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all duration-200 cursor-pointer relative
                  ${active ? 'text-white' : 'text-white/35 hover:text-white/60'}`}
              >
                {/* Active indicator dot */}
                {active && (
                  <span className="absolute top-1.5 w-1 h-1 rounded-full bg-ub-red" />
                )}
                <Icon size={20} className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                {t.label}
              </button>
            );
          })}
        </div>
        {/* Safe area for phones with home indicator */}
        <div className="h-safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </nav>

      {/* Spacer so content doesn't hide behind bottom nav */}
      <div className="md:hidden h-16" />
    </>
  );
}
