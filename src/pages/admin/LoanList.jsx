// Loan List Page (Admin)

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import { formatDate, isOverdue } from '../../utils/helpers';

const LoanList = () => {
  const { getAllLoans } = useAuth();
  
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const data = await getAllLoans();
        setLoans(data);
      } catch (err) {
        console.error('Error fetching loans:', err);
        setError('Gagal memuat data peminjaman');
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [getAllLoans]);

  // Filter active loans
  const activeLoans = loans.filter(l => 
    l.status === 'active' || l.status === 'aktif' || l.status === 'overdue' || l.status === 'terlambat'
  );

  // Filter loans by search
  const filteredLoans = activeLoans.filter(loan => {
    const searchLower = searchQuery.toLowerCase();
    return (
      loan.bookTitle?.toLowerCase().includes(searchLower) ||
      loan.userName?.toLowerCase().includes(searchLower) ||
      loan.author?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats
  const onTimeLoans = activeLoans.filter(l => !isOverdue(l.dueDate));
  const overdueLoans = activeLoans.filter(l => isOverdue(l.dueDate));

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
          <p className="text-2xl font-bold text-green-700">{onTimeLoans.length}</p>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <p className="text-sm text-red-600">Terlambat</p>
          <p className="text-2xl font-bold text-red-700">{overdueLoans.length}</p>
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
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buku
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Peminjam
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Tanggal Pinjam
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jatuh Tempo
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLoans.length > 0 ? filteredLoans.map((loan) => {
                const overdue = isOverdue(loan.dueDate);
                return (
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
                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm">
                      <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {formatDate(loan.dueDate)}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4">
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
              }) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Tidak ada peminjaman aktif
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
