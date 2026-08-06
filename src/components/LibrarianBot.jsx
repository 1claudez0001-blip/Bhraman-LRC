import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, X, Send, Minus, BookOpen, ExternalLink } from 'lucide-react';

const GOOGLE_BOOKS_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

async function callClaude(body) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

function EbookCard({ book }) {
  const info = book.volumeInfo;
  const link = info.previewLink || info.infoLink;
  const cover = info.imageLinks?.thumbnail;
  return (
    <a href={link} target="_blank" rel="noreferrer"
      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition group">
      {cover ? (
        <img src={cover} alt={info.title} className="w-10 h-14 object-cover rounded shrink-0" />
      ) : (
        <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center shrink-0">
          <BookOpen size={14} className="text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">{info.title}</p>
        <p className="text-[10px] text-ub-gray mt-0.5 truncate">{info.authors?.join(', ')}</p>
        <span className="inline-flex items-center gap-1 text-[10px] text-ub-red font-semibold mt-1">
          <ExternalLink size={9} /> Read online
        </span>
      </div>
    </a>
  );
}

export default function LibrarianBot() {
  const { books, session } = useApp();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi ${session.userName?.split(' ')[0]}! 👋 I'm your AI Librarian. Tell me what you're in the mood to read and I'll find the best books for you — from our collection and online!`,
      ebooks: [],
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const searchEbooks = async (query) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&filter=free-ebooks&maxResults=3&key=${GOOGLE_BOOKS_KEY}`
      );
      const data = await res.json();
      return data.items || [];
    } catch {
      return [];
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const bookList = books.map(b =>
        `ID:${b.id} | "${b.title}" by ${b.author} | College: ${b.college} | Available: ${b.available_copies}`
      ).join('\n');

      const history = messages.map(m => ({
        role: m.role,
        content: m.text,
      }));

      const data = await callClaude({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `You are a friendly, helpful AI Librarian for University of Batangas Lipa Campus Library & Resource Center.
You help students find books to read. Be warm, concise, and enthusiastic about reading.
Keep responses short (2-4 sentences max).

Available books in the library:
${bookList}

When recommending, mention specific titles from the library when relevant.
Also suggest an ebook search keyword (1-3 words) by ending your response with: [SEARCH: keyword]
If the question isn't about books, gently redirect to library topics.`,
        messages: [
          ...history,
          { role: 'user', content: userMsg }
        ]
      });

      let text = data.content?.[0]?.text || "I'm not sure about that. Try asking me about books!";

      const searchMatch = text.match(/\[SEARCH:\s*(.+?)\]/);
      const searchKeyword = searchMatch ? searchMatch[1].trim() : userMsg;
      text = text.replace(/\[SEARCH:\s*.+?\]/, '').trim();

      const ebooks = await searchEbooks(searchKeyword);
      setMessages(prev => [...prev, { role: 'assistant', text, ebooks }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "Sorry, I'm having trouble connecting right now. Please try again!",
        ebooks: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-20 md:bottom-6 md:right-24 z-40 w-14 h-14 rounded-full bg-ub-red text-white shadow-xl shadow-ub-red/40 flex items-center justify-center hover:bg-ub-darkRed transition hover:scale-110 cursor-pointer"
        title="Ask AI Librarian"
      >
        <Sparkles size={22} />
      </button>
    );
  }

  if (minimized) {
    return (
      <div
        onClick={() => setMinimized(false)}
        className="fixed bottom-20 right-20 md:bottom-6 md:right-24 z-40 flex items-center gap-3 bg-ub-red text-white px-4 py-3 rounded-2xl shadow-2xl cursor-pointer hover:bg-ub-darkRed transition"
      >
        <Sparkles size={16} className="animate-pulse" />
        <div>
          <p className="text-xs font-semibold leading-tight">AI Librarian</p>
          <p className="text-[10px] opacity-70">tap to open</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setOpen(false); setMinimized(false); }}
          className="ml-1 opacity-70 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-24 z-40 w-[calc(100vw-2rem)] max-w-sm flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
      style={{ height: '70vh', maxHeight: '520px' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: 'linear-gradient(135deg, #922b21, #c0392b)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">AI Librarian</p>
            <p className="text-white/60 text-[10px]">Powered by Claude</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(true)}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer text-white">
            <Minus size={13} />
          </button>
          <button onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer text-white">
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] space-y-2">
              <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-snug
                ${m.role === 'user'
                  ? 'bg-ub-red text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                }`}>
                {m.text}
              </div>
              {m.ebooks?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-ub-gray font-semibold px-1 flex items-center gap-1">
                    <BookOpen size={10} /> Free ebooks found online
                  </p>
                  {m.ebooks.map((eb, j) => (
                    <EbookCard key={j} book={eb} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-ub-gray rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-ub-gray rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-ub-gray rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-2 shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="What would you like to read?"
          className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none text-sm transition"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-9 h-9 rounded-xl bg-ub-red text-white flex items-center justify-center hover:bg-ub-darkRed transition disabled:opacity-40 cursor-pointer shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
