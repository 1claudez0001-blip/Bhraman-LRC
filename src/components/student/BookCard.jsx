import React, { useState } from 'react';
import { COLLEGE_LABELS } from '@/lib/constants';
import { BookMarked, BookOpen, X } from 'lucide-react';

// Book Detail Modal
function BookDetailModal({ book, onClose, onReserve, activeReservation }) {
  const disabled = !!activeReservation || book.available_copies === 0;
  const btnText = activeReservation
    ? activeReservation.status === 'pending' ? 'Pending' : 'Borrowed'
    : book.available_copies === 0 ? 'Unavailable' : 'Reserve this Book';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Cover image */}
        <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen size={48} className="text-gray-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 cursor-pointer"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/20 text-white backdrop-blur-sm">
              {COLLEGE_LABELS[book.college] || book.college}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">{book.title}</h2>
            <p className="text-sm text-ub-gray mt-0.5">by {book.author}</p>
          </div>

          {book.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{book.description}</p>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
              ${book.available_copies === 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-ub-green'}`}>
              {book.available_copies === 0 ? 'Unavailable' : `${book.available_copies}/${book.total_copies} Available`}
            </span>
          </div>

          <button
            onClick={() => { onClose(); onReserve(); }}
            disabled={disabled}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition
              ${disabled
                ? 'bg-gray-100 text-ub-gray cursor-not-allowed'
                : 'bg-ub-red text-white hover:bg-ub-darkRed cursor-pointer shadow-lg shadow-ub-red/20'
              }`}
          >
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookCard({ book, activeReservation, onReserve, index = 0 }) {
  const [showDetail, setShowDetail] = useState(false);
  const disabled = !!activeReservation || book.available_copies === 0;

  const availabilityColor = book.available_copies === 0
    ? 'bg-red-50 text-red-500'
    : 'bg-green-50 text-ub-green';

  const availabilityLabel = book.available_copies === 0
    ? 'Unavailable'
    : `${book.available_copies}/${book.total_copies} left`;

  return (
    <>
      <div
        className="reveal opacity-0 translate-y-4 transition-all duration-500 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer group overflow-hidden"
        style={{ transitionDelay: `${(index % 6) * 80}ms` }}
        onClick={() => setShowDetail(true)}
      >
        {/* Cover */}
        <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookMarked size={36} className="text-gray-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-heading font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">{book.title}</h3>
          <p className="text-xs text-ub-gray mt-0.5 line-clamp-1">{book.author}</p>

          {book.description && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{book.description}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ub-lightGold text-ub-darkRed">
              {COLLEGE_LABELS[book.college] || book.college}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${availabilityColor}`}>
              {availabilityLabel}
            </span>
          </div>

          <button
            onClick={e => { e.stopPropagation(); if (!disabled) onReserve(); }}
            disabled={disabled}
            className={`mt-3 w-full py-2 rounded-xl text-xs font-semibold transition
              ${disabled
                ? 'bg-gray-100 text-ub-gray cursor-not-allowed'
                : 'bg-ub-red text-white hover:bg-ub-darkRed cursor-pointer'
              }`}
          >
            {activeReservation
              ? activeReservation.status === 'pending' ? 'Pending' : 'Borrowed'
              : book.available_copies === 0 ? 'Unavailable' : 'Reserve'
            }
          </button>
        </div>
      </div>

      {showDetail && (
        <BookDetailModal
          book={book}
          onClose={() => setShowDetail(false)}
          onReserve={onReserve}
          activeReservation={activeReservation}
        />
      )}
    </>
  );
}
