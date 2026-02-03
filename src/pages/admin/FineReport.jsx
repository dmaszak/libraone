// Fine Report Page (Admin) - All Fines with Status Filters

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { FINE_PER_DAY } from '../../utils/constants';

const FineReport = () => {
  const [allFines, setAllFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAPI.getAllDenda();
      const data = response.data || response || [];
      setAllFines(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error('Error fetching fines:', err);
      setError('Gagal memuat data denda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter by status
  const paidFines = allFines.filter(f =>
    f.status === 'lunas' || f.status === 'dibayar' || f.status === 'paid'
  );
  const unpaidFines = allFines.filter(f =>
    f.status === 'belum_dibayar' || f.status === 'unpaid' || f.status === 'aktif' || !f.status
  );

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'paid':
        return paidFines;
      case 'unpaid':
        return unpaidFines;
      default:
        return allFines;
    }
  };

  // Filter by search
  const filteredData = getCurrentData().filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const userName = item.nama_user || item.nama || item.user || '';
    const bookTitle = item.judul || item.bookTitle || '';
    return (
      userName.toLowerCase().includes(searchLower) ||
      bookTitle.toLowerCase().includes(searchLower)
    );
  });

  // Calculate totals
  const totalUnpaid = unpaidFines.reduce((sum, item) => sum + (item.jumlah || item.total_denda || 0), 0);
  const totalPaid = paidFines.reduce((sum, item) => sum + (item.jumlah || item.total_denda || 0), 0);

  const tabs = [
    { id: 'all', label: 'Semua Denda', count: allFines.length, color: 'blue' },
    { id: 'unpaid', label: 'Belum Bayar', count: unpaidFines.length, color: 'red' },
    { id: 'paid', label: 'Sudah Bayar', count: paidFines.length, color: 'green' },
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
          {[1, 2, 3].map(i => (
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
        <h1 className="text-2xl font-bold text-gray-900">Laporan Denda</h1>
        <p className="text-gray-600 mt-1">Semua denda keterlambatan pengembalian buku</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-600">Total Denda</p>
          <p className="text-xl font-bold text-blue-700">{allFines.length}</p>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <p className="text-sm text-red-600">Belum Bayar</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(totalUnpaid)}</p>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <p className="text-sm text-green-600">Sudah Bayar</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-600">Denda/Hari</p>
          <p className="text-xl font-bold text-yellow-700">{formatCurrency(FINE_PER_DAY)}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                ? 'shadow-lg text-white'
                : 'hover:opacity-80'
              }`}
            style={{
              backgroundColor: activeTab === tab.id
                ? (tab.color === 'blue' ? '#3B82F6' : tab.color === 'red' ? '#EF4444' : '#10B981')
                : (tab.color === 'blue' ? '#DBEAFE' : tab.color === 'red' ? '#FEE2E2' : '#D1FAE5'),
              color: activeTab === tab.id
                ? 'white'
                : (tab.color === 'blue' ? '#1D4ED8' : tab.color === 'red' ? '#B91C1C' : '#047857')
            }}
          >
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : ''
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
          placeholder="Cari nama user atau judul buku..."
          className="max-w-md"
        />
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        Menampilkan {filteredData.length} data
      </p>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Buku
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length > 0 ? filteredData.map((item, index) => {
                const userName = item.nama_user || item.nama || item.user || '-';
                const bookTitle = item.judul || item.bookTitle || '-';
                const amount = item.jumlah || item.total_denda || 0;
                const fineDate = item.tanggal_kembali || item.tanggal_denda || item.created_at;
                const status = item.status || 'belum_dibayar';
                const isPaid = status === 'lunas' || status === 'dibayar' || status === 'paid';

                return (
                  <tr key={item.id || item.denda_id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isPaid
                            ? 'bg-gradient-to-br from-green-400 to-green-600'
                            : 'bg-gradient-to-br from-red-400 to-red-600'
                          }`}>
                          {userName.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{userName}</p>
                          <p className="text-xs text-gray-500 sm:hidden truncate max-w-[120px]">{bookTitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden sm:table-cell">
                      <p className="truncate max-w-xs">{bookTitle}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">
                      {formatDate(fineDate)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-bold ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(amount)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${isPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                        {isPaid ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Tidak ada data denda</p>
                    </div>
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

export default FineReport;
