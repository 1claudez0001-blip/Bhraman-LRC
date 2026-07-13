import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { INITIAL_BOOKS, DEMO_CREDENTIALS } from '@/lib/constants';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [books, setBooks] = useLocalStorage('ublib_books', INITIAL_BOOKS);
  const [reservations, setReservations] = useLocalStorage('ublib_reservations', []);
  const [nextReservationId, setNextReservationId] = useLocalStorage('ublib_reservationId', 1);
  const [nextBookId, setNextBookId] = useLocalStorage('ublib_nextBookId', 9);

  const [session, setSession] = useState(() => {
    try {
      const raw = sessionStorage.getItem('ublib_session');
      return raw ? JSON.parse(raw) : { userType: null, userName: null, userId: null };
    } catch {
      return { userType: null, userName: null, userId: null };
    }
  });

  const login = useCallback((userType, username, password) => {
    const creds = DEMO_CREDENTIALS[userType];
    if (creds && creds.username === username && creds.password === password) {
      const newSession = { userType, userName: creds.name, userId: creds.userId };
      sessionStorage.setItem('ublib_session', JSON.stringify(newSession));
      setSession(newSession);
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('ublib_session');
    setSession({ userType: null, userName: null, userId: null });
  }, []);

  const addBook = useCallback((book) => {
    const newBook = { ...book, id: nextBookId };
    setBooks((prev) => [...prev, newBook]);
    setNextBookId((n) => n + 1);
    return newBook;
  }, [nextBookId, setBooks, setNextBookId]);

  const updateBook = useCallback((id, updates) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }, [setBooks]);

  const deleteBook = useCallback((id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, [setBooks]);

  const addReservation = useCallback((reservation) => {
    const newRes = { ...reservation, id: nextReservationId };
    setReservations((prev) => [newRes, ...prev]);
    setNextReservationId((n) => n + 1);
    return newRes;
  }, [nextReservationId, setReservations, setNextReservationId]);

  const updateReservationStatus = useCallback((id, status) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, [setReservations]);

  const cancelReservation = useCallback((id) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  }, [setReservations]);

  const value = {
    session, login, logout,
    books, addBook, updateBook, deleteBook,
    reservations, addReservation, updateReservationStatus, cancelReservation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}