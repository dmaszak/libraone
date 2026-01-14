// Return List Page (Admin)

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import { formatDate, daysBetween } from '../../utils/helpers';

const ReturnList = () => {
  const { books, users, getAllReturns } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const allReturns = getAllReturns();

  const getBookById = (bookId) => books.find(b => b.id === bookId);
  const getUserById = (userId) => users.find(u => u.id === userId);

  // Filter returns
  const filteredReturns = allReturns.filter(loan => {
    const book = getBookById(loan.bookId);
    const user = getUserById(loan.userId || loan.oderId);
    const searchLower = searchQuery.toLowerCase();
    return (
      book?.title.toLowerCase().includes(searchLower) ||
      user?.name.toLowerCase().includes(searchLower) ||
      user?.email.toLowerCase().includes(searchLower)
    );
  });

  // Sort by return date (most recent first)
  const sortedReturns = [...filteredReturns].sort((a, b) => 
    new Date(b.returnDate) - new Date(a.returnDate)
  );

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
            <p className="text-sm text-green-600">Total Pengembalian</p>
            <p className="text-2xl font-bold text-green-700">{allReturns.length} buku</p>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buku
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peminjam
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Tanggal Pinjam
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Kembali
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Durasi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedReturns.map((loan) => {
                const book = getBookById(loan.bookId);
                const user = getUserById(loan.userId || loan.oderId);
                const duration = daysBetween(loan.borrowDate, loan.returnDate);
                const wasLate = new Date(loan.returnDate) > new Date(loan.dueDate);

                return (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={book?.cover}
                          alt={book?.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-xs">{book?.title}</p>
                          <p className="text-sm text-gray-500 truncate">{book?.author}</p>
                        </div>
                      </div>
                    </td>
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
                    <td className="px-4 py-4 text-sm text-gray-600 hidden sm:table-cell">
                      {formatDate(loan.borrowDate)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                      {formatDate(loan.returnDate)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">
                      {duration} hari
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        wasLate 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {wasLate ? 'Terlambat' : 'Tepat Waktu'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedReturns.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">Belum ada pengembalian buku</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReturnList;
