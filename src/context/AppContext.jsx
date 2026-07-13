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

  // ─── Fetch books from Supabase ───────────────────────────────────────────
  const fetchBooks = useCallback(async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title');
    if (!error) setBooks(data || []);
  }, []);

  // ─── Fetch reservations from Supabase ────────────────────────────────────
  const fetchReservations = useCallback(async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, books(title, author), users(name, student_id)')
      .order('created_at', { ascending: false });
    if (!error) setReservations(data || []);
  }, []);

  const fetchRoomBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from('room_bookings')
      .select('*, rooms(name, capacity), users(name, student_id)')
      .order('created_at', { ascending: false });
    if (!error) setReservations(prev => {
      // Merge room bookings into reservations array with a type flag
      const bookOnly = prev.filter(r => r.type !== 'room');
      const withType = (data || []).map(r => ({ ...r, type: 'room' }));
      return [...bookOnly, ...withType];
    });
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

  // ─── AUTH ────────────────────────────────────────────────────────────────
  const login = useCallback(async (userType, studentId, password) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('student_id', studentId)
      .eq('password', password)
      .eq('role', userType)
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid ID or password' };
    }

    const newSession = {
      userType: data.role,
      userName: data.name,
      userId: data.student_id,
      userDbId: data.id,
    };
    sessionStorage.setItem('ublib_session', JSON.stringify(newSession));
    setSession(newSession);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('ublib_session');
    setSession({ userType: null, userName: null, userId: null, userDbId: null });
  }, []);

  // ─── BOOKS CRUD ──────────────────────────────────────────────────────────
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

  // ─── BOOK RESERVATIONS ───────────────────────────────────────────────────
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

    if (!error) {
      await fetchReservations();
    }
    return { data, error };
  }, [session.userDbId, fetchReservations]);

  const updateReservationStatus = useCallback(async (id, status) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);

    // If approved, decrement available_copies
    if (!error && status === 'approved') {
      const res = reservations.find(r => r.id === id && r.type !== 'room');
      if (res?.book_id) {
        await supabase.rpc('decrement_available_copies', { book_id: res.book_id });
      }
    }
    // If returned, increment available_copies
    if (!error && status === 'returned') {
      const res = reservations.find(r => r.id === id && r.type !== 'room');
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

  // ─── ROOM BOOKINGS ───────────────────────────────────────────────────────
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
    session, login, logout, loading,
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
