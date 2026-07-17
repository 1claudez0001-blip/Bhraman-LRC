import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import SoftcopyChat from '@/components/SoftcopyChat';
import { FileText, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/format';

function StatusBadge({ status }) {
  if (status === 'fulfilled') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-ub-green">
      <CheckCircle size={10} /> Fulfilled
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
      <Clock size={10} /> Open
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-4"><div className="h-3 w-40 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-3 w-28 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-gray-100" /></td>
      <td className="px-5 py-4"><div className="h-3 w-20 bg-gray-100 rounded ml-auto" /></td>
    </tr>
  );
}

export default function SoftcopyTab() {
  const { session } = useApp();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const isStaff = session.userType === 'admin' || session.userType === 'sa';

  const fetchRequests = async () => {
    setLoading(true);

    if (isStaff) {
      const { data, error } = await supabase
        .from('softcopy_requests')
        .select('*, books(title, author, cover_url), users(name, student_id)')
        .order('created_at', { ascending: false });
      if (!error && data) setRequests(data);
    } else {
      const { data, error } = await supabase
        .from('softcopy_requests')
        .select('*, books(title, author, cover_url), users(name, student_id)')
        .eq('user_id', session.userDbId)
        .order('created_at', { ascending: false });
      if (!error && data) setRequests(data);
    }

    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  // Realtime for new requests
  useEffect(() => {
    const channel = supabase
      .channel('softcopy_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'softcopy_requests' }, fetchRequests)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const openRequests = requests.filter(r => r.status === 'open').length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Softcopy Requests</h1>
        <p className="text-ub-gray mt-1">
          {isStaff ? 'Manage softcopy requests from students and faculty.' : 'Request digital copies of books.'}
        </p>
      </div>

      {isStaff && openRequests > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <MessageSquare size={18} className="text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{openRequests} open request{openRequests > 1 ? 's' : ''}</span> waiting for your response.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <table className="w-full text-sm"><tbody><SkeletonRow /><SkeletonRow /><SkeletonRow /></tbody></table>
        ) : requests.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FileText size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-ub-gray">No softcopy requests yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-ub-gray text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Book</th>
                  {isStaff && <th className="text-left px-5 py-3 font-semibold">Student</th>}
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {r.books?.cover_url ? (
                          <img src={r.books.cover_url} alt={r.books.title} className="w-8 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <FileText size={14} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{r.books?.title}</p>
                          <p className="text-xs text-ub-gray">{r.books?.author}</p>
                        </div>
                      </div>
                    </td>
                    {isStaff && (
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{r.users?.name}</p>
                        <p className="text-xs text-ub-gray">{r.users?.student_id}</p>
                      </td>
                    )}
                    <td className="px-5 py-3 text-ub-gray">{formatDate(r.created_at)}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setActiveChat(r)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-ub-red px-2.5 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                      >
                        <MessageSquare size={12} /> Open Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeChat && (
        <SoftcopyChat
          request={activeChat}
          onClose={() => setActiveChat(null)}
          onFulfill={fetchRequests}
        />
      )}
    </div>
  );
}
