// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { BookOpen, MessageSquare, ClipboardList, Star, Users, Clock, ArrowRight } from 'lucide-react';
import ubLogo from '@/assets/UB_LIPA_LOGO.png';

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function FloatingIcon({ icon: Icon, className }) {
  return (
    <div className={`absolute opacity-10 text-white ${className}`}>
      <Icon size={48} />
    </div>
  );
}

export default function LandingPage({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: 'Browse the Catalog',
      desc: 'Search through hundreds of books organized by college department. Filter, find, and reserve in seconds.',
      color: 'bg-red-50 text-ub-red',
    },
    {
      icon: MessageSquare,
      title: 'Reserve a Room',
      desc: 'Book discussion rooms in 30-minute slots from 8AM to 5:30PM. Up to 3 reservations per day.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: ClipboardList,
      title: 'Track Your Requests',
      desc: 'Monitor all your book and room reservations in one place. Get notified instantly on updates.',
      color: 'bg-green-50 text-ub-green',
    },
  ];

  const steps = [
    { step: '01', title: 'Create your account', desc: 'Register using your UB email address. Verify once and you\'re in.' },
    { step: '02', title: 'Browse & reserve', desc: 'Find the books or rooms you need and submit your request in seconds.' },
    { step: '03', title: 'Get notified', desc: 'Receive instant notifications when your request is approved or ready.' },
  ];

  const stats = [
    { icon: BookOpen, value: '500+', label: 'Books Available' },
    { icon: Users, value: '1,000+', label: 'Active Students' },
    { icon: MessageSquare, value: '2', label: 'Discussion Rooms' },
    { icon: Clock, value: '8AM–5PM', label: 'Library Hours' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ubLogo} alt="UB" className="w-10 h-10 object-contain" />
            <div>
              <p className={`font-bold text-sm leading-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                University of Batangas
              </p>
              <p className={`text-[10px] leading-tight transition-colors ${scrolled ? 'text-gray-400' : 'text-white/60'}`}>
                Library & Resource Center
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer
                ${scrolled
                  ? 'text-ub-red hover:bg-red-50'
                  : 'text-white/80 hover:text-white'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-ub-red text-white hover:bg-ub-darkRed transition cursor-pointer shadow-lg shadow-ub-red/30"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #6b1010 40%, #922b21 70%, #c0392b 100%)' }}>

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Floating icons */}
        <FloatingIcon icon={BookOpen} className="top-24 left-12 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <FloatingIcon icon={MessageSquare} className="top-32 right-16 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <FloatingIcon icon={Star} className="bottom-32 left-24 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
        <FloatingIcon icon={ClipboardList} className="bottom-24 right-20 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }} />

        {/* Glowing circle behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f5c518 0%, transparent 70%)' }} />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fade-in pt-24">
          {/* UB seal */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-ub-gold/30 blur-xl scale-150" />
              <img src={ubLogo} alt="UB" className="relative w-28 h-28 object-contain drop-shadow-2xl" />
            </div>
          </div>

          <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-4">
            University of Batangas — Lipa Campus
          </p>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Your Gateway to
            <span className="block text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #f5c518, #ffd700)' }}>
              Knowledge
            </span>
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed">
            Reserve books, book discussion rooms, and manage your library requests — all in one place, anytime.
          </p>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="reveal opacity-0 translate-y-4 transition-all duration-500 text-center"
                  style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                    <Icon size={22} className="text-ub-red" />
                  </div>
                  <p className="font-display text-3xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-ub-gray mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 reveal opacity-0 translate-y-4 transition-all duration-500">
            <p className="text-ub-red font-semibold text-sm tracking-widest uppercase mb-3">What We Offer</p>
            <h2 className="font-display text-4xl font-bold text-gray-900">Everything you need,</h2>
            <h2 className="font-display text-4xl font-bold text-gray-900">in one place</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i}
                  className="reveal opacity-0 translate-y-4 transition-all duration-500 bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 group"
                  style={{ transitionDelay: `${i * 150}ms` }}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${f.color}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-ub-gray leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 reveal opacity-0 translate-y-4 transition-all duration-500">
            <p className="text-ub-red font-semibold text-sm tracking-widest uppercase mb-3">Simple Process</p>
            <h2 className="font-display text-4xl font-bold text-gray-900">How it works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i}
                className="reveal opacity-0 translate-y-4 transition-all duration-500 relative"
                style={{ transitionDelay: `${i * 150}ms` }}>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-gray-200 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ub-red to-ub-darkRed flex items-center justify-center mb-5 shadow-lg shadow-ub-red/20">
                    <span className="font-display text-xl font-bold text-white">{s.step}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-ub-gray leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <section className="py-20 reveal opacity-0 translate-y-4 transition-all duration-500"
        style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #922b21 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <img src={ubLogo} alt="UB" className="w-16 h-16 object-contain mx-auto mb-6 opacity-90" />
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Join hundreds of UB students already using the LRC system.
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-ub-red font-bold text-base hover:bg-ub-lightGold transition cursor-pointer shadow-xl"
          >
            Create your account <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-[#1a0a0a] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={ubLogo} alt="UB" className="w-8 h-8 object-contain opacity-80" />
            <div>
              <p className="text-white text-sm font-semibold">University of Batangas</p>
              <p className="text-white/40 text-xs">Library & Resource Center — Lipa Campus</p>
            </div>
          </div>
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} UB Library System. All rights reserved.</p>
        </div>
      </footer>

      {/* Scroll reveal CSS */}
      <style>{`
        .reveal { opacity: 0; transform: translateY(16px); }
        .revealed { opacity: 1 !important; transform: translateY(0) !important; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s ease forwards; }
      `}</style>
    </div>
  );
}
