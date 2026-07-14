import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import FilterPills from '@/components/student/FilterPills';
import BookCard from '@/components/student/BookCard';
import BookReservationModal from '@/components/student/BookReservationModal';
import { Search } from 'lucide-react';

export default function CatalogTab() {
  const { books, reservations, session } = useApp();
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState('');
  const [reservingBook, setReservingBook] = useState(null);

  const filtered = useMemo(() => books.filter((b) => {
    const collegeOk = filters.length === 0 || filters.includes(b.college);
    const q = search.trim().toLowerCase();
    const searchOk = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    return collegeOk && searchOk;
  }), [books, filters, search]);

  // Check if student already has an active reservation for this book
  const activeReservationFor = (bookId) => reservations.find(
    (r) =>
      r.type === 'book' &&
      r.book_id === bookId &&
      r.user_id === session.userDbId &&
      (r.status === 'pending' || r.status === 'approved')
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Browse Books</h1>
        <p className="text-ub-gray mt-1">Filter by college and reserve your next read.</p>
      </div>

      <FilterPills filters={filters} setFilters={setFilters} />

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ub-gray" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or author…"
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none transition"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-ub-gray">
          No books match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              activeReservation={activeReservationFor(book.id)}
              onReserve={() => setReservingBook(book)}
            />
          ))}
        </div>
      )}

      <BookReservationModal
        open={!!reservingBook}
        onClose={() => setReservingBook(null)}
        book={reservingBook}
      />
    </div>
  );
}
