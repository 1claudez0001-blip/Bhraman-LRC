import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Toaster } from 'react-hot-toast';
import Login from '@/pages/Login';
import DashboardShell from '@/components/DashboardShell';

function MainAppInner() {
  const { session } = useApp();
  if (!session.userType) return <Login />;
  return <DashboardShell />;
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