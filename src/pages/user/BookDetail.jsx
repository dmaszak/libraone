// Book Detail Page

import { useState } from 'react';
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
  const { books, borrowBook, user, getActiveLoans } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const book = books.find(b => b.id === parseInt(id));
  const activeLoans = getActiveLoans();
  const alreadyBorrowed = activeLoans.some(loan => loan.bookId === parseInt(id));

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900">Buku tidak ditemukan</h2>
        <p className="text-gray-500 mt-2">Buku yang kamu cari tidak tersedia</p>
        <Link to="/books">
          <Button className="mt-4">Kembali ke Daftar Buku</Button>
        </Link>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const dueDate = calculateDueDate(today);

  const handleBorrow = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = borrowBook(book.id);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Buku berhasil dipinjam!' });
      setTimeout(() => {
        setShowModal(false);
        navigate('/my-loans');
      }, 1500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    
    setLoading(false);
  };

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
              src={book.cover}
              alt={book.title}
              className="w-full rounded-xl shadow-lg"
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
                <p className="font-medium text-gray-900">{book.publisher}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tahun Terbit</p>
                <p className="font-medium text-gray-900">{book.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stok Tersedia</p>
                <p className={`font-medium ${book.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {book.stock} buku
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Dipinjam</p>
                <p className="font-medium text-gray-900">{book.borrowed} kali</p>
              </div>
            </div>
          </Card>

          {/* Synopsis */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Sinopsis</h2>
            <p className="text-gray-600 leading-relaxed">{book.synopsis}</p>
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
                disabled={book.stock === 0}
                className="w-full"
              >
                {book.stock > 0 ? 'Pinjam Sekarang' : 'Stok Habis'}
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Borrow Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Konfirmasi Peminjaman"
      >
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
              src={book.cover}
              alt={book.title}
              className="w-20 h-28 object-cover rounded-lg"
            />
            <div>
              <h4 className="font-semibold text-gray-900">{book.title}</h4>
              <p className="text-sm text-gray-500">{book.author}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Peminjam</span>
              <span className="font-medium text-gray-900">{user.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tanggal Pinjam</span>
              <span className="font-medium text-gray-900">{formatDate(today)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tanggal Kembali</span>
              <span className="font-medium text-emerald-600">{formatDate(dueDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Durasi</span>
              <span className="font-medium text-gray-900">{LOAN_DURATION_DAYS} hari</span>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Dengan meminjam buku ini, kamu setuju untuk mengembalikannya sebelum tanggal jatuh tempo.
            Keterlambatan akan dikenakan denda Rp 500/hari.
          </p>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="flex-1"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onClick={handleBorrow}
              className="flex-1"
              disabled={loading || message.type === 'success'}
            >
              {loading ? 'Memproses...' : 'Konfirmasi Pinjam'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookDetail;
