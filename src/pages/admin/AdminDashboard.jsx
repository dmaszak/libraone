// Admin Dashboard Page

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../utils/helpers';

const AdminDashboard = () => {
  const { getBooks, getPopularBooks, getLeaderboard, getFines, getAdminDashboard } = useAuth();
  
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalFines: 0
  });
  const [popularBooks, setPopularBooks] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [books, popular, leaderboard, fines, dashboard] = await Promise.all([
          getBooks(),
          getPopularBooks(),
          getLeaderboard(),
          getFines(),
          getAdminDashboard()
        ]);

        // Calculate stats from available data
        const totalFines = Array.isArray(fines) 
          ? fines.reduce((sum, f) => sum + (f.totalFine || 0), 0) 
          : 0;

        setStats({
          totalBooks: Array.isArray(books) ? books.length : 0,
          totalFines: totalFines
        });

        setPopularBooks(Array.isArray(popular) ? popular.slice(0, 5) : []);
        setTopUsers(Array.isArray(leaderboard) ? leaderboard.slice(0, 5) : []);
        setWelcomeMessage(dashboard?.message || 'Selamat datang admin');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Buku',
      value: stats.totalBooks,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      link: '/admin/books'
    },
    {
      title: 'Total Denda',
      value: formatCurrency(stats.totalFines),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-red-500 to-red-600',
      link: '/admin/fines'
    }
  ];

  const quickLinks = [
    { title: 'Kelola Buku', path: '/admin/books', icon: '📚' },
    { title: 'Buku Populer', path: '/admin/popular', icon: '⭐' },
    { title: 'Ranking XP', path: '/admin/rankings', icon: '🏆' },
    { title: 'Laporan Denda', path: '/admin/fines', icon: '💰' }
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-72 mt-2 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-200 rounded-xl h-28 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Coba Lagi
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">{welcomeMessage}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`absolute inset-0 bg-linear-to-r ${stat.color} opacity-10`}></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-linear-to-r ${stat.color} text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="flex flex-col items-center p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            >
              <span className="text-2xl mb-1">{link.icon}</span>
              <span className="text-xs text-center font-medium">{link.title}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Books */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Buku Terpopuler</h2>
            <Link to="/admin/popular" className="text-sm text-emerald-600 hover:text-emerald-700">
              Lihat Semua →
            </Link>
          </div>
          <div className="space-y-3">
            {popularBooks.length > 0 ? popularBooks.map((book, index) => (
              <div key={book.idBuku || book.id_buku || index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-amber-100 text-amber-600' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{book.title || book.judul}</p>
                  <p className="text-sm text-gray-500 truncate">{book.author || book.pengarang}</p>
                </div>
                <span className="text-sm text-gray-500">{book.borrowed || book.total_dipinjam || 0}x</span>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">Belum ada data</p>
            )}
          </div>
        </Card>

        {/* Top Users */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Users (XP)</h2>
            <Link to="/admin/rankings" className="text-sm text-emerald-600 hover:text-emerald-700">
              Lihat Semua →
            </Link>
          </div>
          <div className="space-y-3">
            {topUsers.length > 0 ? topUsers.map((user, index) => (
              <div key={user.email || index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-amber-100 text-amber-600' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <span className="text-sm font-medium text-emerald-600">{user.xp || user.poin} XP</span>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">Belum ada data</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
