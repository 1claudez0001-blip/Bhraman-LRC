import React from 'react';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import { formatDate } from '@/lib/format';
import { X } from 'lucide-react';

function Section({ title, children, empty }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-heading font-semibold text-gray-900">{title}</h2>
      </div>
      {empty ? <p className="text-sm text-ub-gray px-5 py-6 text-center">{empty}</p> : children}
    </div>
  );
}

export default function TransactionsTab() {
  const { session, reservations, cancelReservation, cancelRoomBooking } = useApp();

  // Book reservations — from 'reservations' table (no type field, has book_id)
  const bookRes = reservations.filter(
    (r) => r.type !== 'room' && r.user_id === session.userDbId
  );

  // Room bookings — from 'room_bookings' table (type === 'room')
  const roomRes = reservations.filter(
    (r) => r.type === 'room' && r.user_id === session.userDbId
  );

  const CancelBookBtn = ({ id }) => (
    <button
      onClick={() => cancelReservation(id)}
      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-ub-red px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
    >
      <X size={12} /> Cancel
    </button>
  );

  const CancelRoomBtn = ({ id }) => (
    <button
      onClick={() => cancelRoomBooking(id)}
      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-ub-red px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
    >
      <X size={12} /> Cancel
    </button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">My Reservations</h1>
        <p className="text-ub-gray mt-1">Track and manage your book and room requests.</p>
      </div>

      {/* Book Reservations */}
      <Section title="Books" empty={bookRes.length === 0 ? 'No book reservations yet.' : null}>
        {bookRes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-ub-gray text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Book</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookRes.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {r.books?.title || '—'}
                    </td>
                    <td className="px-5 py-3 text-ub-gray">{formatDate(r.date)}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-right">
                      {r.status === 'pending'
                        ? <CancelBookBtn id={r.id} />
                        : <span className="text-xs text-ub-gray">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Room Bookings */}
      <Section title="Rooms" empty={roomRes.length === 0 ? 'No room bookings yet.' : null}>
        {roomRes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-ub-gray text-xs uppercase">
                <tr>
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
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {r.rooms?.name || r.room_id}
                    </td>
                    <td className="px-5 py-3 text-ub-gray">{formatDate(r.date)}</td>
                    <td className="px-5 py-3 text-ub-gray">{r.time_slot}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-right">
                      {r.status === 'pending'
                        ? <CancelRoomBtn id={r.id} />
                        : <span className="text-xs text-ub-gray">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
