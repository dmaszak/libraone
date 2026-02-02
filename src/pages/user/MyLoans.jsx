// My Loans Page - API Version

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import { MAX_EXTENSIONS } from '../../utils/constants';

const MyLoans = () => {
  const { getActiveLoans, getLoanHistory, extendLoan, returnBook } = useAuth();
  
  const [activeTab, setActiveTab] = useState('active');
  const [activeLoans, setActiveLoans] = useState([]);
  const [loanHistory, setLoanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch loans from API
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const [active, history] = await Promise.all([
          getActiveLoans(),
          getLoanHistory()
        ]);
        setActiveLoans(active || []);
        setLoanHistory(history || []);
      } catch (err) {
        console.error('Error fetching loans:', err);
        setError('Gagal memuat data peminjaman');
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const refreshLoans = async () => {
    try {
      const [active, history] = await Promise.all([
        getActiveLoans(),
        getLoanHistory()
      ]);
      setActiveLoans(active || []);
      setLoanHistory(history || []);
    } catch (err) {
      console.error('Error refreshing loans:', err);
    }
  };

  const handleExtend = async () => {
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await extendLoan(selectedLoan.id);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Peminjaman berhasil diperpanjang!' });
        await refreshLoans();
        setTimeout(() => {
          setShowExtendModal(false);
          setSelectedLoan(null);
          setMessage({ type: '', text: '' });
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await returnBook(selectedLoan.id);
      
      if (result.success) {
        const fineMsg = result.fine > 0 ? ` Denda: Rp ${result.fine.toLocaleString('id-ID')}` : '';
        setMessage({ type: 'success', text: `${result.message}${fineMsg}` });
        await refreshLoans();
        setTimeout(() => {
          setShowReturnModal(false);
          setSelectedLoan(null);
          setMessage({ type: '', text: '' });
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setActionLoading(false);
    }
  };

  const LoanCard = ({ loan, showActions = true }) => {
    const isOverdue = new Date(loan.dueDate) < new Date() && loan.status !== 'dikembalikan';
    const canExtend = (loan.extensionCount || 0) < MAX_EXTENSIONS && !isOverdue;

    return (
      <Card className={`${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{loan.title}</h3>
                <p className="text-sm text-gray-500">{loan.author}</p>
              </div>
              {loan.status === 'dikembalikan' ? (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  Dikembalikan
                </span>
              ) : isOverdue ? (
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
                <p className="text-gray-500">Jatuh Tempo</p>
                <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDate(loan.dueDate)}
                </p>
              </div>
            </div>

            {loan.extensionCount > 0 && loan.status !== 'dikembalikan' && (
              <p className="text-xs text-gray-500 mt-2">
                Diperpanjang {loan.extensionCount}x dari max {MAX_EXTENSIONS}x
              </p>
            )}

            {showActions && loan.status !== 'dikembalikan' && (
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

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
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <p className="text-gray-600">
              Perpanjang peminjaman buku <strong>{selectedLoan.title}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              Peminjaman akan diperpanjang 2 hari dari tanggal jatuh tempo saat ini.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowExtendModal(false);
                  setSelectedLoan(null);
                  setMessage({ type: '', text: '' });
                }}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button onClick={handleExtend} disabled={actionLoading}>
                {actionLoading ? 'Memproses...' : 'Perpanjang'}
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
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <p className="text-gray-600">
              Kembalikan buku <strong>{selectedLoan.title}</strong>?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedLoan(null);
                  setMessage({ type: '', text: '' });
                }}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button onClick={handleReturn} disabled={actionLoading}>
                {actionLoading ? 'Memproses...' : 'Kembalikan'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyLoans;
