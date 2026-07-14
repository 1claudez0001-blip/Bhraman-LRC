import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const { session } = useApp();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Fetch notifications ──────────────────────────────────────────────────
  const fetchNotifications = async () => {
    if (!session.userDbId) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.userDbId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  };

  // ── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!session.userDbId) return;
    fetchNotifications();

    const channel = supabase
      .channel(`notifications:${session.userDbId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${session.userDbId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [session.userDbId]);

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Mark all as read ─────────────────────────────────────────────────────
  const markAllRead = async () => {
    if (!session.userDbId) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.userDbId)
      .eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // ── Mark single as read ──────────────────────────────────────────────────
  const markRead = async (id) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // ── Icon color by type ───────────────────────────────────────────────────
  const typeStyles = {
    approved: 'bg-green-100 text-green-600',
    rejected: 'bg-red-100 text-red-500',
    pending:  'bg-yellow-100 text-yellow-600',
    info:     'bg-blue-100 text-blue-500',
  };

  const typeEmoji = {
    approved: '✅',
    rejected: '❌',
    pending:  '🔔',
    info:     'ℹ️',
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) markAllRead(); }}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition cursor-pointer"
      >
        <Bell size={19} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-ub-red text-white text-[10px] font-bold flex items-center justify-center animate-scale-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-ub-red" />
              <span className="font-semibold text-sm text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-ub-red text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-ub-red hover:underline cursor-pointer font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition hover:bg-gray-50
                    ${!n.read ? 'bg-ub-red/3' : ''}`}
                >
                  <span className="text-base mt-0.5 shrink-0">{typeEmoji[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-ub-red shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
