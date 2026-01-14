// Fines Page

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatDate, calculateFine, daysBetween } from '../../utils/helpers';
import { FINE_PER_DAY } from '../../utils/constants';

const Fines = () => {
  const { books, getOverdueLoans } = useAuth();
  
  const overdueLoans = getOverdueLoans();

  const getBookById = (bookId) => books.find(b => b.id === bookId);

  // Calculate total fine
  const totalFine = overdueLoans.reduce((total, loan) => {
    return total + calculateFine(loan.dueDate);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Denda</h1>
        <p className="text-gray-600 mt-1">Daftar buku yang terlambat dikembalikan</p>
      </div>

      {/* Total Fine Card */}
      {overdueLoans.length > 0 && (
        <Card className="bg-linear-to-r from-red-500 to-red-600 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total Denda</p>
              <p className="text-3xl font-bold">Rp {totalFine.toLocaleString('id-ID')}</p>
              <p className="text-red-100 text-sm mt-1">
                {overdueLoans.length} buku terlambat
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      )}

      {/* Info Box */}
      <Card className="bg-yellow-50 border-yellow-200 mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-yellow-800">Informasi Denda</p>
            <p className="text-sm text-yellow-700 mt-1">
              Denda keterlambatan dikenakan sebesar <strong>Rp {FINE_PER_DAY.toLocaleString('id-ID')}</strong> per hari 
              untuk setiap buku yang melewati tanggal jatuh tempo. Segera kembalikan buku untuk menghindari denda bertambah.
            </p>
          </div>
        </div>
      </Card>

      {/* Overdue Books List */}
      {overdueLoans.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Buku Terlambat</h2>
          {overdueLoans.map((loan) => {
            const book = getBookById(loan.bookId);
            if (!book) return null;

            const fine = calculateFine(loan.dueDate);
            const daysLate = daysBetween(loan.dueDate, new Date().toISOString().split('T')[0]);

            return (
              <Card key={loan.id} className="border-red-200">
                <div className="flex gap-4">
                  <Link to={`/books/${book.id}`}>
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded-lg shrink-0"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link to={`/books/${book.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-emerald-600">{book.title}</h3>
                        </Link>
                        <p className="text-sm text-gray-500">{book.author}</p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-full">
                        Rp {fine.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Tanggal Pinjam</p>
                        <p className="font-medium text-gray-900">{formatDate(loan.borrowDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Jatuh Tempo</p>
                        <p className="font-medium text-red-600">{formatDate(loan.dueDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Terlambat</p>
                        <p className="font-medium text-red-600">{daysLate} hari</p>
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700">
                        Perhitungan: {daysLate} hari × Rp {FINE_PER_DAY.toLocaleString('id-ID')} = <strong>Rp {fine.toLocaleString('id-ID')}</strong>
                      </p>
                    </div>

                    <div className="mt-3">
                      <Link to="/my-loans">
                        <Button size="sm">Kembalikan Sekarang</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Tidak Ada Denda</h3>
          <p className="text-gray-500 mt-2">
            Selamat! Kamu tidak memiliki denda keterlambatan.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Terus pertahankan untuk mengembalikan buku tepat waktu ya!
          </p>
          <Link to="/books">
            <Button className="mt-4" variant="outline">Jelajahi Buku</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Fines;
