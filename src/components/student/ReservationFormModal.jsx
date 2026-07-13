import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import PhotoUpload from '@/components/PhotoUpload';
import { useApp } from '@/context/AppContext';
import { ROOMS } from '@/lib/constants';
import { formatSlot } from '@/lib/format';
import toast from 'react-hot-toast';

export default function ReservationFormModal({ open, onClose, selection }) {
  const { session, addReservation } = useApp();
  const [reason, setReason] = useState('');
  const [photo, setPhoto] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setReason(''); setPhoto(''); setError(''); }
  }, [open, selection]);

  if (!selection) return null;
  const room = ROOMS.find((r) => r.id === selection.roomId);
  const slotStr = `${selection.dateValue} ${selection.slot}`;

  const handleSubmit = () => {
    if (reason.trim().length < 4) { setError('Please provide a reason (at least 4 characters).'); return; }
    if (!photo) { setError('A student photo is required.'); return; }
    addReservation({
      type: 'room',
      student: session.userId,
      studentName: session.userName,
      status: 'pending',
      date: new Date().toISOString().slice(0, 10),
      borrowingPurpose: reason.trim(),
      studentPhoto: photo,
      detail: `${room?.name || selection.roomId} · ${formatSlot(slotStr)}`,
      roomId: selection.roomId,
      roomSlot: slotStr,
    });
    toast.success('Room reservation submitted!');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Complete Reservation">
      <div className="space-y-4">
        <div className="bg-ub-lightGold rounded-xl px-4 py-3">
          <p className="text-xs text-ub-gray">Booking summary</p>
          <p className="font-heading font-bold text-ub-red text-lg">{room?.name}</p>
          <p className="text-sm text-ub-gray">{formatSlot(slotStr)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={session.userName} disabled className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input value={session.userId} disabled className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => { setError(''); setReason(e.target.value); }}
            rows={3}
            placeholder="Purpose of room reservation"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student Photo</label>
          <PhotoUpload photo={photo} setPhoto={(p) => { setError(''); setPhoto(p); }} />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer">Back</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-ub-red text-white font-semibold hover:bg-ub-darkRed transition cursor-pointer">Confirm Booking</button>
        </div>
      </div>
    </Modal>
  );
}