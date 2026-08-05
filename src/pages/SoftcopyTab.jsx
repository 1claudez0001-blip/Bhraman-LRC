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

export default function SoftcopyTab({ saMode }) {
  const { session } = useApp();
  const [requests, setRequests] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  const isStaff = (session.userType === 'admin') ||
    (session.userType === 'sa' && saMode === 'sa');

  const fetchRequests = async () => {
    setLoading(true);

    let query = supabase
      .from('softcopy_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isStaff) {
      query = query.eq('user_id', session.userDbId);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const bookIds = [...new Set(data.map(r => r.book_id))];
      const userIds = [...new Set(data.map(r => r.user_id))];

      const [{ data: books }, { data: users }] = await Promise.all([
        supabase.from('books').select('id, title, author, cover_url').in('id', bookIds),
        supabase.from('users').select('id, name, student_id').in('id', userIds),
      ]);

      const enriched = data.map(r => ({
        ...r,
        books: books?.find(b => b.id === r.book_id) || null,
        users: users?.find(u => u.id === r.user_id) || null,
      }));

      setRequests(enriched);

      // Fetch unread counts for all requests
      await fetchUnreadCounts(data.map(r => r.id));
    } else if (!error) {
      setRequests([]);
    }

    setLoading(false);
  };

  const fetchUnreadCounts = async (requestIds) => {
    if (!requestIds.length) return;

    // For staff: count messages where read_by_staff = false and sender is NOT staff
    // For student: count messages where read_by_student = false and sender is NOT this student
    const readColumn = isStaff ? 'read_by_staff' : 'read_by_student';

    const { data } = await supabase
      .from('softcopy_messages')
      .select('request_id')
      .in('request_id', requestIds)
      .eq(readColumn, false)
      .neq('sender_id', session.userDbId);

    if (data) {
      const counts = {};
      data.forEach(m => {
        counts[m.request_id] = (counts[m.request_id] || 0) + 1;
      });
      setUnreadCounts(counts);
    }
  };

  useEffect(() => { fetchRequests(); }, [isStaff]);

  useEffect(() => {
    const channel = supabase
      .channel('softcopy_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'softcopy_requests' }, fetchRequests)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'softcopy_messages' }, () => {
        if (requests.length > 0) fetchUnreadCounts(requests.map(r => r.id));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [requests]);

  const openRequests = requests.filter(r => r.status === 'open').length;

  const handleOpenChat = (r) => {
    setActiveChat(r);
    // Optimistically clear unread count for this request
    setUnreadCounts(prev => ({ ...prev, [r.id]: 0 }));
  };

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
                {requests.map(r => {
                  const unread = unreadCounts[r.id] || 0;
                  return (
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
                          onClick={() => handleOpenChat(r)}
                          className={`relative inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer transition
                            ${r.status === 'open'
                              ? 'text-ub-red hover:bg-red-50'
                              : 'text-ub-gray hover:bg-gray-100'
                            }`}
                        >
                          <MessageSquare size={12} />
                          {r.status === 'open' ? 'Open Chat' : 'View Chat'}
                          {unread > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-ub-red text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow">
                              {unread > 9 ? '9+' : unread}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeChat && (
        <SoftcopyChat
          request={activeChat}
          onClose={() => { setActiveChat(null); fetchRequests(); }}
          onFulfill={fetchRequests}
          saMode={saMode}
        />
      )}
    </div>
  );
}
