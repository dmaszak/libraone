// Admin Dashboard Page

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../utils/helpers';
import { FINE_PER_DAY } from '../../utils/constants';

const AdminDashboard = () => {
  const { books, users, getAllLoans, getAllFines, getPopularBooks, getLeaderboard } = useAuth();
  
  const allLoans = getAllLoans();
  const activeLoans = allLoans.filter(l => l.status === 'active' || l.status === 'overdue');
  const returnedLoans = allLoans.filter(l => l.status === 'returned');
  const overdueLoans = getAllFines();
  const totalUsers = users.filter(u => u.role === 'user').length;
  const popularBooks = getPopularBooks(5);
  const topUsers = getLeaderboard().slice(0, 5);

  // Calculate total fines
  const calculateTotalFines = () => {
    let total = 0;
    overdueLoans.forEach(loan => {
      const today = new Date();
      const dueDate = new Date(loan.dueDate);
      if (today > dueDate) {
        const daysLate = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
        total += daysLate * FINE_PER_DAY;
      }
    });
    return total;
  };

  const stats = [
    {
      title: 'Total Buku',
      value: books.length,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      link: '/admin/books'
    },
    {
      title: 'Total User',
      value: totalUsers,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-emerald-500 to-emerald-600',
      link: '/admin/users'
    },
    {
      title: 'Peminjaman Aktif',
      value: activeLoans.length,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      link: '/admin/loans'
    },
    {
      title: 'Total Denda',
      value: formatCurrency(calculateTotalFines()),
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
    { title: 'Daftar User', path: '/admin/users', icon: '👥' },
    { title: 'Peminjaman', path: '/admin/loans', icon: '📋' },
    { title: 'Pengembalian', path: '/admin/returns', icon: '✅' },
    { title: 'Laporan Denda', path: '/admin/fines', icon: '💰' },
    { title: 'Buku Populer', path: '/admin/popular', icon: '⭐' },
    { title: 'Ranking XP', path: '/admin/rankings', icon: '🏆' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">Selamat datang di panel administrasi LibraOne</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <Card className={`bg-linear-to-r ${stat.color} text-white hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickLinks.map((link, index) => (
            <Link key={index} to={link.path}>
              <Card hover className="text-center py-4">
                <span className="text-2xl">{link.icon}</span>
                <p className="text-sm font-medium text-gray-700 mt-2">{link.title}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Books */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Buku Terpopuler</h3>
            <Link to="/admin/popular" className="text-sm text-emerald-600 hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {popularBooks.map((book, index) => (
              <div key={book.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {index + 1}
                </span>
                <img src={book.cover} alt={book.title} className="w-10 h-14 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{book.title}</p>
                  <p className="text-xs text-gray-500">{book.borrowed}x dipinjam</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Users by XP */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top User (XP)</h3>
            <Link to="/admin/rankings" className="text-sm text-emerald-600 hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {index + 1}
                </span>
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">{user.xp} XP</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{activeLoans.length}</p>
              <p className="text-sm text-blue-600">Peminjaman Aktif</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{returnedLoans.length}</p>
              <p className="text-sm text-green-600">Sudah Dikembalikan</p>
            </div>
          </div>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{overdueLoans.length}</p>
              <p className="text-sm text-red-600">Terlambat</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
