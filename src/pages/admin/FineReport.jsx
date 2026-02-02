// Fine Report Page (Admin)

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import { formatCurrency } from '../../utils/helpers';
import { FINE_PER_DAY } from '../../utils/constants';

const FineReport = () => {
  const { getFines } = useAuth();
  
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFines = async () => {
      try {
        setLoading(true);
        const data = await getFines();
        setFines(data);
      } catch (err) {
        console.error('Error fetching fines:', err);
        setError('Gagal memuat data denda');
      } finally {
        setLoading(false);
      }
    };

    fetchFines();
  }, [getFines]);

  // Calculate total fines
  const totalFines = fines.reduce((total, fine) => total + (fine.totalFine || 0), 0);

  // Filter fines
  const filteredFines = fines.filter(fine => {
    const searchLower = searchQuery.toLowerCase();
    return fine.user?.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
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
        <h1 className="text-2xl font-bold text-gray-900">Laporan Denda</h1>
        <p className="text-gray-600 mt-1">Daftar user dengan denda aktif</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-red-600">Total Denda</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(totalFines)}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-yellow-600">User dengan Denda</p>
              <p className="text-2xl font-bold text-yellow-700">{fines.length} user</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-700">
            Denda keterlambatan: <strong>{formatCurrency(FINE_PER_DAY)}</strong> per hari
          </p>
        </div>
      </Card>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama user..."
          className="max-w-md"
        />
      </div>

      {/* Fines Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Denda
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFines.length > 0 ? filteredFines.map((fine, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold">
                        {fine.user?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <p className="font-medium text-gray-900">{fine.user}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-bold text-red-600">{formatCurrency(fine.totalFine || 0)}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-green-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Tidak ada denda tercatat</p>
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
