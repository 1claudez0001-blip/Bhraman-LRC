import React, { useState } from 'react';
import Modal from '@/components/Modal';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SoftcopyRequestModal({ open, onClose, book }) {
  const { session } = useApp();
  const [reason, setReason] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) { setError('Please provide a reason for your request.'); return; }
    if (!acknowledged) { setError('You must acknowledge the copyright disclaimer to proceed.'); return; }

    setLoading(true);
    const { error: err } = await supabase.from('softcopy_requests').insert([{
      user_id: session.userDbId,
      book_id: book.id,
      status: 'open',
      student_acknowledged: true,
      reason: reason.trim(),
    }]);

    if (err) { setError('Failed to submit request. Please try again.'); setLoading(false); return; }

    // Notify admins and SAs
    const { data: staff } = await supabase
      .from('users')
      .select('id')
      .in('role', ['admin', 'sa']);

    if (staff?.length) {
      await supabase.from('notifications').insert(
        staff.map(s => ({
          user_id: s.id,
          title: 'New Softcopy Request 📄',
          message: `${session.userName} requested a softcopy of "${book.title}".`,
          type: 'pending',
        }))
      );
    }

    toast.success('Softcopy request submitted!');
    setReason('');
    setAcknowledged(false);
    setLoading(false);
    onClose();
  };

  if (!book) return null;

  return (
    <Modal open={open} onClose={onClose} title="Request Softcopy">
      <div className="space-y-4">
        {/* Book info */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-12 h-16 object-cover rounded-lg" />
          ) : (
            <div className="w-12 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 text-sm">{book.title}</p>
            <p className="text-xs text-ub-gray">{book.author}</p>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for request</label>
          <textarea
            value={reason}
            onChange={e => { setError(''); setReason(e.target.value); }}
            rows={3}
            placeholder="Why do you need a softcopy of this book?"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition resize-none text-sm"
          />
        </div>

        {/* Copyright acknowledgement */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 font-semibold">Copyright Disclaimer</p>
          </div>
          <p className="text-xs text-yellow-700 leading-relaxed mb-3">
            Requesting, sharing, or distributing copyrighted material without proper authorization may be illegal under the Intellectual Property Code of the Philippines and international copyright laws. By proceeding, you acknowledge that you are requesting this material for educational purposes only and that you take full responsibility for its use.
          </p>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={e => { setError(''); setAcknowledged(e.target.checked); }}
              className="mt-0.5 accent-ub-red cursor-pointer"
            />
            <span className="text-xs text-yellow-800 font-medium">
              I have read and understood the copyright disclaimer above and I take full responsibility for my request.
            </span>
          </label>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-ub-red text-white font-semibold hover:bg-ub-darkRed transition cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
