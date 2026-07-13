import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import RoomReviewModal from '@/components/admin/RoomReviewModal';
import { Eye } from 'lucide-react';
import { formatDate } from '@/lib/format';

export default function RoomRequestsTab() {
  const { reservations, updateRoomBookingStatus } = useApp();
  const [reviewing, setReviewing] = useState(null);

  // Room bookings only (type === 'room')
  const roomRes = reservations.filter((r) => r.type === 'room');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Room Requests</h1>
        <p className="text-ub-gray mt-1">Review and manage room booking requests.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {roomRes.length === 0 ? (
          <p className="text-sm text-ub-gray px-5 py-8 text-center">No room requests yet.</p>
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
                {roomRes.map((r) => (
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
                        <button
                          onClick={() => setReviewing(r)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ub-red px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Eye size={12} /> View Details
                        </button>
                      ) : (
                        <StatusBadge status={r.status} />
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
