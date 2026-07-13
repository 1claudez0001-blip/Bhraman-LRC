import React, { useState } from 'react';
import Modal from '@/components/Modal';
import { useApp } from '@/context/AppContext';
import { ROOMS, TIME_SLOTS } from '@/lib/constants';
import { todayStr, formatDateLong } from '@/lib/format';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarModal({ open, onClose, onNext }) {
  const { reservations } = useApp();
  const [dateValue, setDateValue] = useState(todayStr());
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const today = todayStr();

  const shiftDate = (days) => {
    const d = new Date(dateValue + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const next = d.toISOString().slice(0, 10);
    if (next < today) return;
    setDateValue(next);
    setSelectedSlot(null);
  };

  const isReserved = (slotValue) => reservations.some(
    (r) => r.type === 'room' && r.roomId === roomId && r.roomSlot === `${dateValue} ${slotValue}` && (r.status === 'pending' || r.status === 'approved')
  );

  const handleNext = () => {
    if (!selectedSlot) return;
    onNext({ roomId, dateValue, slot: selectedSlot });
  };

  return (
    <Modal open={open} onClose={onClose} title="Reserve a Room" maxWidth="max-w-2xl">
      <div className="space-y-5">
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <button onClick={() => shiftDate(-1)} disabled={dateValue <= today} className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <span className="font-heading font-semibold text-gray-900 text-sm sm:text-base text-center">{formatDateLong(dateValue)}</span>
          <button onClick={() => shiftDate(1)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 cursor-pointer">
            <ChevronRight size={18} />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
          <select
            value={roomId}
            onChange={(e) => { setRoomId(e.target.value); setSelectedSlot(null); }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-ub-red focus:ring-2 focus:ring-ub-red/20 outline-none cursor-pointer"
          >
            {ROOMS.map((r) => <option key={r.id} value={r.id}>{r.name} (cap {r.capacity})</option>)}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Available time slots</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIME_SLOTS.map((s) => {
              const reserved = isReserved(s.value);
              const selected = selectedSlot === s.value;
              return (
                <button
                  key={s.value}
                  disabled={reserved}
                  onClick={() => setSelectedSlot(s.value)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition ${selected ? 'bg-ub-red text-white border-ub-red' : reserved ? 'bg-gray-100 text-ub-gray border-gray-200 cursor-not-allowed line-through' : 'bg-white text-gray-700 border-gray-200 hover:border-ub-red hover:text-ub-red cursor-pointer'}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-ub-gray">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-gray-300" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-300" /> Reserved</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-ub-red" /> Selected</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer">Cancel</button>
          <button
            onClick={handleNext}
            disabled={!selectedSlot}
            className={`flex-1 py-2.5 rounded-xl font-semibold transition ${selectedSlot ? 'bg-ub-red text-white hover:bg-ub-darkRed cursor-pointer' : 'bg-gray-100 text-ub-gray cursor-not-allowed'}`}
          >
            Next →
          </button>
        </div>
      </div>
    </Modal>
  );
}