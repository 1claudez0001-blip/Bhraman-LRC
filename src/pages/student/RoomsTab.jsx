import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import CalendarModal from '@/components/student/CalendarModal';
import ReservationFormModal from '@/components/student/ReservationFormModal';
import { ROOMS } from '@/lib/constants';
import { todayStr, formatSlot } from '@/lib/format';
import { Plus, AlertTriangle, X } from 'lucide-react';

export default function RoomsTab() {
  const { session, reservations, cancelReservation } = useApp();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selection, setSelection] = useState(null);

  const myRoomRes = reservations.filter((r) => r.type === 'room' && r.student === session.userId);
  const todays = myRoomRes.filter((r) => r.date === todayStr() && (r.status === 'pending' || r.status === 'approved'));
  const atLimit = todays.length >= 3;
  const roomName = (id) => ROOMS.find((r) => r.id === id)?.name || id;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Reserve Room</h1>
          <p className="text-ub-gray mt-1">Book a discussion room in 30-minute slots.</p>
        </div>
        <button
          onClick={() => setCalendarOpen(true)}
          disabled={atLimit}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${atLimit ? 'bg-gray-100 text-ub-gray cursor-not-allowed' : 'bg-ub-red text-white hover:bg-ub-darkRed cursor-pointer'}`}
        >
          <Plus size={18} /> Reserve Room <span className="opacity-80">· Max 3</span>
        </button>
      </div>

      {atLimit && (
        <div className="flex items-center gap-2 text-sm text-ub-yellow bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-xl">
          <AlertTriangle size={16} /> You've reached the daily limit of 3 room reservations. Please try again tomorrow.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-heading font-semibold text-gray-900">My Room Bookings</h2>
        </div>
        {myRoomRes.length === 0 ? (
          <p className="text-sm text-ub-gray px-5 py-8 text-center">No room bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-ub-gray text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Room</th>
                  <th className="text-left px-5 py-3 font-semibold">Date &amp; Time</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myRoomRes.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3 font-medium text-gray-900">{roomName(r.roomId)}</td>
                    <td className="px-5 py-3 text-ub-gray">{formatSlot(r.roomSlot)}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-right">
                      {r.status === 'pending' ? (
                        <button onClick={() => cancelReservation(r.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-ub-red px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer">
                          <X size={12} /> Cancel
                        </button>
                      ) : <span className="text-xs text-ub-gray">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CalendarModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onNext={(sel) => { setSelection(sel); setCalendarOpen(false); setFormOpen(true); }}
      />
      <ReservationFormModal open={formOpen} onClose={() => setFormOpen(false)} selection={selection} />
    </div>
  );
}