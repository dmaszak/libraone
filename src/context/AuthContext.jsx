// Auth Context untuk mengelola autentikasi

import { createContext, useContext, useState, useEffect } from 'react';
import { users as initialUsers } from '../data/users';
import { books as initialBooks } from '../data/books';
import { loans as initialLoans } from '../data/loans';
import { XP_PER_RETURN, MAX_EXTENSIONS, EXTENSION_DAYS } from '../utils/constants';
import { generateId, calculateDueDate, isOverdue } from '../utils/helpers';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('libraone_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem('libraone_books');
    return saved ? JSON.parse(saved) : initialBooks;
  });
  const [loans, setLoans] = useState(() => {
    const saved = localStorage.getItem('libraone_loans');
    return saved ? JSON.parse(saved) : initialLoans;
  });
  const [loading, setLoading] = useState(true);

  // Load user dari localStorage saat pertama kali
  useEffect(() => {
    const savedUser = localStorage.getItem('libraone_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Simpan data ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem('libraone_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('libraone_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('libraone_loans', JSON.stringify(loans));
  }, [loans]);

  // Login
  const login = (email, password) => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('libraone_user', JSON.stringify(foundUser));
      return { success: true, user: foundUser };
    }
    return { success: false, message: 'Email atau password salah' };
  };

  // Register
  const register = (name, email, password) => {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return { success: false, message: 'Email sudah terdaftar' };
    }

    const newUser = {
      id: users.length + 1,
      name,
      email,
      password,
      role: 'user',
      xp: 0,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, newUser]);
    return { success: true, message: 'Registrasi berhasil' };
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('libraone_user');
  };

  // Update user profile
  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('libraone_user', JSON.stringify(updatedUser));
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  // BOOK OPERATIONS
  const addBook = (bookData) => {
    const newBook = {
      ...bookData,
      id: books.length + 1,
      borrowed: 0
    };
    setBooks([...books, newBook]);
    return { success: true, book: newBook };
  };

  const updateBook = (bookId, updatedData) => {
    setBooks(books.map(b => b.id === bookId ? { ...b, ...updatedData } : b));
    return { success: true };
  };

  const deleteBook = (bookId) => {
    setBooks(books.filter(b => b.id !== bookId));
    return { success: true };
  };

  // LOAN OPERATIONS
  const borrowBook = (bookId) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.stock <= 0) {
      return { success: false, message: 'Buku tidak tersedia' };
    }

    // Cek apakah user sudah meminjam buku ini dan belum dikembalikan
    const existingLoan = loans.find(l => 
      l.userId === user.id && 
      l.bookId === bookId && 
      l.status === 'active'
    );
    if (existingLoan) {
      return { success: false, message: 'Anda sudah meminjam buku ini' };
    }

    const today = new Date().toISOString().split('T')[0];
    const newLoan = {
      id: generateId(),
      oderId: user.id,
      bookId,
      borrowDate: today,
      dueDate: calculateDueDate(today),
      returnDate: null,
      extensionCount: 0,
      status: 'active'
    };

    setLoans([...loans, newLoan]);
    setBooks(books.map(b => 
      b.id === bookId ? { ...b, stock: b.stock - 1, borrowed: b.borrowed + 1 } : b
    ));

    return { success: true, loan: newLoan };
  };

  const extendLoan = (loanId) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) {
      return { success: false, message: 'Peminjaman tidak ditemukan' };
    }
    if (loan.extensionCount >= MAX_EXTENSIONS) {
      return { success: false, message: 'Sudah mencapai batas perpanjangan' };
    }
    if (isOverdue(loan.dueDate)) {
      return { success: false, message: 'Tidak bisa perpanjang, peminjaman sudah terlambat' };
    }

    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + EXTENSION_DAYS);

    setLoans(loans.map(l => 
      l.id === loanId ? {
        ...l,
        dueDate: newDueDate.toISOString().split('T')[0],
        extensionCount: l.extensionCount + 1
      } : l
    ));

    return { success: true };
  };

  const returnBook = (loanId) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) {
      return { success: false, message: 'Peminjaman tidak ditemukan' };
    }

    const today = new Date().toISOString().split('T')[0];

    // Update loan status
    setLoans(loans.map(l => 
      l.id === loanId ? {
        ...l,
        returnDate: today,
        status: 'returned'
      } : l
    ));

    // Update book stock
    setBooks(books.map(b => 
      b.id === loan.bookId ? { ...b, stock: b.stock + 1 } : b
    ));

    // Add XP to user
    const updatedUser = { ...user, xp: user.xp + XP_PER_RETURN };
    setUser(updatedUser);
    localStorage.setItem('libraone_user', JSON.stringify(updatedUser));
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));

    return { success: true, xpEarned: XP_PER_RETURN };
  };

  // Get user's loans
  const getUserLoans = (userId = user?.id) => {
    return loans.filter(l => l.userId === userId || l.oderId === userId);
  };

  // Get active loans
  const getActiveLoans = (userId = user?.id) => {
    return loans.filter(l => 
      (l.userId === userId || l.oderId === userId) && 
      (l.status === 'active' || l.status === 'overdue')
    );
  };

  // Get loan history
  const getLoanHistory = (userId = user?.id) => {
    return loans.filter(l => 
      (l.userId === userId || l.oderId === userId) && 
      l.status === 'returned'
    );
  };

  // Get overdue loans (denda)
  const getOverdueLoans = (userId = user?.id) => {
    return loans.filter(l => 
      (l.userId === userId || l.oderId === userId) && 
      l.status !== 'returned' &&
      isOverdue(l.dueDate)
    );
  };

  // Get popular books
  const getPopularBooks = (limit = 5) => {
    return [...books].sort((a, b) => b.borrowed - a.borrowed).slice(0, limit);
  };

  // Get leaderboard
  const getLeaderboard = () => {
    return [...users]
      .filter(u => u.role === 'user')
      .sort((a, b) => b.xp - a.xp);
  };

  // Admin: Get all loans
  const getAllLoans = () => loans;

  // Admin: Get all returns
  const getAllReturns = () => loans.filter(l => l.status === 'returned');

  // Admin: Get all fines
  const getAllFines = () => {
    return loans.filter(l => 
      l.status !== 'returned' && isOverdue(l.dueDate)
    );
  };

  const value = {
    user,
    users,
    books,
    loans,
    loading,
    login,
    register,
    logout,
    updateProfile,
    addBook,
    updateBook,
    deleteBook,
    borrowBook,
    extendLoan,
    returnBook,
    getUserLoans,
    getActiveLoans,
    getLoanHistory,
    getOverdueLoans,
    getPopularBooks,
    getLeaderboard,
    getAllLoans,
    getAllReturns,
    getAllFines
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
