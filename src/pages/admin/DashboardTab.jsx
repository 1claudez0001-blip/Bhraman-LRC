import React from 'react';
import { useApp } from '@/context/AppContext';
import { ROOMS } from '@/lib/constants';
import { BookOpen, Clock, CheckCircle, ClipboardList, Download, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function DashboardTab() {
  const { books, reservations } = useApp();
  const pending = reservations.filter((r) => r.status === 'pending').length;
  const approved = reservations.filter((r) => r.status === 'approved').length;
  const returned = reservations.filter((r) => r.status === 'returned').length;

  const stats = [
    { label: 'Total Books', value: books.length, icon: BookOpen, color: 'bg-red-50 text-ub-red' },
    { label: 'Pending', value: pending, icon: Clock, color: 'bg-yellow-50 text-ub-yellow' },
    { label: 'Approved', value: approved, icon: CheckCircle, color: 'bg-green-50 text-ub-green' },
    { label: 'Total Reservations', value: reservations.length, icon: ClipboardList, color: 'bg-blue-50 text-blue-600' },
  ];

  const exportCSV = () => {
    const ts = new Date().toLocaleString();
    const lines = [];
    lines.push('Section 1: Book Reservations');
    lines.push(['ID', 'Type', 'Student Name', 'Student ID', 'Book', 'Purpose', 'Date', 'Status', 'Export Timestamp'].join(','));
    reservations.filter((r) => r.type === 'book').forEach((r) => {
      lines.push([r.id, 'book', r.studentName, r.student, r.detail, r.borrowingPurpose, r.date, r.status, ts].map(csvEscape).join(','));
    });
    lines.push('');
    lines.push('Section 2: Room Bookings');
    lines.push(['ID', 'Type', 'Student Name', 'Student ID', 'Room', 'Capacity', 'Date & Time', 'Purpose', 'Date Booked', 'Status', 'Export Timestamp'].join(','));
    reservations.filter((r) => r.type === 'room').forEach((r) => {
      const room = ROOMS.find((rm) => rm.id === r.roomId);
      lines.push([r.id, 'room', r.studentName, r.student, room?.name || r.roomId, room?.capacity || '', r.roomSlot, r.borrowingPurpose, r.date, r.status, ts].map(csvEscape).join(','));
    });
    lines.push('');
    lines.push('Section 3: Summary');
    lines.push(['Total Books', 'Total Reservations', 'Pending', 'Approved', 'Returned', 'Export Date'].join(','));
    lines.push([books.length, reservations.length, pending, approved, returned, ts].join(','));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UB_Library_Reservations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully.');
  };

  const tips = [
    "Monitor requests and approve accordingly.",
    "Click 'Export to Excel' to download all reservation data as a CSV file.",
    "Mark borrowed books as returned to make them available again.",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-ub-gray mt-1">Overview of library activity.</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ub-green text-white text-sm font-semibold hover:bg-emerald-600 transition cursor-pointer">
          <Download size={18} /> Export to Excel
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}><Icon size={22} /></div>
              <p className="text-3xl font-bold text-gray-900 mt-3">{s.value}</p>
              <p className="text-sm text-ub-gray">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Lightbulb size={18} className="text-ub-yellow" /> Activity Tips
        </h2>
        <ul className="space-y-2">
          {tips.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-ub-red mt-0.5">•</span>{t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}