import React from 'react';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import { BookOpen, CheckCircle, Clock, BookMarked, MessageSquare } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-xl bg-gray-100" />
        <div className="w-10 h-8 rounded-lg bg-gray-100" />
      </div>
      <div className="h-3 w-20 bg-gray-100 rounded mt-4" />
      <div className="h-2 w-32 bg-gray-100 rounded mt-2" />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeTab() {
  const { session, reservations, loading, books } = useApp();

  const myBooks = reservations.filter(r => r.type === 'book' && r.user_id === session.userDbId);
  const myRooms = reservations.filter(r => r.type === 'room' && r.user_id === session.userDbId);

  const inProgress = myBooks.filter(r => r.status === 'pending').length;
  const borrowed = myBooks.filter(r => r.status === 'approved').length;
  const roomsToday = myRooms.filter(r => {
    const today = new Date().toISOString().slice(0, 10);
    return r.date === today && (r.status === 'pending' || r.status === 'approved');
  }).length;

  const recent = [...myBooks, ...myRooms]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">
          {getGreeting()}, {session.userName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-ub-gray mt-1">{session.userId} · Welcome to UB Library & Resource Center</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center">
                <Clock className="text-ub-yellow" size={22} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{inProgress}</span>
            </div>
            <p className="text-sm font-medium text-gray-700 mt-3">In-Progress</p>
            <p className="text-xs text-ub-gray/70">Pending book requests</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="text-ub-green" size={22} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{borrowed}</span>
            </div>
            <p className="text-sm font-medium text-gray-700 mt-3">Borrowed</p>
            <p className="text-xs text-ub-gray/70">Approved book reservations</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <MessageSquare className="text-blue-500" size={22} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{roomsToday}</span>
            </div>
            <p className="text-sm font-medium text-gray-700 mt-3">Rooms Today</p>
            <p className="text-xs text-ub-gray/70">Active room bookings today</p>
          </div>
        </div>
      )}

      {/* Quick shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-ub-red to-ub-darkRed rounded-2xl p-4 text-white shadow-md shadow-ub-red/20">
          <BookMarked size={22} className="mb-2 opacity-90" />
          <p className="font-semibold text-sm">Browse Catalog</p>
          <p className="text-xs opacity-70 mt-0.5">{books.length} books available</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 text-white shadow-md">
          <MessageSquare size={22} className="mb-2 opacity-90" />
          <p className="font-semibold text-sm">Reserve a Room</p>
          <p className="text-xs opacity-70 mt-0.5">2 discussion rooms</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-ub-red" /> Recent Activity
        </h2>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100" />
                <div className="flex-1">
                  <div className="h-3 w-40 bg-gray-100 rounded" />
                  <div className="h-2 w-24 bg-gray-100 rounded mt-1.5" />
                </div>
                <div className="h-5 w-16 rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-ub-gray py-6 text-center">
            No activity yet. Browse the catalog to get started!
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((r) => (
              <li key={`${r.type}-${r.id}`} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg">{r.type === 'book' ? '📚' : '💬'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {r.type === 'book' ? r.books?.title : r.rooms?.name || r.room_id}
                    </p>
                    <p className="text-xs text-ub-gray capitalize">{r.type} reservation</p>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
