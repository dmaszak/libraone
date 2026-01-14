// Fine Report Page (Admin)

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import { formatDate, formatCurrency, calculateFine, daysBetween } from '../../utils/helpers';
import { FINE_PER_DAY } from '../../utils/constants';

const FineReport = () => {
  const { books, users, getAllFines } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const allFines = getAllFines();

  const getBookById = (bookId) => books.find(b => b.id === bookId);
  const getUserById = (userId) => users.find(u => u.id === userId);

  // Calculate total fines
  const totalFines = allFines.reduce((total, loan) => {
    return total + calculateFine(loan.dueDate);
  }, 0);

  // Filter fines
  const filteredFines = allFines.filter(loan => {
    const book = getBookById(loan.bookId);
    const user = getUserById(loan.userId || loan.oderId);
    const searchLower = searchQuery.toLowerCase();
    return (
      book?.title.toLowerCase().includes(searchLower) ||
      user?.name.toLowerCase().includes(searchLower) ||
      user?.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Denda</h1>
        <p className="text-gray-600 mt-1">Daftar user dengan keterlambatan pengembalian</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-yellow-600">Buku Terlambat</p>
              <p className="text-2xl font-bold text-yellow-700">{allFines.length} buku</p>
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
            Denda dihitung <strong>{formatCurrency(FINE_PER_DAY)}</strong> per hari keterlambatan untuk setiap buku.
          </p>
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

      {/* Fines Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peminjam
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buku
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Jatuh Tempo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terlambat
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Denda
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFines.map((loan) => {
                const book = getBookById(loan.bookId);
                const user = getUserById(loan.userId || loan.oderId);
                const fine = calculateFine(loan.dueDate);
                const daysLate = daysBetween(loan.dueDate, new Date().toISOString().split('T')[0]);

                return (
                  <tr key={loan.id} className="hover:bg-gray-50 bg-red-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={user?.avatar}
                          alt={user?.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={book?.cover}
                          alt={book?.title}
                          className="w-8 h-12 object-cover rounded"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate max-w-xs">{book?.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-red-600 hidden sm:table-cell">
                      {formatDate(loan.dueDate)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                        {daysLate} hari
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-red-600">{formatCurrency(fine)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredFines.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500">Tidak ada denda keterlambatan</p>
            <p className="text-sm text-gray-400 mt-1">Semua peminjaman tepat waktu</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FineReport;
