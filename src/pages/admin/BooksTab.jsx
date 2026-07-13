import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { COLLEGE_LABELS } from '@/lib/constants';
import BookFormModal from '@/components/admin/BookFormModal';
import Modal from '@/components/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BooksTab() {
  const { books, deleteBook } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Catalog</h1>
          <p className="text-ub-gray mt-1">Manage the book collection.</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ub-red text-white text-sm font-semibold hover:bg-ub-darkRed transition cursor-pointer">
          <Plus size={18} /> Add Book
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {books.length === 0 ? (
          <p className="text-sm text-ub-gray px-5 py-8 text-center">No books in the catalog yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-ub-gray text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Title</th>
                  <th className="text-left px-5 py-3 font-semibold">Author</th>
                  <th className="text-left px-5 py-3 font-semibold">College</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3 font-semibold text-gray-900">{b.title}</td>
                    <td className="px-5 py-3 text-ub-gray">{b.author}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-ub-green">
                        {COLLEGE_LABELS[b.college] || b.college}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditing(b); setFormOpen(true); }} className="inline-flex items-center gap-1 text-xs font-semibold text-ub-gray hover:text-ub-red px-2.5 py-1 rounded-lg hover:bg-gray-100 cursor-pointer">
                          <Edit size={12} /> Edit
                        </button>
                        <button onClick={() => setDeleting(b)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-ub-red px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BookFormModal open={formOpen} onClose={() => setFormOpen(false)} book={editing} />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Book" maxWidth="max-w-sm">
        <p className="text-sm text-gray-700">
          Are you sure you want to delete <span className="font-semibold">{deleting?.title}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setDeleting(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer">Cancel</button>
          <button
            onClick={() => { deleteBook(deleting.id); toast.success('Book deleted.'); setDeleting(null); }}
            className="flex-1 py-2.5 rounded-xl bg-ub-red text-white font-semibold hover:bg-ub-darkRed transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}