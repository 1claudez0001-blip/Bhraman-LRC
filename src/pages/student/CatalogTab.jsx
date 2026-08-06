import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import FilterPills from '@/components/student/FilterPills';
import BookCard from '@/components/student/BookCard';
import BookReservationModal from '@/components/student/BookReservationModal';
import { Search, BookOpen, Sparkles, X } from 'lucide-react';

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
}

export default function CatalogTab() {
  const { books, reservations, session, loading } = useApp();
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState('');
  const [reservingBook, setReservingBook] = useState(null);
  const [aiMode, setAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFiltered, setAiFiltered] = useState(null);
  const [aiMessage, setAiMessage] = useState('');
  const debounceRef = useRef(null);

  useScrollReveal();

  // Normal filter
  const normalFiltered = useMemo(() => books.filter((b) => {
    const collegeOk = filters.length === 0 || filters.includes(b.college);
    const q = search.trim().toLowerCase();
    const searchOk = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    return collegeOk && searchOk;
  }), [books, filters, search]);

  const filtered = aiFiltered !== null ? aiFiltered : normalFiltered;

  const activeReservationFor = (bookId) => reservations.find(
    (r) =>
      r.type === 'book' &&
      r.book_id === bookId &&
      r.user_id === session.userDbId &&
      (r.status === 'pending' || r.status === 'approved')
  );

  // AI search with debounce
  const runAiSearch = async (query) => {
    if (!query.trim() || !aiMode) return;
    setAiLoading(true);
    setAiMessage('');

    try {
      const bookList = books.map(b => `ID:${b.id} | "${b.title}" by ${b.author} | College: ${b.college}`).join('\n');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a helpful library assistant for University of Batangas Lipa Campus LRC.

Here are the available books in our library:
${bookList}

Student is looking for: "${query}"

Respond ONLY with valid JSON in this exact format, nothing else:
{
  "matchedIds": [1, 2, 3],
  "message": "A short friendly 1-sentence message about why you picked these books."
}

If no books match, return matchedIds as empty array [] and explain briefly in message.`
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || '{}';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      const matched = books.filter(b => parsed.matchedIds?.includes(b.id));
      setAiFiltered(matched);
      setAiMessage(parsed.message || '');
    } catch {
      setAiFiltered(null);
      setAiMessage('Something went wrong. Showing all books instead.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);

    if (!aiMode) return;

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setAiFiltered(null);
      setAiMessage('');
      return;
    }

    // Debounce AI call by 800ms
    debounceRef.current = setTimeout(() => {
      runAiSearch(val);
    }, 800);
  };

  const toggleAiMode = () => {
    setAiMode(prev => !prev);
    setAiFiltered(null);
    setAiMessage('');
    setSearch('');
  };

  const clearSearch = () => {
    setSearch('');
    setAiFiltered(null);
    setAiMessage('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Browse Books</h1>
        <p className="text-ub-gray mt-1">Filter by college and reserve your next read.</p>
      </div>

      <FilterPills filters={filters} setFilters={setFilters} />

      {/* Search bar */}
      <div className="space-y-2">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            {aiLoading ? (
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-ub-red/30 border-t-ub-red rounded-full animate-spin" />
              </div>
            ) : aiMode ? (
              <Sparkles size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ub-red" />
            ) : (
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ub-gray" />
            )}
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder={aiMode ? 'Describe what you want to read…' : 'Search by title or author…'}
              className={`w-full pl-11 pr-10 py-2.5 rounded-xl border bg-white outline-none transition
                ${aiMode
                  ? 'border-ub-red ring-2 ring-ub-red/20 focus:border-ub-red'
                  : 'border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20'
                }`}
            />
            {search && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-ub-gray hover:text-ub-red cursor-pointer">
                <X size={15} />
              </button>
            )}
          </div>

          {/* AI toggle button */}
          <button
            onClick={toggleAiMode}
            title={aiMode ? 'Switch to normal search' : 'Switch to AI search'}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer
              ${aiMode
                ? 'bg-ub-red text-white shadow-md shadow-ub-red/30'
                : 'bg-gray-100 text-ub-gray hover:bg-gray-200'
              }`}
          >
            <Sparkles size={14} />
            {aiMode ? 'AI On' : 'AI'}
          </button>
        </div>

        {/* AI mode hint / result message */}
        {aiMode && !search && (
          <p className="text-xs text-ub-red flex items-center gap-1.5 px-1">
            <Sparkles size={11} /> Try: "something about Philippine history" or "a short love story"
          </p>
        )}
        {aiMessage && (
          <p className="text-xs text-ub-gray flex items-center gap-1.5 px-1 bg-gray-50 rounded-lg py-2 px-3">
            <Sparkles size={11} className="text-ub-red shrink-0" /> {aiMessage}
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
                <div className="h-2 w-1/2 bg-gray-100 rounded" />
                <div className="h-8 w-full bg-gray-100 rounded-xl mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <BookOpen size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-ub-gray">
            {aiMode && search ? 'No books matched your description. Try rephrasing!' : 'No books match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((book, index) => (
            <BookCard
              key={book.id}
              book={book}
              index={index}
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

      <style>{`
        .reveal { opacity: 0; transform: translateY(16px); }
        .revealed { opacity: 1 !important; transform: translateY(0) !important; }
      `}</style>
    </div>
  );
}
