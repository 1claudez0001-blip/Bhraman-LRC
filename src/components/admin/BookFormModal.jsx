import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { useApp } from '@/context/AppContext';
import { COLLEGE_KEYS, COLLEGE_LABELS } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function BookFormModal({ open, onClose, book }) {
  const { addBook, updateBook } = useApp();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [college, setCollege] = useState(COLLEGE_KEYS[0]);
  const [totalCopies, setTotalCopies] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(book?.title || '');
      setAuthor(book?.author || '');
      setCollege(book?.college || COLLEGE_KEYS[0]);
      setTotalCopies(book?.total_copies || 1);
      setError('');
    }
  }, [open, book]);

  const isEdit = !!book;

  const handleSubmit = async () => {
    if (!title.trim() || !author.trim() || !college) {
      setError('All fields are required.');
      return;
    }
    if (totalCopies < 1) {
      setError('Must have at least 1 copy.');
      return;
    }

    if (isEdit) {
      // When editing, adjust available_copies proportionally
      const diff = totalCopies - book.total_copies;
      const newAvailable = Math.max(0, book.available_copies + diff);
      await updateBook(book.id, {
        title: title.trim(),
        author: author.trim(),
        college,
        total_copies: totalCopies,
        available_copies: newAvailable,
      });
      toast.success('Book updated.');
    } else {
      await addBook({
        title: title.trim(),
        author: author.trim(),
        college,
        total_copies: totalCopies,
        available_copies: totalCopies,
      });
      toast.success('Book added.');
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Book' : 'Add Book'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => { setError(''); setTitle(e.target.value); }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
            placeholder="Book title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <input
            value={author}
            onChange={(e) => { setError(''); setAuthor(e.target.value); }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
            placeholder="Author name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
          <select
            value={college}
            onChange={(e) => { setError(''); setCollege(e.target.value); }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none cursor-pointer"
          >
            {COLLEGE_KEYS.map((k) => <option key={k} value={k}>{COLLEGE_LABELS[k]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Copies
            {isEdit && (
              <span className="text-xs text-ub-gray ml-2">
                (currently {book.available_copies}/{book.total_copies} available)
              </span>
            )}
          </label>
          <input
            type="number"
            min={1}
            value={totalCopies}
            onChange={(e) => { setError(''); setTotalCopies(parseInt(e.target.value) || 1); }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
          />
          {isEdit && totalCopies !== book.total_copies && (
            <p className="text-xs text-ub-gray mt-1">
              Available copies will adjust to {Math.max(0, book.available_copies + (totalCopies - book.total_copies))}/{totalCopies}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-ub-red text-white font-semibold hover:bg-ub-darkRed transition cursor-pointer"
          >
            {isEdit ? 'Save Changes' : 'Add Book'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
