// Auth Context untuk mengelola autentikasi dengan Backend API

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, booksAPI, loansAPI, leaderboardAPI, finesAPI, notificationAPI, adminAPI } from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user dari localStorage saat pertama kali
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Verify token masih valid dengan mengambil profile
          const profile = await authAPI.getProfile();
          const userData = {
            ...JSON.parse(savedUser),
            ...profile,
            // Map field dari API ke format frontend
            name: profile.nama,
            xp: profile.xp || profile.poin || 0,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nama)}&background=10B981&color=fff`
          };
          setUser(userData);
        } catch (err) {
          // Token invalid, clear storage
          console.error('Token invalid:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login(email, password);
      
      // Simpan token
      localStorage.setItem('token', response.token);
      
      // Map user data dari API ke format frontend
      const userData = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role === 'anggota' ? 'user' : response.user.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.user.name)}&background=10B981&color=fff`
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Email atau password salah';
      setError(message);
      return { success: false, message };
    }
  };

  // Register
  const register = async (name, email, password) => {
    try {
      setError(null);
      await authAPI.register(name, email, password);
      return { success: true, message: 'Registrasi berhasil' };
    } catch (err) {
      const message = err.response?.data?.message || 'Registrasi gagal';
      setError(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Get user profile from API
  const getProfile = async () => {
    try {
      const profile = await authAPI.getProfile();
      return {
        ...profile,
        name: profile.nama,
        joinedAt: profile.bergabung_sejak,
        status: profile.status,
        xp: profile.xp,
        rank: profile.peringkat,
        currentlyBorrowed: profile.sedang_dipinjam,
        totalLoans: profile.total_peminjaman
      };
    } catch (err) {
      console.error('Get profile error:', err);
      throw err;
    }
  };

  // ==================== BOOKS ====================
  
  const getBooks = async () => {
    try {
      const books = await booksAPI.getAll();
      // Map API response ke format frontend
      return books.map(book => ({
        id: book.id,
        idBuku: book.id_buku,
        title: book.judul,
        author: book.pengarang,
        publisher: book.penerbit,
        year: book.tahun_terbit ? new Date(book.tahun_terbit).getFullYear() : null,
        category: book.kategori,
        cover: book.cover
          ? book.cover.startsWith('http')
            ? book.cover
            : `https://backend-libraone.vercel.app/uploads/${book.cover}`
          : null,
        synopsis: book.buku_deskripsi,
        pages: book.jumlah_halaman,
        borrowed: book.total_dipinjam || 0
      }));
    } catch (err) {
      console.error('Get books error:', err);
      throw err;
    }
  };

  const getBookById = async (id) => {
    try {
      const book = await booksAPI.getById(id);
      return {
        id: book.id,
        idBuku: book.id_buku,
        title: book.judul,
        author: book.pengarang,
        publisher: book.penerbit,
        year: book.tahun_terbit ? new Date(book.tahun_terbit).getFullYear() : null,
        pages: book.jumlah_halaman,
        category: book.kategori,
        cover: book.cover
          ? book.cover.startsWith('http')
            ? book.cover
            : `https://backend-libraone.vercel.app/uploads/${book.cover}`
          : null,
        synopsis: book.buku_deskripsi,
        status: book.status,
        borrowed: book.total_dipinjam || 0
      };
    } catch (err) {
      console.error('Get book by ID error:', err);
      throw err;
    }
  };

  const getPopularBooks = async () => {
    try {
      const books = await booksAPI.getPopular();
      return books.map(book => ({
        id: book.id,
        idBuku: book.id_buku,
        title: book.judul,
        author: book.pengarang,
        cover: book.cover ? `https://backend-libraone.vercel.app/uploads/${book.Cover || book.cover}` : null,
        borrowed: book.total_dipinjam
      }));
    } catch (err) {
      console.error('Get popular books error:', err);
      throw err;
    }
  };

  const addBook = async (bookData, coverFile = null) => {
    try {
      console.log('Adding book:', JSON.stringify(bookData, null, 2));
      if (coverFile) console.log('With cover file:', coverFile.name);
      const response = await booksAPI.create(bookData, coverFile);
      console.log('Add book response:', response);
      return { success: true, message: response.message || 'Buku berhasil ditambahkan' };
    } catch (err) {
      console.error('Add book error:', err.response?.data || err.message);
      console.error('Full error response:', JSON.stringify(err.response?.data, null, 2));
      console.error('Status:', err.response?.status);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Gagal menambah buku';
      return { success: false, message: errorMsg };
    }
  };

  const updateBook = async (id, bookData, coverFile = null) => {
    try {
      const response = await booksAPI.update(id, bookData, coverFile);
      return { success: true, message: response.message || 'Buku berhasil diperbarui' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Gagal update buku' };
    }
  };

  const deleteBook = async (id) => {
    try {
      const response = await booksAPI.delete(id);
      return { success: true, message: response.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Gagal hapus buku' };
    }
  };

  // ==================== LOANS ====================

  const borrowBook = async (bukuId) => {
    try {
      const response = await loansAPI.borrow(bukuId);
      return { 
        success: true, 
        message: response.message,
        xpEarned: response.poin_didapat 
      };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Gagal meminjam buku' };
    }
  };

  const getMyLoans = async () => {
    try {
      const loans = await loansAPI.getMyLoans();
      return loans.map(loan => ({
        id: loan.id,
        title: loan.judul,
        author: loan.pengarang,
        borrowDate: loan.tanggal_dipinjam,
        dueDate: loan.tanggal_jatuh_tempo,
        status: loan.status
      }));
    } catch (err) {
      console.error('Get my loans error:', err);
      throw err;
    }
  };

  const getActiveLoans = async () => {
    try {
      const loans = await loansAPI.getActiveLoans();
      return loans.map(loan => ({
        id: loan.id,
        title: loan.judul,
        author: loan.pengarang,
        borrowDate: loan.tanggal_dipinjam,
        dueDate: loan.tanggal_jatuh_tempo,
        extensionCount: loan.diperpanjang || 0
      }));
    } catch (err) {
      console.error('Get active loans error:', err);
      throw err;
    }
  };

  const getLoanHistory = async () => {
    try {
      const loans = await loansAPI.getHistory();
      return loans.map(loan => ({
        id: loan.id,
        title: loan.judul,
        author: loan.pengarang,
        borrowDate: loan.tanggal_dipinjam,
        dueDate: loan.tanggal_jatuh_tempo,
        extensionCount: loan.diperpanjang || 0
      }));
    } catch (err) {
      console.error('Get loan history error:', err);
      throw err;
    }
  };

  const returnBook = async (loanId) => {
    try {
      const response = await loansAPI.returnBook(loanId);
      return { 
        success: true, 
        message: response.message,
        fine: response.denda 
      };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Gagal mengembalikan buku' };
    }
  };

  const extendLoan = async (loanId) => {
    try {
      const response = await loansAPI.extendLoan(loanId);
      return { success: true, message: response.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Gagal perpanjang peminjaman' };
    }
  };

  // ==================== NOTIFICATIONS ====================

  const getNotifications = async () => {
    try {
      const notifications = await notificationAPI.getMyNotifications();
      return notifications.map(notif => ({
        id: notif.id,
        message: notif.pesan,
        type: notif.tipe,
        read: notif.dibaca === 1,
        createdAt: notif.created_at
      }));
    } catch (err) {
      console.error('Get notifications error:', err);
      throw err;
    }
  };

  const getUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      return response.total;
    } catch (err) {
      console.error('Get unread count error:', err);
      return 0;
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  // ==================== LEADERBOARD ====================

  const getLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.getAll();
      // Backend returns { message, data: [...] }
      const leaderboard = response.data || response || [];
      return Array.isArray(leaderboard) ? leaderboard.map(item => ({
        rank: item.rank,
        name: item.name,
        email: item.email,
        xp: item.poin
      })) : [];
    } catch (err) {
      console.error('Get leaderboard error:', err);
      return [];
    }
  };

  const getMyRanking = async () => {
    try {
      const response = await leaderboardAPI.getMyRanking();
      // Backend may return { message, data } or direct object
      const ranking = response.data || response;
      return {
        name: ranking?.name || '',
        xp: ranking?.poin || 0,
        rank: ranking?.ranking || ranking?.rank || 0
      };
    } catch (err) {
      console.error('Get my ranking error:', err);
      return { name: '', xp: 0, rank: 0 };
    }
  };

  // ==================== FINES ====================

  const getFines = async () => {
    try {
      const fines = await finesAPI.getAll();
      return Array.isArray(fines) ? fines.map(fine => ({
        user: fine.user,
        totalFine: fine.total_denda
      })) : [];
    } catch (err) {
      console.error('Get fines error:', err);
      return [];
    }
  };

  const getMyFines = async () => {
    try {
      const response = await finesAPI.getMyFines();
      // Response bisa berupa array atau object dengan data
      const fines = response.data || response || [];
      const total = Array.isArray(fines) 
        ? fines.reduce((sum, fine) => sum + (fine.jumlah || fine.total_denda || 0), 0)
        : 0;
      return { 
        total, 
        fines: Array.isArray(fines) ? fines : [],
        count: Array.isArray(fines) ? fines.length : 0
      };
    } catch (err) {
      console.error('Get my fines error:', err);
      return { total: 0, fines: [], count: 0 };
    }
  };

  const payFine = async (id) => {
    try {
      const response = await finesAPI.pay(id);
      return { success: true, message: response.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Gagal bayar denda' };
    }
  };

  // ==================== PROFILE FUNCTIONS ====================

  const updateProfile = async (name, email) => {
    try {
      const response = await authAPI.updateProfile(name, email);
      // Update local user data
      const updatedUser = { ...user, name, email };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, message: response.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Gagal update profile' };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(oldPassword, newPassword);
      return { success: true, message: response.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Gagal ubah password' };
    }
  };

  const updatePhoto = async (photo) => {
    try {
      const response = await authAPI.updatePhoto(photo);
      // Update local user data
      const updatedUser = { ...user, avatar: response.poto };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, message: response.message, photo: response.poto };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Gagal update foto' };
    }
  };

  // ==================== ADMIN FUNCTIONS ====================

  const getAdminDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      return response;
    } catch (err) {
      console.error('Get admin dashboard error:', err);
      return { message: '' };
    }
  };

  const getAllUsers = async () => {
    try {
      const users = await adminAPI.getAllUsers();
      console.log('Users from API:', users);
      return Array.isArray(users) ? users.map(user => ({
        id: user.id || user.rank,
        name: user.nama || user.name,
        email: user.email,
        role: user.role || 'user',
        xp: user.poin || user.xp || 0,
        status: user.status || 'aktif',
        joinedAt: user.bergabung_sejak || user.created_at
      })) : [];
    } catch (err) {
      console.error('Get all users error:', err);
      return [];
    }
  };

  const getAllLoans = async () => {
    try {
      const loans = await adminAPI.getAllLoans();
      return Array.isArray(loans) ? loans.map(loan => ({
        id: loan.id,
        bookTitle: loan.judul || loan.bookTitle,
        userName: loan.nama_user || loan.userName,
        author: loan.pengarang || loan.author,
        borrowDate: loan.tanggal_dipinjam || loan.borrowDate,
        dueDate: loan.tanggal_jatuh_tempo || loan.dueDate,
        status: loan.status
      })) : [];
    } catch (err) {
      console.error('Get all loans error:', err);
      return [];
    }
  };

  const getAllReturns = async () => {
    try {
      const returns = await adminAPI.getAllReturns();
      return Array.isArray(returns) ? returns.map(loan => ({
        id: loan.id,
        bookTitle: loan.judul || loan.bookTitle,
        userName: loan.nama_user || loan.userName,
        author: loan.pengarang || loan.author,
        borrowDate: loan.tanggal_dipinjam || loan.borrowDate,
        dueDate: loan.tanggal_jatuh_tempo || loan.dueDate,
        returnDate: loan.tanggal_dikembalikan || loan.returnDate,
        status: loan.status
      })) : [];
    } catch (err) {
      console.error('Get all returns error:', err);
      return [];
    }
  };

  const value = {
    user,
    loading,
    error,
    // Auth
    login,
    register,
    logout,
    getProfile,
    // Profile Management
    updateProfile,
    changePassword,
    updatePhoto,
    // Books
    getBooks,
    getBookById,
    getPopularBooks,
    addBook,
    updateBook,
    deleteBook,
    // Loans
    borrowBook,
    getMyLoans,
    getActiveLoans,
    getLoanHistory,
    returnBook,
    extendLoan,
    // Notifications
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    // Leaderboard
    getLeaderboard,
    getMyRanking,
    // Fines
    getFines,
    getMyFines,
    payFine,
    // Admin
    getAdminDashboard,
    getAllUsers,
    getAllLoans,
    getAllReturns,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
