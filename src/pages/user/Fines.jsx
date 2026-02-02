// Fines Page - API Version

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { FINE_PER_DAY } from '../../utils/constants';

const Fines = () => {
  const { getMyFines, payFine } = useAuth();
  
  const [fineData, setFineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchFines = async () => {
      try {
        setLoading(true);
        const data = await getMyFines();
        setFineData(data);
      } catch (err) {
        console.error('Error fetching fines:', err);
        setError('Gagal memuat data denda');
      } finally {
        setLoading(false);
      }
    };

    fetchFines();
  }, []);

  const handlePayFine = async (id) => {
    setPayLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await payFine(id);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Refresh data
        const data = await getMyFines();
        setFineData(data);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal membayar denda' });
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="bg-gray-200 rounded-lg h-32 mb-6"></div>
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

  const totalFine = fineData?.total || fineData?.total_denda || 0;
  const hasFine = totalFine > 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Denda</h1>
        <p className="text-gray-600 mt-1">Informasi denda keterlambatan pengembalian buku</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Total Fine Card */}
      {hasFine ? (
        <Card className="bg-linear-to-r from-red-500 to-red-600 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total Denda</p>
              <p className="text-3xl font-bold">Rp {totalFine.toLocaleString('id-ID')}</p>
              <p className="text-red-100 text-sm mt-1">
                Segera bayar untuk menghindari denda bertambah
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-linear-to-r from-emerald-500 to-emerald-600 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Status Denda</p>
              <p className="text-2xl font-bold">Tidak Ada Denda</p>
              <p className="text-emerald-100 text-sm mt-1">
                Kamu tidak memiliki denda saat ini 🎉
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

      {/* Pay Fine Button */}
      {hasFine && (
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Bayar Denda</h3>
              <p className="text-sm text-gray-500">Bayar denda untuk melanjutkan peminjaman buku</p>
            </div>
            <Button 
              onClick={() => handlePayFine(fineData?.id)} 
              disabled={payLoading}
            >
              {payLoading ? 'Memproses...' : 'Bayar Sekarang'}
            </Button>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-blue-800">Tips Menghindari Denda</p>
            <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-1">
              <li>Aktifkan notifikasi untuk reminder jatuh tempo</li>
              <li>Perpanjang peminjaman sebelum jatuh tempo</li>
              <li>Kembalikan buku tepat waktu</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Fines;
