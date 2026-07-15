import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Toaster } from 'react-hot-toast';
import Login from '@/pages/Login';
import DashboardShell from '@/components/DashboardShell';
import LandingPage from '@/pages/LandingPage';

function MainAppInner() {
  const { session } = useApp();
  const [page, setPage] = useState('landing'); // 'landing' | 'login' | 'register'

  // If logged in, always show dashboard
  if (session.userType) return <DashboardShell />;

  // Show landing page
  if (page === 'landing') {
    return <LandingPage onNavigate={setPage} />;
  }

  // Show login/register
  return <Login initialTab={page} onBack={() => setPage('landing')} />;
}

export default function MainApp() {
  return (
    <AppProvider>
      <MainAppInner />
      <Toaster
        position="top-right"
        toastOptions={{ style: { borderRadius: '12px', background: '#1f2937', color: '#fff', fontSize: '14px' } }}
      />
    </AppProvider>
  );
}
