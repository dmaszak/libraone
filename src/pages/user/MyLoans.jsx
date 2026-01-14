// My Loans Page

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatDate, calculateFine, isOverdue } from '../../utils/helpers';
import { MAX_EXTENSIONS, FINE_PER_DAY, XP_PER_RETURN } from '../../utils/constants';

const MyLoans = () => {
  const { books, getActiveLoans, getLoanHistory, extendLoan, returnBook } = useAuth();
  
  const [activeTab, setActiveTab] = useState('active');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const activeLoans = getActiveLoans();
  const loanHistory = getLoanHistory();

  const getBookById = (bookId) => books.find(b => b.id === bookId);

  const handleExtend = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = extendLoan(selectedLoan.id);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Peminjaman berhasil diperpanjang!' });
      setTimeout(() => {
        setShowExtendModal(false);
        setSelectedLoan(null);
        setMessage({ type: '', text: '' });
      }, 1500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    
    setLoading(false);
  };

  const handleReturn = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = returnBook(selectedLoan.id);
    
    if (result.success) {
      setMessage({ type: 'success', text: `Buku berhasil dikembalikan! +${result.xpEarned} XP` });
      setTimeout(() => {
        setShowReturnModal(false);
        setSelectedLoan(null);
        setMessage({ type: '', text: '' });
      }, 1500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    
    setLoading(false);
  };

  const LoanCard = ({ loan, showActions = true }) => {
    const book = getBookById(loan.bookId);
    if (!book) return null;

    const overdue = isOverdue(loan.dueDate) && loan.status !== 'returned';
    const fine = calculateFine(loan.dueDate, loan.returnDate);
    const canExtend = loan.extensionCount < MAX_EXTENSIONS && !overdue && loan.status === 'active';

    return (
      <Card className={`${overdue ? 'border-red-200 bg-red-50' : ''}`}>
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
              {loan.status === 'returned' ? (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  Dikembalikan
                </span>
              ) : overdue ? (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                  Terlambat
                </span>
              ) : (
                <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-full">
                  Aktif
                </span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Tanggal Pinjam</p>
                <p className="font-medium text-gray-900">{formatDate(loan.borrowDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">
                  {loan.status === 'returned' ? 'Tanggal Kembali' : 'Jatuh Tempo'}
                </p>
                <p className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDate(loan.status === 'returned' ? loan.returnDate : loan.dueDate)}
                </p>
              </div>
            </div>

            {loan.extensionCount > 0 && loan.status !== 'returned' && (
              <p className="text-xs text-gray-500 mt-2">
                Diperpanjang {loan.extensionCount}x dari max {MAX_EXTENSIONS}x
              </p>
            )}

            {overdue && loan.status !== 'returned' && (
              <div className="mt-2 p-2 bg-red-100 rounded-lg">
                <p className="text-sm text-red-700">
                  Denda: <span className="font-bold">Rp {fine.toLocaleString('id-ID')}</span>
                </p>
              </div>
            )}

            {showActions && loan.status !== 'returned' && (
              <div className="flex gap-2 mt-4">
                {canExtend && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedLoan(loan);
                      setShowExtendModal(true);
                    }}
                  >
                    Perpanjang
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedLoan(loan);
                    setShowReturnModal(true);
                  }}
                >
                  Kembalikan
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pinjaman Saya</h1>
        <p className="text-gray-600 mt-1">Kelola buku yang sedang kamu pinjam</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Sedang Dipinjam ({activeLoans.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Riwayat ({loanHistory.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'active' ? (
        activeLoans.length > 0 ? (
          <div className="space-y-4">
            {activeLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-500">Tidak ada buku yang sedang dipinjam</p>
            <Link to="/books">
              <Button className="mt-4">Jelajahi Buku</Button>
            </Link>
          </div>
        )
      ) : (
        loanHistory.length > 0 ? (
          <div className="space-y-4">
            {loanHistory.map((loan) => (
              <LoanCard key={loan.id} loan={loan} showActions={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">Belum ada riwayat peminjaman</p>
          </div>
        )
      )}

      {/* Extend Modal */}
      <Modal
        isOpen={showExtendModal}
        onClose={() => {
          setShowExtendModal(false);
          setSelectedLoan(null);
          setMessage({ type: '', text: '' });
        }}
        title="Perpanjang Peminjaman"
      >
        {selectedLoan && (
          <div className="space-y-4">
            {message.text && (
              <div className={`p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex gap-4">
              <img
                src={getBookById(selectedLoan.bookId)?.cover}
                alt={getBookById(selectedLoan.bookId)?.title}
                className="w-16 h-24 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{getBookById(selectedLoan.bookId)?.title}</h4>
                <p className="text-sm text-gray-500">{getBookById(selectedLoan.bookId)?.author}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Jatuh Tempo Saat Ini</span>
                <span className="font-medium text-gray-900">{formatDate(selectedLoan.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Jatuh Tempo Baru</span>
                <span className="font-medium text-emerald-600">
                  {formatDate(new Date(new Date(selectedLoan.dueDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Perpanjangan</span>
                <span className="font-medium text-gray-900">
                  {selectedLoan.extensionCount + 1} dari {MAX_EXTENSIONS}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowExtendModal(false);
                  setSelectedLoan(null);
                  setMessage({ type: '', text: '' });
                }}
                className="flex-1"
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                onClick={handleExtend}
                className="flex-1"
                disabled={loading || message.type === 'success'}
              >
                {loading ? 'Memproses...' : 'Perpanjang'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Return Modal */}
      <Modal
        isOpen={showReturnModal}
        onClose={() => {
          setShowReturnModal(false);
          setSelectedLoan(null);
          setMessage({ type: '', text: '' });
        }}
        title="Kembalikan Buku"
      >
        {selectedLoan && (
          <div className="space-y-4">
            {message.text && (
              <div className={`p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex gap-4">
              <img
                src={getBookById(selectedLoan.bookId)?.cover}
                alt={getBookById(selectedLoan.bookId)?.title}
                className="w-16 h-24 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{getBookById(selectedLoan.bookId)?.title}</h4>
                <p className="text-sm text-gray-500">{getBookById(selectedLoan.bookId)?.author}</p>
              </div>
            </div>

            {isOverdue(selectedLoan.dueDate) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium">Buku ini terlambat dikembalikan!</p>
                <p className="text-red-600 text-sm mt-1">
                  Denda yang harus dibayar: <span className="font-bold">Rp {calculateFine(selectedLoan.dueDate).toLocaleString('id-ID')}</span>
                </p>
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-emerald-700">
                Kamu akan mendapatkan <span className="font-bold">+{XP_PER_RETURN} XP</span> setelah mengembalikan buku ini!
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedLoan(null);
                  setMessage({ type: '', text: '' });
                }}
                className="flex-1"
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                onClick={handleReturn}
                className="flex-1"
                disabled={loading || message.type === 'success'}
              >
                {loading ? 'Memproses...' : 'Kembalikan'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyLoans;
