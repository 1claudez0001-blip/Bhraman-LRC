import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Home, BookOpen, MessageSquare, CreditCard, BarChart3, ClipboardList } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileNavbar from '@/components/MobileNavbar';
import HomeTab from '@/pages/student/HomeTab';
import CatalogTab from '@/pages/student/CatalogTab';
import RoomsTab from '@/pages/student/RoomsTab';
import TransactionsTab from '@/pages/student/TransactionsTab';
import DashboardTab from '@/pages/admin/DashboardTab';
import RequestsTab from '@/pages/admin/RequestsTab';
import RoomRequestsTab from '@/pages/admin/RoomRequestsTab';
import BooksTab from '@/pages/admin/BooksTab';
import ubLogo from '@/assets/UB_LIPA_LOGO.png';

export default function DashboardShell() {
  const { session } = useApp();
  const isStudent = session.userType === 'student';
  const [activeTab, setActiveTab] = useState(isStudent ? 'home' : 'dashboard');

  const studentTabs = [
    { key: 'home',    label: 'Home',         icon: Home },
    { key: 'catalog', label: 'Catalog',       icon: BookOpen },
    { key: 'rooms',   label: 'Rooms',         icon: MessageSquare },
    { key: 'trans',   label: 'Transactions',  icon: CreditCard },
  ];

  const adminTabs = [
    { key: 'dashboard', label: 'Dashboard',      icon: BarChart3 },
    { key: 'requests',  label: 'Book Requests',  icon: ClipboardList },
    { key: 'books',     label: 'Catalog',        icon: BookOpen },
    { key: 'rooms',     label: 'Room Requests',  icon: MessageSquare },
  ];

  const tabs = isStudent ? studentTabs : adminTabs;

  const renderContent = () => {
    if (isStudent) {
      switch (activeTab) {
        case 'home':    return <HomeTab />;
        case 'catalog': return <CatalogTab />;
        case 'rooms':   return <RoomsTab />;
        case 'trans':   return <TransactionsTab />;
        default:        return <HomeTab />;
      }
    }
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'requests':  return <RequestsTab />;
      case 'books':     return <BooksTab />;
      case 'rooms':     return <RoomRequestsTab />;
      default:          return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileNavbar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Top header bar — desktop only */}
        <div className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <img src={ubLogo} alt="UB" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">
                University of Batangas
              </p>
              <p className="text-[11px] text-gray-400 leading-tight tracking-wide">
                Library & Resource Center
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{session.userName}</p>
              <p className="text-[11px] text-gray-400 leading-tight">
                {session.userId} · {isStudent ? 'Student' : 'Admin'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-ub-red flex items-center justify-center text-white font-bold text-sm shadow-md shadow-ub-red/30">
              {session.userName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto animate-slide-up">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
