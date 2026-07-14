import React from 'react';
import { COLLEGE_LABELS } from '@/lib/constants';
import { BookMarked } from 'lucide-react';

export default function BookCard({ book, activeReservation, onReserve }) {
  const disabled = !!activeReservation || book.available_copies === 0;

  const btnText = activeReservation
    ? activeReservation.status === 'pending' ? 'Pending' : 'Borrowed'
    : book.available_copies === 0 ? 'Unavailable' : 'Reserve';

  const availabilityLabel = book.available_copies === 0
    ? 'Unavailable'
    : `Available (${book.available_copies}/${book.total_copies})`;

  const availabilityColor = book.available_copies === 0
    ? 'bg-red-50 text-red-500'
    : 'bg-green-50 text-ub-green';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="w-11 h-11 rounded-xl bg-ub-lightGold flex items-center justify-center shrink-0">
          <BookMarked className="text-ub-red" size={20} />
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${availabilityColor}`}>
          {availabilityLabel}
        </span>
      </div>
      <h3 className="font-heading font-semibold text-gray-900 mt-3 line-clamp-2">{book.title}</h3>
      <p className="text-sm text-ub-gray mt-0.5">{book.author}</p>
      <div className="mt-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-ub-lightGold text-ub-darkRed">
          {COLLEGE_LABELS[book.college] || book.college}
        </span>
      </div>
      <button
        onClick={onReserve}
        disabled={disabled}
        className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition
          ${disabled
            ? 'bg-gray-100 text-ub-gray cursor-not-allowed'
            : 'bg-ub-red text-white hover:bg-ub-darkRed cursor-pointer'
          }`}
      >
        {btnText}
      </button>
    </div>
  );
}
