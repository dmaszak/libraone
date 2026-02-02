// Return List Page (Admin)

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import { formatDate } from '../../utils/helpers';

const ReturnList = () => {
  const { getAllReturns } = useAuth();
  
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setLoading(true);
        const data = await getAllReturns();
        // Sort by return date (most recent first)
        const sorted = [...data].sort((a, b) => 
          new Date(b.returnDate) - new Date(a.returnDate)
        );
        setReturns(sorted);
      } catch (err) {
        console.error('Error fetching returns:', err);
        setError('Gagal memuat data pengembalian');
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [getAllReturns]);

  // Filter returns
  const filteredReturns = returns.filter(loan => {
    const searchLower = searchQuery.toLowerCase();
    return (
      loan.bookTitle?.toLowerCase().includes(searchLower) ||
      loan.userName?.toLowerCase().includes(searchLower) ||
      loan.author?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
        </div>
        <div className="h-20 bg-gray-200 rounded mb-6 animate-pulse"></div>
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
        <h1 className="text-2xl font-bold text-gray-900">Daftar Pengembalian</h1>
        <p className="text-gray-600 mt-1">Riwayat buku yang sudah dikembalikan</p>
      </div>

      {/* Stats */}
      <Card className="bg-green-50 border-green-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-green-600">Total Dikembalikan</p>
            <p className="text-2xl font-bold text-green-700">{returns.length} buku</p>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari buku atau peminjam..."
          className="max-w-md"
        />
      </div>

      {/* Returns Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buku
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Peminjam
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Tgl Pinjam
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tgl Kembali
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReturns.length > 0 ? filteredReturns.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-xs">{loan.bookTitle}</p>
                      <p className="text-xs text-gray-500 truncate">{loan.author}</p>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-600 hidden sm:table-cell">
                    {loan.userName || '-'}
                  </td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-600 hidden md:table-cell">
                    {formatDate(loan.borrowDate)}
                  </td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-600">
                    {formatDate(loan.returnDate)}
                  </td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      loan.fine > 0 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {loan.fine > 0 ? 'Denda' : 'Tepat Waktu'}
                    </span>
                  </td>
                </tr>
              )) : (
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
