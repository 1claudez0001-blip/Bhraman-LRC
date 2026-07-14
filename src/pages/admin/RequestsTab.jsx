import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import StatusBadge from '@/components/StatusBadge';
import AdminReviewModal from '@/components/admin/AdminReviewModal';
import Modal from '@/components/Modal';
import { Eye, Undo2, Search } from 'lucide-react';
import { formatDate } from '@/lib/format';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected', 'returned'];

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-4"><div className="h-3 w-32 bg-gray-100 rounded" /><div className="h-2 w-20 bg-gray-100 rounded mt-1.5" /></td>
      <td className="px-5 py-4"><div className="h-3 w-40 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-gray-100" /></td>
      <td className="px-5 py-4"><div className="h-3 w-20 bg-gray-100 rounded ml-auto" /></td>
    </tr>
  );
}

export default function RequestsTab() {
  const { reservations, loading, updateReservationStatus } = useApp();
  const [reviewing, setReviewing] = useState(null);
  const [confirmReturn, setConfirmReturn] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const bookRes = useMemo(() => {
    let r = reservations.filter(r => r.type === 'book');
    if (statusFilter !== 'all') r = r.filter(r => r.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(r =>
        r.users?.name?.toLowerCase().includes(q) ||
        r.users?.student_id?.toLowerCase().includes(q) ||
        r.books?.title?.toLowerCase().includes(q)
      );
    }
    return r;
  }, [reservations, statusFilter, search]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Book Requests</h1>
        <p className="text-ub-gray mt-1">Review and manage book reservation requests.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ub-gray" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name, ID, or book..."
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
        ) : bookRes.length === 0 ? (
          <p className="text-sm text-ub-gray px-5 py-8 text-center">No requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-ub-gray text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Student</th>
                  <th className="text-left px-5 py-3 font-semibold">Book</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookRes.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-900">{r.users?.name || '—'}</p>
                      <p className="text-xs text-ub-gray">{r.users?.student_id || '—'}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{r.books?.title || '—'}</td>
                    <td className="px-5 py-3 text-ub-gray">{formatDate(r.date)}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-right">
                      {r.status === 'pending' && (
                        <button onClick={() => setReviewing(r)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ub-red px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer">
                          <Eye size={12} /> View Details
                        </button>
                      )}
                      {r.status === 'approved' && (
                        <button onClick={() => setConfirmReturn(r)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ub-green px-2.5 py-1 rounded-lg hover:bg-green-50 cursor-pointer">
                          <Undo2 size={12} /> Mark Returned
                        </button>
                      )}
                      {(r.status === 'returned' || r.status === 'rejected') && (
                        <span className="text-xs text-ub-gray">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminReviewModal open={!!reviewing} onClose={() => setReviewing(null)} reservation={reviewing} />

      {/* Confirm Return Modal */}
      <Modal open={!!confirmReturn} onClose={() => setConfirmReturn(null)} title="Mark as Returned?" maxWidth="max-w-sm">
        <p className="text-sm text-gray-700">
          Are you sure <span className="font-semibold">{confirmReturn?.users?.name}</span> has returned{' '}
          <span className="font-semibold">"{confirmReturn?.books?.title}"</span>?
          This will make the book available again.
        </p>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setConfirmReturn(null)}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer">
            Cancel
          </button>
          <button
            onClick={async () => {
              await updateReservationStatus(confirmReturn.id, 'returned');
              toast.success('Book marked as returned.');
              setConfirmReturn(null);
            }}
            className="flex-1 py-2.5 rounded-xl bg-ub-green text-white font-semibold hover:bg-emerald-600 transition cursor-pointer">
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
}
