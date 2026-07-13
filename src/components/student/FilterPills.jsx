import React from 'react';
import { COLLEGE_LABELS, COLLEGE_KEYS } from '@/lib/constants';

export default function FilterPills({ filters, setFilters }) {
  const toggle = (key) => {
    if (key === 'all') { setFilters([]); return; }
    setFilters((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const keys = ['all', ...COLLEGE_KEYS];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
      {keys.map((k) => {
        const active = k === 'all' ? filters.length === 0 : filters.includes(k);
        return (
          <button
            key={k}
            onClick={() => toggle(k)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${active ? 'bg-ub-red text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {k === 'all' && '✓ '}{COLLEGE_LABELS[k]}
          </button>
        );
      })}
    </div>
  );
}