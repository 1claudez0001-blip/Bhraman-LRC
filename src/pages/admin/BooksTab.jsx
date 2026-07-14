import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { COLLEGE_LABELS, COLLEGE_KEYS } from '@/lib/constants';
import BookFormModal from '@/components/admin/BookFormModal';
import Modal from '@/components/Modal';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-4"><div className="h-3 w-40 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-3 w-28 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-gray-100" /></td>
      <td className="px-5 py-4"><div className="h-5 w-12 rounded-full bg-gray-100 mx-auto" /></td>
      <td className="px-5 py-4"><div className="h-5 w-12 rounded-full bg-gray-100 mx-auto" /></td>
      <td className="px-5 py-4"><div className="h-3 w-20 bg-gray-100 rounded ml-auto" /></td>
    </tr>
  );
}

export default function BooksTab() {
  const { books, loading, deleteBook } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');

  const filtered = useMemo(() => {
    let b = books;
    if (collegeFilter !== 'all') b = b.filter(b => b.college === collegeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      b = b.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
      );
    }
    return b;
  }, [books, collegeFilter, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Catalog</h1>
          <p className="text-ub-gray mt-1">Manage the book collection.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ub-red text-white text-sm font-semibold hover:bg-ub-darkRed transition cursor-pointer"
        >
          <Plus size={18} /> Add Book
        </button>
      </div>

      {/* Search + College Filter */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ub-gray" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or author..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none text-sm transition"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setCollegeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer
              ${collegeFilter === 'all' ? 'bg-ub-red text-white' : 'bg-white border border-gray-200 text-ub-gray hover:border-ub-red hover:text-ub-red'}`}
          >
            All
          </button>
          {COLLEGE_KEYS.map(k => (
            <button
              key={k}
              onClick={() => setCollegeFilter(k)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer
                ${collegeFilter === k ? 'bg-ub-red text-white' : 'bg-white border border-gray-200 text-ub-gray hover:border-ub-red hover:text-ub-red'}`}
            >
              {COLLEGE_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <table className="w-full text-sm">
            <tbody><SkeletonRow /><SkeletonRow /><SkeletonRow /></tbody>
          </table>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-ub-gray px-5 py-8 text-center">No books found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-ub-gray text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Title</th>
                  <th className="text-left px-5 py-3 font-semibold">Author</th>
                  <th className="text-left px-5 py-3 font-semibold">College</th>
                  <th className="text-center px-5 py-3 font-semibold">Copies</th>
                  <th className="text-center px-5 py-3 font-semibold">Available</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3 font-semibold text-gray-900">{b.title}</td>
                    <td className="px-5 py-3 text-ub-gray">{b.author}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-ub-green">
                        {COLLEGE_LABELS[b.college] || b.college}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-gray-700 font-medium">{b.total_copies}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                        ${b.available_copies === 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-ub-green'}`}>
                        {b.available_copies}/{b.total_copies}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditing(b); setFormOpen(true); }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ub-gray hover:text-ub-red px-2.5 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <Edit size={12} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleting(b)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-ub-red px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
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
          <button onClick={() => setDeleting(null)}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer">
            Cancel
          </button>
          <button
            onClick={async () => {
              await deleteBook(deleting.id);
              toast.success('Book deleted.');
              setDeleting(null);
            }}
            className="flex-1 py-2.5 rounded-xl bg-ub-red text-white font-semibold hover:bg-ub-darkRed transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
