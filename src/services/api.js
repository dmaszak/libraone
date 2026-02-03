// API Service - Connects frontend to backend
import axios from 'axios';

// Base URL - use relative path for development (Vite proxy), full URL for production
const API_BASE_URL = import.meta.env.PROD
  ? 'https://backend-libraone.vercel.app/api'
  : '/api';

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'dknbzegfq';
const CLOUDINARY_UPLOAD_PRESET = 'perpus';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Upload image to Cloudinary
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload to Cloudinary failed');
    }

    const data = await response.json();
    console.log('Cloudinary upload success:', data.secure_url);
    return data.secure_url; // Return the URL of uploaded image
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired atau invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const authAPI = {
  // Register user baru
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (name, email) => {
    // Backend expects 'name'
    const response = await api.put('/users/profile-update', { name, email });
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/users/cange-password', { oldPassword, newPassword });
    return response.data;
  },

  // Update profile photo
  updatePhoto: async (file) => {
    try {
      console.log('Uploading profile photo to Cloudinary...');
      const photoUrl = await uploadToCloudinary(file);
      console.log('Photo uploaded, updating backend with URL:', photoUrl);

      const response = await api.put('/users/profile/poto', { poto: photoUrl });
      return { ...response.data, photoUrl }; // Return URL so context can use it
    } catch (error) {
      console.error('Update photo failed:', error);
      throw error;
    }
  },
};

// ==================== BOOKS API ====================

export const booksAPI = {
  // Get all books
  getAll: async () => {
    const response = await api.get('/books');
    return response.data;
  },

  // Get popular books
  getPopular: async () => {
    const response = await api.get('/books/populer');
    return response.data;
  },

  // Get book by ID
  getById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  // Add new book (admin) - upload cover to Cloudinary first
  create: async (bookData, coverFile = null) => {
    let coverUrl = bookData.cover || 'default.jpg';

    // If there's a cover file, upload to Cloudinary first
    if (coverFile) {
      try {
        console.log('Uploading cover to Cloudinary:', coverFile.name);
        coverUrl = await uploadToCloudinary(coverFile);
        console.log('Cover uploaded successfully:', coverUrl);
      } catch (error) {
        console.error('Failed to upload cover:', error);
        throw new Error('Gagal upload cover buku. Silakan coba lagi.');
      }
    }

    // Send book data with Cloudinary URL to backend
    const payload = {
      id_buku: String(bookData.id_buku),
      judul: String(bookData.judul),
      pengarang: String(bookData.pengarang),
      penerbit: String(bookData.penerbit || '-'),
      tahun_terbit: String(bookData.tahun_terbit),
      kategori: String(bookData.kategori),
      cover: coverUrl,
      buku_deskripsi: String(bookData.buku_deskripsi || '-'),
      jumlah_halaman: parseInt(bookData.jumlah_halaman) || 100
    };

    console.log('Creating book with payload:', payload);
    const response = await api.post('/books/tambah_buku', payload);
    return response.data;
  },

  // Update book (admin) - upload cover to Cloudinary first
  update: async (id, bookData, coverFile = null) => {
    let coverUrl = bookData.cover;

    // If there's a new cover file, upload to Cloudinary first
    if (coverFile) {
      try {
        console.log('Uploading new cover to Cloudinary:', coverFile.name);
        coverUrl = await uploadToCloudinary(coverFile);
        console.log('Cover uploaded successfully:', coverUrl);
      } catch (error) {
        console.error('Failed to upload cover:', error);
        throw new Error('Gagal upload cover buku. Silakan coba lagi.');
      }
    }

    // Send updated book data with Cloudinary URL to backend
    const payload = { ...bookData, cover: coverUrl };
    const response = await api.put(`/books/${id}`, payload);
    return response.data;
  },

  // Delete book (admin)
  delete: async (id_buku) => {
    const response = await api.delete(`/books/${id_buku}`);
    return response.data;
  },
};

// ==================== PEMINJAMAN (LOANS) API ====================

export const loansAPI = {
  // Pinjam buku
  borrow: async (bukuId) => {
    // Send multiple variations to hit the correct validation key
    const payload = {
      buku_id: bukuId,
      id_buku: bukuId,
      book_id: bukuId,
      bukuId: bukuId
    };
    console.log('Sending borrow payload:', payload);
    const response = await api.post('/peminjaman', payload);
    return response.data;
  },

  // Get my loans
  getMyLoans: async () => {
    const response = await api.get('/peminjaman/me');
    return response.data;
  },

  // Get active loans
  getActiveLoans: async () => {
    const response = await api.get('/peminjaman/aktif');
    return response.data;
  },

  // Get loan history
  getHistory: async () => {
    const response = await api.get('/peminjaman/riwayat');
    return response.data;
  },

  // Return book
  returnBook: async (id) => {
    const response = await api.put(`/peminjaman/${id}/kembali`);
    return response.data;
  },

  // Extend loan
  extendLoan: async (id) => {
    const response = await api.put(`/peminjaman/${id}/perpanjang`);
    return response.data;
  },
};

// ==================== NOTIFIKASI API ====================

export const notificationAPI = {
  // Get my notifications
  getMyNotifications: async () => {
    const response = await api.get('/notifikasi/me');
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifikasi/unread-count');
    return response.data;
  },

  // Mark as read
  markAsRead: async (id) => {
    const response = await api.put(`/notifikasi/${id}/read`);
    return response.data;
  },
};

// ==================== LEADERBOARD API ====================

export const leaderboardAPI = {
  // Get all leaderboard
  getAll: async () => {
    const response = await api.get('/leaderboard');
    return response.data;
  },

  // Get my ranking
  getMyRanking: async () => {
    const response = await api.get('/leaderboard/me');
    return response.data;
  },
};

// ==================== DENDA (FINES) API ====================

export const finesAPI = {
  // Get all fines (admin)
  getAll: async () => {
    const response = await api.get('/denda');
    return response.data;
  },

  // Get my fines
  getMyFines: async () => {
    const response = await api.get('/denda/me');
    return response.data;
  },

  // Pay fine
  pay: async (id) => {
    const response = await api.put(`/denda/${id}/bayar`);
    return response.data;
  },
};

// ==================== ADMIN API ====================

export const adminAPI = {
  // Get dashboard
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Get all users (admin)
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Get user detail (admin)
  getUserDetail: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Delete user (admin)
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Get all active loans (admin)
  getActiveLoans: async () => {
    const response = await api.get('/admin/peminjaman/aktif');
    return response.data;
  },

  // Get loan history / returns (admin)
  getAllReturns: async () => {
    const response = await api.get('/admin/peminjaman/riwayat');
    return response.data;
  },

  // Get all loans (admin) - legacy, uses aktif endpoint
  getAllLoans: async () => {
    const response = await api.get('/admin/peminjaman/aktif');
    return response.data;
  },

  // Get on-time returns (admin)
  getOnTimeReturns: async () => {
    const response = await api.get('/admin/peminjaman/tepat-waktu');
    return response.data;
  },

  // Get late returns (admin)
  getLateReturns: async () => {
    const response = await api.get('/admin/peminjaman/terlambat');
    return response.data;
  },

  // Get fine summary per user (admin)
  getDendaSummary: async () => {
    const response = await api.get('/admin/denda/summary');
    return response.data;
  },

  // Get all paid fines (admin)
  getPaidDenda: async () => {
    const response = await api.get('/admin/denda/dibayar');
    return response.data;
  },

  // Get all fines - paid and unpaid (admin)
  getAllDenda: async () => {
    const response = await api.get('/admin/denda');
    return response.data;
  },
};

export default api;
