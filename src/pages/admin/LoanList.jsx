// Loan List Page (Admin)

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import { formatDate, isOverdue } from '../../utils/helpers';

const LoanList = () => {
  const { books, users, getAllLoans } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const allLoans = getAllLoans();
  const activeLoans = allLoans.filter(l => l.status === 'active' || l.status === 'overdue');

  const getBookById = (bookId) => books.find(b => b.id === bookId);
  const getUserById = (userId) => users.find(u => u.id === userId);

  // Filter loans
  const filteredLoans = activeLoans.filter(loan => {
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
        <h1 className="text-2xl font-bold text-gray-900">Daftar Peminjaman</h1>
        <p className="text-gray-600 mt-1">Semua peminjaman buku yang sedang aktif</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-600">Total Aktif</p>
          <p className="text-2xl font-bold text-blue-700">{activeLoans.length}</p>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <p className="text-sm text-green-600">Tepat Waktu</p>
          <p className="text-2xl font-bold text-green-700">
            {activeLoans.filter(l => !isOverdue(l.dueDate)).length}
          </p>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <p className="text-sm text-red-600">Terlambat</p>
          <p className="text-2xl font-bold text-red-700">
            {activeLoans.filter(l => isOverdue(l.dueDate)).length}
          </p>
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

      {/* Loans Table */}
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
                  Jatuh Tempo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Perpanjangan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLoans.map((loan) => {
                const book = getBookById(loan.bookId);
                const user = getUserById(loan.userId || loan.oderId);
                const overdue = isOverdue(loan.dueDate);

                return (
                  <tr key={loan.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
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
                    <td className="px-4 py-4">
                      <span className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(loan.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">
                      {loan.extensionCount}/2
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        overdue 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {overdue ? 'Terlambat' : 'Aktif'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLoans.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">Tidak ada peminjaman aktif</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LoanList;
