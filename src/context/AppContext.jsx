import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = sessionStorage.getItem('ublib_session');
      return raw ? JSON.parse(raw) : { userType: null, userName: null, userId: null, userDbId: null };
    } catch {
      return { userType: null, userName: null, userId: null, userDbId: null };
    }
  });

  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    const { data } = await supabase.from('books').select('*').order('title');
    if (data) setBooks(data);
  }, []);

  const fetchReservations = useCallback(async () => {
    const { data } = await supabase
      .from('reservations')
      .select('*, books(title, author), users(name, student_id)')
      .order('created_at', { ascending: false });
    if (data) {
      const withType = data.map(r => ({ ...r, type: 'book' }));
      setReservations(prev => {
        const roomOnly = prev.filter(r => r.type === 'room');
        return [...withType, ...roomOnly];
      });
    }
  }, []);

  const fetchRoomBookings = useCallback(async () => {
    const { data } = await supabase
      .from('room_bookings')
      .select('*, rooms(name, capacity), users(name, student_id)')
      .order('created_at', { ascending: false });
    if (data) {
      const withType = data.map(r => ({ ...r, type: 'room' }));
      setReservations(prev => {
        const bookOnly = prev.filter(r => r.type === 'book');
        return [...bookOnly, ...withType];
      });
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchBooks();
      await fetchReservations();
      await fetchRoomBookings();
      setLoading(false);
    };
    load();
  }, [fetchBooks, fetchReservations, fetchRoomBookings]);

  // ── Send notification helper ─────────────────────────────────────────────
  const sendNotification = useCallback(async (userId, { title, message, type }) => {
    await supabase.from('notifications').insert([{ user_id: userId, title, message, type }]);
  }, []);

  // ── Notify all admins ─────────────────────────────────────────────────────
  const notifyAdmins = useCallback(async ({ title, message, type }) => {
    const { data: admins } = await supabase
      .from('users').select('id').eq('role', 'admin');
    if (!admins || admins.length === 0) return;
    await supabase.from('notifications').insert(
      admins.map(a => ({ user_id: a.id, title, message, type }))
    );
  }, []);

  // ── Role detection ───────────────────────────────────────────────────────
  // Only emails starting with numbers are students
  // Faculty and admins both start with letters but declared differently
  const detectRole = (email, declaredRole) => {
    const localPart = email.split('@')[0];
    const startsWithNumber = /^\d/.test(localPart);
    if (startsWithNumber) return 'student';
    if (declaredRole === 'faculty') return 'student'; // faculty gets student dashboard
    return 'admin'; // only explicit admin emails get admin role
  };

  // ── REGISTER ─────────────────────────────────────────────────────────────
  const register = useCallback(async (email, password, name, studentId, declaredRole = 'student') => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, student_id: studentId } },
    });
    if (authError) return { success: false, error: authError.message };

    const role = detectRole(email, declaredRole);
    const { error: dbError } = await supabase.from('users').insert([{
      id: authData.user.id,
      name,
      student_id: studentId,
      email,
      password: '',
      role,
      declared_role: declaredRole,
      faculty_verified: declaredRole === 'student',
    }]);
    if (dbError) return { success: false, error: dbError.message };

    // Notify admins if faculty registered
    if (declaredRole === 'faculty') {
      await supabase.from('notifications').insert(
        await supabase.from('users').select('id').eq('role', 'admin')
          .then(({ data }) => (data || []).map(a => ({
            user_id: a.id,
            title: 'New Faculty Registration 👨‍🏫',
            message: `${name} registered as faculty. Please review their account.`,
            type: 'pending',
          })))
      );
    }

    return { success: true };
  }, []);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      if (authError.message.includes('Email not confirmed'))
        return { success: false, error: 'Please verify your email first. Check your UB Mail inbox.' };
      return { success: false, error: 'Invalid email or password.' };
    }

    const { data: userData, error: userError } = await supabase
      .from('users').select('*').eq('id', authData.user.id).single();
    if (userError || !userData)
      return { success: false, error: 'Account not found. Please register first.' };

    const newSession = {
      userType: userData.role,
      userName: userData.name,
      userId: userData.student_id,
      userDbId: userData.id,
      declaredRole: userData.declared_role || userData.role,
    };
    sessionStorage.setItem('ublib_session', JSON.stringify(newSession));
    setSession(newSession);
    return { success: true };
  }, []);

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('ublib_session');
    setSession({ userType: null, userName: null, userId: null, userDbId: null });
  }, []);

  // ── BOOKS CRUD ────────────────────────────────────────────────────────────
  const addBook = useCallback(async (book) => {
    const { data, error } = await supabase.from('books')
      .insert([{ ...book }]).select().single();
    if (!error) await fetchBooks();
    return { data, error };
  }, [fetchBooks]);

  const updateBook = useCallback(async (id, updates) => {
    const { error } = await supabase.from('books').update(updates).eq('id', id);
    if (!error) await fetchBooks();
    return { error };
  }, [fetchBooks]);

  const deleteBook = useCallback(async (id) => {
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (!error) await fetchBooks();
    return { error };
  }, [fetchBooks]);

  // ── BOOK RESERVATIONS ─────────────────────────────────────────────────────
  const addReservation = useCallback(async (reservation) => {
    const { data, error } = await supabase.from('reservations').insert([{
      user_id: session.userDbId,
      book_id: reservation.bookId,
      status: 'pending',
      purpose: reservation.borrowingPurpose,
      photo_url: reservation.studentPhoto,
      date: new Date().toISOString().slice(0, 10),
    }]).select().single();
    if (!error) {
      await fetchReservations();
      await notifyAdmins({
        title: 'New Book Request 📚',
        message: `${session.userName} requested "${reservation.bookTitle || 'a book'}". Please review it.`,
        type: 'pending',
      });
    }
    return { data, error };
  }, [session.userDbId, session.userName, fetchReservations, notifyAdmins]);

  const updateReservationStatus = useCallback(async (id, status) => {
    const { error } = await supabase.from('reservations').update({ status }).eq('id', id);

    if (!error) {
      const res = reservations.find(r => r.id === id && r.type === 'book');

      // Update book copies
      if (status === 'approved' && res?.book_id) {
        await supabase.rpc('decrement_available_copies', { book_id: res.book_id });
      }
      if (status === 'returned' && res?.book_id) {
        await supabase.rpc('increment_available_copies', { book_id: res.book_id });
      }

      // Send notification to student
      if (res?.user_id) {
        const bookTitle = res.books?.title || 'your book';
        if (status === 'approved') {
          await sendNotification(res.user_id, {
            title: 'Book Request Approved! ✅',
            message: `Your request for "${bookTitle}" has been approved. Please pick it up at the library.`,
            type: 'approved',
          });
        } else if (status === 'rejected') {
          await sendNotification(res.user_id, {
            title: 'Book Request Rejected',
            message: `Your request for "${bookTitle}" was not approved. Please visit the library for more info.`,
            type: 'rejected',
          });
        } else if (status === 'returned') {
          await sendNotification(res.user_id, {
            title: 'Book Returned 📚',
            message: `"${bookTitle}" has been marked as returned. Thank you!`,
            type: 'info',
          });
        }
      }

      await fetchReservations();
    }
    return { error };
  }, [reservations, fetchReservations, sendNotification]);

  const cancelReservation = useCallback(async (id) => {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (!error) await fetchReservations();
    return { error };
  }, [fetchReservations]);

  // ── ROOM BOOKINGS ─────────────────────────────────────────────────────────
  const addRoomBooking = useCallback(async (booking) => {
    const { data, error } = await supabase.from('room_bookings').insert([{
      user_id: session.userDbId,
      room_id: booking.roomId,
      date: booking.date,
      time_slot: booking.timeSlot,
      status: 'pending',
      purpose: booking.purpose,
      photo_url: booking.photo,
    }]).select().single();
    if (!error) {
      await fetchRoomBookings();
      await notifyAdmins({
        title: 'New Room Booking 💬',
        message: `${session.userName} booked ${booking.roomName || 'a room'} on ${booking.date} at ${booking.timeSlot}.`,
        type: 'pending',
      });
    }
    return { data, error };
  }, [session.userDbId, session.userName, fetchRoomBookings, notifyAdmins]);

  const updateRoomBookingStatus = useCallback(async (id, status) => {
    const { error } = await supabase.from('room_bookings').update({ status }).eq('id', id);

    if (!error) {
      const res = reservations.find(r => r.id === id && r.type === 'room');

      // Send notification to student
      if (res?.user_id) {
        const roomName = res.rooms?.name || 'the room';
        const slot = `${res.date} at ${res.time_slot}`;
        if (status === 'approved') {
          await sendNotification(res.user_id, {
            title: 'Room Booking Approved! ✅',
            message: `Your booking for ${roomName} on ${slot} has been approved.`,
            type: 'approved',
          });
        } else if (status === 'rejected') {
          await sendNotification(res.user_id, {
            title: 'Room Booking Rejected',
            message: `Your booking for ${roomName} on ${slot} was not approved.`,
            type: 'rejected',
          });
        }
      }

      await fetchRoomBookings();
    }
    return { error };
  }, [reservations, fetchRoomBookings, sendNotification]);

  const cancelRoomBooking = useCallback(async (id) => {
    const { error } = await supabase.from('room_bookings').delete().eq('id', id);
    if (!error) await fetchRoomBookings();
    return { error };
  }, [fetchRoomBookings]);

  const value = {
    session, login, logout, register, loading,
    books, addBook, updateBook, deleteBook, fetchBooks,
    reservations, addReservation, updateReservationStatus, cancelReservation,
    addRoomBooking, updateRoomBookingStatus, cancelRoomBooking,
    sendNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
