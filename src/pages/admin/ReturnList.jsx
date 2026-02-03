// Return List Page (Admin) - Loan History with Late Calculation

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ReturnList = () => {
  const [mergedReturns, setMergedReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both All Returns and Late Returns
      const [historyRes, lateRes] = await Promise.allSettled([
        adminAPI.getAllReturns(),
        adminAPI.getLateReturns()
      ]);

      let allReturns = [];
      let lateReturnsMap = new Map();

      // Process History
      if (historyRes.status === 'fulfilled') {
        const data = historyRes.value.data || historyRes.value || [];
        allReturns = Array.isArray(data) ? data : (data.data || []);
      }

      // Process Late Returns to create a lookup map
      if (lateRes.status === 'fulfilled') {
        const data = lateRes.value.data || lateRes.value || [];
        const lateList = Array.isArray(data) ? data : (data.data || []);

        lateList.forEach(item => {
          // Map by ID (peminjaman ID)
          lateReturnsMap.set(item.id, item);
        });
      }

      // Merge Data
      const merged = allReturns.map(item => {
        const lateInfo = lateReturnsMap.get(item.id);
        if (lateInfo) {
          return {
            ...item,
            status: 'terlambat',
            denda: lateInfo.denda || 0,
            hari_terlambat: lateInfo.hari_terlambat || 0,
            tanggal_jatuh_tempo: lateInfo.tanggal_jatuh_tempo || item.tanggal_jatuh_tempo
          };
        }
        return {
          ...item,
          status: 'tepat_waktu',
          denda: 0
        };
      });

      // Sort by return date (most recent first)
      const sorted = merged.sort((a, b) => {
        const dateA = new Date(b.tanggal_kembali || 0);
        const dateB = new Date(a.tanggal_kembali || 0);
        return dateA - dateB;
      });

      setMergedReturns(sorted);

    } catch (err) {
      console.error('Error fetching returns:', err);
      setError('Gagal memuat data pengembalian');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter returns
  const filteredReturns = mergedReturns.filter(loan => {
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

  // Calculate stats based on MERGED data
  const onTimeCount = mergedReturns.filter(r => r.status !== 'terlambat').length;
  const lateCount = mergedReturns.filter(r => r.status === 'terlambat').length;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
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
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Pengembalian</h1>
        <p className="text-gray-600 mt-1">Buku yang sudah dikembalikan oleh peminjam</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-600">Total Dikembalikan</p>
              <p className="text-xl font-bold text-blue-700">{mergedReturns.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-green-600">Tepat Waktu</p>
              <p className="text-xl font-bold text-green-700">{onTimeCount}</p>
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
              <p className="text-sm text-red-600">Terlambat</p>
              <p className="text-xl font-bold text-red-700">{lateCount}</p>
            </div>
          </div>
        </Card>
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
        Menampilkan {filteredReturns.length} dari {mergedReturns.length} data
      </p>

      {/* Returns Table */}
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
                  Tgl Kembali
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReturns.length > 0 ? filteredReturns.map((loan, index) => {
                const bookTitle = loan.judul || loan.bookTitle || '-';
                const author = loan.penulis || loan.author || '-';
                const userName = loan.nama_user || loan.userName || loan.nama || '-';
                const borrowDate = loan.tanggal_pinjam || loan.borrowDate;
                const returnDate = loan.tanggal_kembali || loan.returnDate;
                const isLate = loan.status === 'terlambat';
                const fineAmount = loan.denda || loan.jumlah_denda || 0;

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
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(returnDate)}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${isLate
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                          }`}>
                          {isLate ? 'Terlambat' : 'Tepat Waktu'}
                        </span>
                        {isLate && fineAmount > 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            Denda: {formatCurrency(fineAmount)}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data pengembalian
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

export default ReturnList;
