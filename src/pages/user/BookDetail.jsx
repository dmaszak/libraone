// Book Detail Page

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { formatDate, calculateDueDate } from '../../utils/helpers';
import { LOAN_DURATION_DAYS } from '../../utils/constants';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBookById, borrowBook, getActiveLoans } = useAuth();
  
  const [book, setBook] = useState(null);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [bookData, loansData] = await Promise.all([
          getBookById(id),
          getActiveLoans()
        ]);
        
        setBook(bookData);
        setActiveLoans(loansData || []);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Gagal memuat data buku');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, getBookById, getActiveLoans]);

  const alreadyBorrowed = activeLoans.some(loan => loan.bookId === parseInt(id));

  const today = new Date().toISOString().split('T')[0];
  const dueDate = calculateDueDate(today);

  const handleBorrow = async () => {
    setBorrowLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Use idBuku (string like 'bis01') for borrowing, not numeric id
      const result = await borrowBook(book.idBuku);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Buku berhasil dipinjam!' });
        setTimeout(() => {
          setShowModal(false);
          navigate('/my-loans');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal meminjam buku' });
    } finally {
      setBorrowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="w-full h-80 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900">{error || 'Buku tidak ditemukan'}</h2>
        <p className="text-gray-500 mt-2">Buku yang kamu cari tidak tersedia</p>
        <Link to="/books">
          <Button className="mt-4">Kembali ke Daftar Buku</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link to="/books" className="inline-flex items-center text-gray-600 hover:text-emerald-600 mb-6">
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Daftar Buku
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <img
              src={book.cover || '/placeholder-book.png'}
              alt={book.title}
              className="w-full rounded-xl shadow-lg"
              onError={(e) => { e.target.src = '/placeholder-book.png'; }}
            />
            {book.stock === 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-red-600 font-medium">Stok Habis</p>
              </div>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="md:col-span-2">
          <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full mb-3">
            {book.category}
          </span>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
          <p className="text-lg text-gray-600 mb-6">oleh {book.author}</p>

          {/* Info Grid */}
          <Card className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Penerbit</p>
                <p className="font-medium text-gray-900">{book.publisher || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tahun Terbit</p>
                <p className="font-medium text-gray-900">{book.year || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Jumlah Halaman</p>
                <p className="font-medium text-gray-900">{book.pages || '-'} halaman</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-medium ${book.status === 'tersedia' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {book.status === 'tersedia' ? 'Tersedia' : 'Tidak Tersedia'}
                </p>
              </div>
            </div>
          </Card>

          {/* Synopsis */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Sinopsis</h2>
            <p className="text-gray-600 leading-relaxed">{book.synopsis || 'Tidak ada sinopsis tersedia.'}</p>
          </div>

          {/* Borrow Section */}
          <Card className="bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">Informasi Peminjaman</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>• Durasi peminjaman: <span className="font-medium">{LOAN_DURATION_DAYS} hari</span></p>
              <p>• Maksimal perpanjangan: <span className="font-medium">2 kali</span></p>
              <p>• Denda keterlambatan: <span className="font-medium">Rp 500/hari</span></p>
              <p>• XP yang didapat setelah mengembalikan: <span className="font-medium">+10 XP</span></p>
            </div>

            {alreadyBorrowed ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  Kamu sudah meminjam buku ini. Lihat di{' '}
                  <Link to="/my-loans" className="underline font-medium">Pinjaman Saya</Link>
                </p>
              </div>
            ) : (
              <Button
                onClick={() => setShowModal(true)}
                disabled={book.status !== 'tersedia'}
                className="w-full"
              >
                {book.status === 'tersedia' ? 'Pinjam Buku Ini' : 'Tidak Tersedia'}
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Borrow Confirmation Modal */}
      <Modal isOpen={showModal} onClose={() => !borrowLoading && setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Peminjaman</h3>
          <p className="text-gray-600 mb-4">Kamu akan meminjam buku:</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="font-semibold text-gray-900">{book.title}</p>
            <p className="text-sm text-gray-500">{book.author}</p>
          </div>

          <div className="text-sm text-gray-600 mb-6">
            <p>Tanggal Jatuh Tempo: <span className="font-medium">{formatDate(dueDate)}</span></p>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="flex-1"
              disabled={borrowLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleBorrow}
              className="flex-1"
              disabled={borrowLoading}
            >
              {borrowLoading ? 'Memproses...' : 'Konfirmasi Pinjam'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookDetail;
