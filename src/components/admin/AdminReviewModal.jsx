import React from 'react';
import Modal from '@/components/Modal';
import { useApp } from '@/context/AppContext';
import { XCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReviewModal({ open, onClose, reservation }) {
  const { updateReservationStatus } = useApp();
  if (!reservation) return null;

  const act = async (status) => {
    const { error } = await updateReservationStatus(reservation.id, status);
    if (error) {
      toast.error('Something went wrong. Try again.');
      return;
    }
    toast.success(status === 'approved' ? 'Request approved!' : 'Request rejected.');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Review Book Request">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-ub-gray">Student Name</p>
            <p className="font-semibold text-gray-900">{reservation.users?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-ub-gray">Student ID</p>
            <p className="font-semibold text-gray-900">{reservation.users?.student_id || '—'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-ub-gray">Book</p>
            <p className="font-heading font-bold text-ub-red">{reservation.books?.title || '—'}</p>
          </div>
        </div>

        {reservation.photo_url && (
          <div>
            <p className="text-xs text-ub-gray mb-1">Student Photo</p>
            <img
              src={reservation.photo_url}
              alt="Student"
              className="w-full h-48 object-cover rounded-xl border border-gray-200"
            />
          </div>
        )}

        <div>
          <p className="text-xs text-ub-gray mb-1">Purpose</p>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
            {reservation.purpose || '—'}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => act('rejected')}
            className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <XCircle size={16} /> Reject
          </button>
          <button
            onClick={() => act('approved')}
            className="flex-1 py-2.5 rounded-xl bg-ub-green text-white font-semibold hover:bg-emerald-600 transition cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <CheckCircle size={16} /> Accept
          </button>
        </div>
      </div>
    </Modal>
  );
}
