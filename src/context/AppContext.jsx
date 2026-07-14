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

  // ─── Fetch books ─────────────────────────────────────────────────────────
  const fetchBooks = useCallback(async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title');
    if (!error) setBooks(data || []);
  }, []);

  // ─── Fetch book reservations ──────────────────────────────────────────────
  const fetchReservations = useCallback(async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, books(title, author), users(name, student_id)')
      .order('created_at', { ascending: false });
    if (!error) {
      const withType = (data || []).map(r => ({ ...r, type: 'book' }));
      setReservations(prev => {
        const roomOnly = prev.filter(r => r.type === 'room');
        return [...withType, ...roomOnly];
      });
    }
  }, []);

  // ─── Fetch room bookings ──────────────────────────────────────────────────
  const fetchRoomBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from('room_bookings')
      .select('*, rooms(name, capacity), users(name, student_id)')
      .order('created_at', { ascending: false });
    if (!error) {
      const withType = (data || []).map(r => ({ ...r, type: 'room' }));
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

  // ─── Detect role from email pattern ──────────────────────────────────────
  const detectRole = (email) => {
    const localPart = email.split('@')[0];
    return /^\d/.test(localPart) ? 'student' : 'admin';
  };

  // ─── REGISTER ────────────────────────────────────────────────────────────
  const register = useCallback(async (email, password, name, studentId) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, student_id: studentId },
      },
    });

    if (authError) return { success: false, error: authError.message };

    const role = detectRole(email);
    const { error: dbError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        name,
        student_id: studentId,
        email,
        password: '',
        role,
      }]);

    if (dbError) return { success: false, error: dbError.message };
    return { success: true };
  }, []);

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes('Email not confirmed')) {
        return { success: false, error: 'Please verify your email first. Check your UB Mail inbox.' };
      }
      return { success: false, error: 'Invalid email or password.' };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Account not found. Please register first.' };
    }

    const newSession = {
      userType: userData.role,
      userName: userData.name,
      userId: userData.student_id,
      userDbId: userData.id,
    };

    sessionStorage.setItem('ublib_session', JSON.stringify(newSession));
    setSession(newSession);
    return { success: true };
  }, []);

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('ublib_session');
    setSession({ userType: null, userName: null, userId: null, userDbId: null });
  }, []);

  // ─── BOOKS CRUD ───────────────────────────────────────────────────────────
  const addBook = useCallback(async (book) => {
    const { data, error } = await supabase
      .from('books')
      .insert([{ ...book, total_copies: 1, available_copies: 1 }])
      .select()
      .single();
    if (!error) await fetchBooks();
    return { data, error };
  }, [fetchBooks]);

  const updateBook = useCallback(async (id, updates) => {
    const { error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id);
    if (!error) await fetchBooks();
    return { error };
  }, [fetchBooks]);

  const deleteBook = useCallback(async (id) => {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);
    if (!error) await fetchBooks();
    return { error };
  }, [fetchBooks]);

  // ─── BOOK RESERVATIONS ────────────────────────────────────────────────────
  const addReservation = useCallback(async (reservation) => {
    const { data, error } = await supabase
      .from('reservations')
      .insert([{
        user_id: session.userDbId,
        book_id: reservation.bookId,
        status: 'pending',
        purpose: reservation.borrowingPurpose,
        photo_url: reservation.studentPhoto,
        date: new Date().toISOString().slice(0, 10),
      }])
      .select()
      .single();
    if (!error) await fetchReservations();
    return { data, error };
  }, [session.userDbId, fetchReservations]);

  const updateReservationStatus = useCallback(async (id, status) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);

    if (!error && status === 'approved') {
      const res = reservations.find(r => r.id === id && r.type === 'book');
      if (res?.book_id) {
        await supabase.rpc('decrement_available_copies', { book_id: res.book_id });
      }
    }
    if (!error && status === 'returned') {
      const res = reservations.find(r => r.id === id && r.type === 'book');
      if (res?.book_id) {
        await supabase.rpc('increment_available_copies', { book_id: res.book_id });
      }
    }

    await fetchReservations();
    return { error };
  }, [reservations, fetchReservations]);

  const cancelReservation = useCallback(async (id) => {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);
    if (!error) await fetchReservations();
    return { error };
  }, [fetchReservations]);

  // ─── ROOM BOOKINGS ────────────────────────────────────────────────────────
  const addRoomBooking = useCallback(async (booking) => {
    const { data, error } = await supabase
      .from('room_bookings')
      .insert([{
        user_id: session.userDbId,
        room_id: booking.roomId,
        date: booking.date,
        time_slot: booking.timeSlot,
        status: 'pending',
        purpose: booking.purpose,
        photo_url: booking.photo,
      }])
      .select()
      .single();
    if (!error) await fetchRoomBookings();
    return { data, error };
  }, [session.userDbId, fetchRoomBookings]);

  const updateRoomBookingStatus = useCallback(async (id, status) => {
    const { error } = await supabase
      .from('room_bookings')
      .update({ status })
      .eq('id', id);
    if (!error) await fetchRoomBookings();
    return { error };
  }, [fetchRoomBookings]);

  const cancelRoomBooking = useCallback(async (id) => {
    const { error } = await supabase
      .from('room_bookings')
      .delete()
      .eq('id', id);
    if (!error) await fetchRoomBookings();
    return { error };
  }, [fetchRoomBookings]);

  const value = {
    session, login, logout, register, loading,
    books, addBook, updateBook, deleteBook, fetchBooks,
    reservations, addReservation, updateReservationStatus, cancelReservation,
    addRoomBooking, updateRoomBookingStatus, cancelRoomBooking,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
