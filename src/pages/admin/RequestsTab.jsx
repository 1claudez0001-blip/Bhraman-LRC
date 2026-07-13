import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import AdminReviewModal from '@/components/admin/AdminReviewModal';
import { Eye, Undo2 } from 'lucide-react';

export default function RequestsTab() {
  const { reservations, updateReservationStatus } = useApp();
  const [reviewing, setReviewing] = useState(null);
  const bookRes = reservations.filter((r) => r.type === 'book');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Book Requests</h1>
        <p className="text-ub-gray mt-1">Review and manage book reservation requests.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {bookRes.length === 0 ? (
          <p className="text-sm text-ub-gray px-5 py-8 text-center">No book requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-ub-gray text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Student</th>
                  <th className="text-left px-5 py-3 font-semibold">Book</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookRes.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-900">{r.studentName}</p>
                      <p className="text-xs text-ub-gray">{r.student}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{r.detail}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-right">
                      {r.status === 'pending' && (
                        <button onClick={() => setReviewing(r)} className="inline-flex items-center gap-1 text-xs font-semibold text-ub-red px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer">
                          <Eye size={12} /> View Details
                        </button>
                      )}
                      {r.status === 'approved' && (
                        <button onClick={() => updateReservationStatus(r.id, 'returned')} className="inline-flex items-center gap-1 text-xs font-semibold text-ub-green px-2.5 py-1 rounded-lg hover:bg-green-50 cursor-pointer">
                          <Undo2 size={12} /> Mark Returned
                        </button>
                      )}
                      {(r.status === 'returned' || r.status === 'rejected') && <span className="text-xs text-ub-gray">Completed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminReviewModal open={!!reviewing} onClose={() => setReviewing(null)} reservation={reviewing} />
    </div>
  );
}