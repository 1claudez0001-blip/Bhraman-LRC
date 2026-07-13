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
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(book?.title || '');
      setAuthor(book?.author || '');
      setCollege(book?.college || COLLEGE_KEYS[0]);
      setError('');
    }
  }, [open, book]);

  const isEdit = !!book;

  const handleSubmit = () => {
    if (!title.trim() || !author.trim() || !college) { setError('All fields are required.'); return; }
    if (isEdit) {
      updateBook(book.id, { title: title.trim(), author: author.trim(), college });
      toast.success('Book updated.');
    } else {
      addBook({ title: title.trim(), author: author.trim(), college });
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

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-ub-red text-white font-semibold hover:bg-ub-darkRed transition cursor-pointer">
            {isEdit ? 'Save Changes' : 'Add Book'}
          </button>
        </div>
      </div>
    </Modal>
  );
}