import React from 'react';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

export default function HomeTab() {
  const { session, reservations } = useApp();

  const myBooks = reservations.filter(
    (r) => r.type === 'book' && r.user_id === session.userDbId
  );
  const myRooms = reservations.filter(
    (r) => r.type === 'room' && r.user_id === session.userDbId
  );

  const inProgress = myBooks.filter((r) => r.status === 'pending').length;
  const borrowed = myBooks.filter((r) => r.status === 'approved').length;

  const recent = [...myBooks, ...myRooms]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Welcome!</h1>
        <p className="text-ub-gray mt-1">{session.userName} · {session.userId}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Clock className="text-ub-yellow" size={22} />
            </div>
            <span className="text-3xl font-bold text-gray-900">{inProgress}</span>
          </div>
          <p className="text-sm text-ub-gray mt-3">In-Progress</p>
          <p className="text-xs text-ub-gray/70">Pending book reservations</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="text-ub-green" size={22} />
            </div>
            <span className="text-3xl font-bold text-gray-900">{borrowed}</span>
          </div>
          <p className="text-sm text-ub-gray mt-3">Borrowed</p>
          <p className="text-xs text-ub-gray/70">Approved book reservations</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-ub-red" /> Recent Activity
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-ub-gray py-6 text-center">
            No reservations yet. Browse the catalog to get started.
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
