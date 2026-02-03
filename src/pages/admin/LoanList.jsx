// Loan List Page (Admin) - With tabs for Active, On-Time, Late

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import { formatDate } from '../../utils/helpers';

const LoanList = () => {
  const [activeLoans, setActiveLoans] = useState([]);
  const [onTimeLoans, setOnTimeLoans] = useState([]);
  const [lateLoans, setLateLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('aktif');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [activeRes, onTimeRes, lateRes] = await Promise.allSettled([
        adminAPI.getActiveLoans(),
        adminAPI.getOnTimeReturns(),
        adminAPI.getLateReturns()
      ]);

      // Handle active loans
      if (activeRes.status === 'fulfilled') {
        const data = activeRes.value.data || activeRes.value || [];
        setActiveLoans(Array.isArray(data) ? data : []);
      }

      // Handle on-time returns
      if (onTimeRes.status === 'fulfilled') {
        const data = onTimeRes.value.data || onTimeRes.value || [];
        setOnTimeLoans(Array.isArray(data) ? data : []);
      }

      // Handle late returns
      if (lateRes.status === 'fulfilled') {
        const data = lateRes.value.data || lateRes.value || [];
        setLateLoans(Array.isArray(data) ? data : []);
      }

    } catch (err) {
      console.error('Error fetching loans:', err);
      setError('Gagal memuat data peminjaman');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'aktif':
        return activeLoans;
      case 'tepat-waktu':
        return onTimeLoans;
      case 'terlambat':
        return lateLoans;
      default:
        return activeLoans;
    }
  };

  // Filter loans by search
  const filteredLoans = getCurrentData().filter(loan => {
    const searchLower = searchQuery.toLowerCase();
    const bookTitle = loan.judul || loan.bookTitle || '';
    const userName = loan.nama_user || loan.userName || loan.nama || '';
    const author = loan.penulis || loan.author || '';
    return (
      bookTitle.toLowerCase().includes(searchLower) ||
      userName.toLowerCase().includes(searchLower) ||
      author.toLowerCase().includes(searchLower)
    );
  });

  const tabs = [
    { id: 'aktif', label: 'Peminjaman Aktif', count: activeLoans.length, color: 'blue' },
    { id: 'tepat-waktu', label: 'Tepat Waktu', count: onTimeLoans.length, color: 'green' },
    { id: 'terlambat', label: 'Terlambat', count: lateLoans.length, color: 'red' },
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
        </div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
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
            onClick={fetchData}
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
        <h1 className="text-2xl font-bold text-gray-900">Daftar Peminjaman</h1>
        <p className="text-gray-600 mt-1">Kelola peminjaman buku di perpustakaan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-600">Peminjaman Aktif</p>
          <p className="text-2xl font-bold text-blue-700">{activeLoans.length}</p>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <p className="text-sm text-green-600">Tepat Waktu</p>
          <p className="text-2xl font-bold text-green-700">{onTimeLoans.length}</p>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <p className="text-sm text-red-600">Terlambat</p>
          <p className="text-2xl font-bold text-red-700">{lateLoans.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                ? `bg-${tab.color}-500 text-white shadow-lg`
                : `bg-${tab.color}-50 text-${tab.color}-700 hover:bg-${tab.color}-100`
              }`}
            style={{
              backgroundColor: activeTab === tab.id
                ? (tab.color === 'blue' ? '#3B82F6' : tab.color === 'green' ? '#10B981' : '#EF4444')
                : undefined,
              color: activeTab === tab.id ? 'white' : undefined
            }}
          >
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id
                ? 'bg-white/20 text-white'
                : `bg-${tab.color}-100`
              }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari buku atau peminjam..."
          className="max-w-md"
        />
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        Menampilkan {filteredLoans.length} data
      </p>

      {/* Loans Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buku
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Peminjam
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Tgl Pinjam
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'aktif' ? 'Jatuh Tempo' : 'Tgl Kembali'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLoans.length > 0 ? filteredLoans.map((loan, index) => {
                const bookTitle = loan.judul || loan.bookTitle || '-';
                const author = loan.penulis || loan.author || '-';
                const userName = loan.nama_user || loan.userName || loan.nama || '-';
                const borrowDate = loan.tanggal_pinjam || loan.borrowDate;
                const dueDate = loan.tanggal_jatuh_tempo || loan.dueDate;
                const returnDate = loan.tanggal_kembali || loan.returnDate;
                const status = loan.status || (activeTab === 'terlambat' ? 'Terlambat' : activeTab === 'tepat-waktu' ? 'Tepat Waktu' : 'Aktif');

                return (
                  <tr key={loan.id || loan.id_peminjaman || index} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">{bookTitle}</p>
                        <p className="text-xs text-gray-500 truncate">{author}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden sm:table-cell">
                      {userName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">
                      {formatDate(borrowDate)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={activeTab === 'terlambat' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {formatDate(activeTab === 'aktif' ? dueDate : returnDate)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${activeTab === 'terlambat' || status.toLowerCase().includes('terlambat')
                          ? 'bg-red-100 text-red-700'
                          : activeTab === 'tepat-waktu' || status.toLowerCase().includes('tepat')
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                        {activeTab === 'aktif' ? 'Aktif' : activeTab === 'tepat-waktu' ? 'Tepat Waktu' : 'Terlambat'}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data {activeTab === 'aktif' ? 'peminjaman aktif' : activeTab === 'tepat-waktu' ? 'pengembalian tepat waktu' : 'pengembalian terlambat'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default LoanList;
