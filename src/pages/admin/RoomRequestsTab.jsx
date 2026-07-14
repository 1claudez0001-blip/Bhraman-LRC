import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import RoomReviewModal from '@/components/admin/RoomReviewModal';
import { Eye, Search } from 'lucide-react';
import { formatDate } from '@/lib/format';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-4"><div className="h-3 w-32 bg-gray-100 rounded" /><div className="h-2 w-20 bg-gray-100 rounded mt-1.5" /></td>
      <td className="px-5 py-4"><div className="h-3 w-28 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-3 w-20 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-3 w-16 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-gray-100" /></td>
      <td className="px-5 py-4"><div className="h-3 w-20 bg-gray-100 rounded ml-auto" /></td>
    </tr>
  );
}

export default function RoomRequestsTab() {
  const { reservations, loading, updateRoomBookingStatus } = useApp();
  const [reviewing, setReviewing] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const roomRes = useMemo(() => {
    let r = reservations.filter(r => r.type === 'room');
    if (statusFilter !== 'all') r = r.filter(r => r.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(r =>
        r.users?.name?.toLowerCase().includes(q) ||
        r.users?.student_id?.toLowerCase().includes(q) ||
        r.rooms?.name?.toLowerCase().includes(q)
      );
    }
    return r;
  }, [reservations, statusFilter, search]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Room Requests</h1>
        <p className="text-ub-gray mt-1">Review and manage room booking requests.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ub-gray" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name, ID, or room..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none text-sm transition"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition cursor-pointer
                ${statusFilter === s ? 'bg-ub-red text-white' : 'bg-white border border-gray-200 text-ub-gray hover:border-ub-red hover:text-ub-red'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <table className="w-full text-sm">
            <tbody><SkeletonRow /><SkeletonRow /><SkeletonRow /></tbody>
          </table>
        ) : roomRes.length === 0 ? (
          <p className="text-sm text-ub-gray px-5 py-8 text-center">No room requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-ub-gray text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Student</th>
                  <th className="text-left px-5 py-3 font-semibold">Room</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Time</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roomRes.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-900">{r.users?.name || '—'}</p>
                      <p className="text-xs text-ub-gray">{r.users?.student_id || '—'}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{r.rooms?.name || r.room_id}</td>
                    <td className="px-5 py-3 text-ub-gray">{formatDate(r.date)}</td>
                    <td className="px-5 py-3 text-ub-gray">{r.time_slot}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-right">
                      {r.status === 'pending' ? (
                        <button onClick={() => setReviewing(r)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ub-red px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer">
                          <Eye size={12} /> View Details
                        </button>
                      ) : (
                        <span className="text-xs text-ub-gray">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RoomReviewModal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        reservation={reviewing}
        onUpdateStatus={updateRoomBookingStatus}
      />
    </div>
  );
}
