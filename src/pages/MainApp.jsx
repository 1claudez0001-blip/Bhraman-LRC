import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Toaster } from 'react-hot-toast';
import Login from '@/pages/Login';
import DashboardShell from '@/components/DashboardShell';
import LandingPage from '@/pages/LandingPage';
import ModePicker from '@/pages/ModePicker';

function MainAppInner() {
  const { session } = useApp();
  const [page, setPage] = useState('landing');
  const [saMode, setSaMode] = useState(null); // 'student' | 'sa'

  // Logged in
  if (session.userType) {
    // SA user needs to pick mode first
    if (session.userType === 'sa' && !saMode) {
      return <ModePicker session={session} onPick={setSaMode} />;
    }
    return <DashboardShell saMode={saMode} setSaMode={setSaMode} />;
  }

  if (page === 'landing') return <LandingPage onNavigate={setPage} />;
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
