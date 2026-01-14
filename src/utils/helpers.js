// Helper functions untuk LibraOne

import { FINE_PER_DAY, LOAN_DURATION_DAYS, EXTENSION_DAYS } from './constants';

// Format tanggal ke format Indonesia
export const formatDate = (dateString) => {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Format mata uang Rupiah
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Hitung selisih hari antara dua tanggal
export const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  return Math.round((secondDate - firstDate) / oneDay);
};

// Hitung tanggal jatuh tempo
export const calculateDueDate = (borrowDate, extensions = 0) => {
  const date = new Date(borrowDate);
  const totalDays = LOAN_DURATION_DAYS + (extensions * EXTENSION_DAYS);
  date.setDate(date.getDate() + totalDays);
  return date.toISOString().split('T')[0];
};

// Hitung denda keterlambatan
export const calculateFine = (dueDate, returnDate = null) => {
  const today = returnDate ? new Date(returnDate) : new Date();
  const due = new Date(dueDate);
  
  if (today <= due) return 0;
  
  const daysLate = daysBetween(dueDate, today.toISOString().split('T')[0]);
  return daysLate * FINE_PER_DAY;
};

// Cek apakah peminjaman terlambat
export const isOverdue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  return today > due;
};

// Generate ID unik sederhana
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Hitung ranking user berdasarkan XP
export const calculateRank = (users, userId) => {
  const sorted = [...users].sort((a, b) => b.xp - a.xp);
  const index = sorted.findIndex(u => u.id === userId);
  return index + 1;
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
