// Fines Page - API Version with Payment Method Selection

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { FINE_PER_DAY } from '../../utils/constants';
import qrisImage from '../../assets/qris.png';

const Fines = () => {
  const { getMyFines, payFine } = useAuth();

  const [fineData, setFineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showQrisModal, setShowQrisModal] = useState(false);

  const paymentMethods = [
    {
      id: 'qris',
      name: 'QRIS',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
          <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
          <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
          <rect x="14" y="14" width="3" height="3" strokeWidth="2" />
          <rect x="18" y="14" width="3" height="3" strokeWidth="2" />
          <rect x="14" y="18" width="3" height="3" strokeWidth="2" />
          <rect x="18" y="18" width="3" height="3" strokeWidth="2" />
        </svg>
      ),
      description: 'Scan QR Code untuk bayar',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'transfer',
      name: 'Transfer Bank',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      description: 'BCA, BNI, Mandiri, BRI',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'ewallet',
      name: 'E-Wallet',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      description: 'GoPay, OVO, Dana, ShopeePay',
      color: 'from-emerald-500 to-teal-600'
    }
  ];

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

  const openPaymentModal = () => {
    setSelectedMethod(null);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedMethod) return;

    // If QRIS selected, show QRIS modal instead of processing immediately
    if (selectedMethod.id === 'qris') {
      setShowPaymentModal(false);
      setShowQrisModal(true);
      return;
    }

    setPayLoading(true);
    setMessage({ type: '', text: '' });
    setShowPaymentModal(false);

    try {
      // Pay all fines
      const fines = fineData?.fines || [];
      let allSuccess = true;
      let lastMessage = '';

      for (const fine of fines) {
        console.log('Processing fine:', fine);
        // Use paymentId (peminjaman_id) found from loan history
        const fineId = fine.paymentId || fine.denda_id || fine.id || fine.id_denda;
        console.log('Using ID for payment:', fineId);

        if (fineId) {
          const result = await payFine(fineId);
          console.log('Payment result:', result);

          if (!result.success) {
            allSuccess = false;
            lastMessage = result.message;
            break;
          }
          lastMessage = result.message;
        } else {
          console.error('No valid ID found for fine:', fine);
        }
      }

      if (allSuccess && fines.length > 0) {
        setMessage({ type: 'success', text: `Pembayaran via ${selectedMethod.name} berhasil! ${lastMessage}` });

        // Optimistic update: Manually clear fines from UI since backend might be slow to update
        setFineData({
          total: 0,
          fines: [],
          count: 0
        });

        // Still try to refresh accurate data from server with delay
        setTimeout(async () => {
          await getMyFines();
        }, 2000);
      } else if (fines.length === 0) {
        setMessage({ type: 'error', text: 'Tidak ada denda untuk dibayar' });
      } else {
        setMessage({ type: 'error', text: lastMessage });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal membayar denda' });
    } finally {
      setPayLoading(false);
      setSelectedMethod(null);
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
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {message.text}
        </div>
      )}

      {/* Total Fine Card */}
      {hasFine ? (
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white mb-6">
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
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white mb-6">
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
              onClick={openPaymentModal}
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

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Pilih Metode Pembayaran</h2>
                  <p className="text-emerald-100 text-sm mt-1">Total: Rp {totalFine.toLocaleString('id-ID')}</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="p-6 space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${selectedMethod?.id === method.id
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.color} text-white flex items-center justify-center shadow-lg`}>
                    {method.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">{method.name}</p>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                  {selectedMethod?.id === method.id && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={!selectedMethod}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${selectedMethod
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QRIS Image Modal */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Scan QRIS</h2>
                  <p className="text-purple-100 text-sm">Total: Rp {totalFine.toLocaleString('id-ID')}</p>
                </div>
                <button
                  onClick={() => setShowQrisModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* QRIS Image */}
            <div className="p-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-inner">
                <img
                  src={qrisImage}
                  alt="QRIS Payment"
                  className="w-56 h-56 object-contain"
                />
              </div>
              <p className="text-gray-600 text-sm mt-4 text-center">
                Scan kode QR di atas menggunakan aplikasi e-wallet atau mobile banking Anda
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setShowQrisModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  setShowQrisModal(false);
                  setPayLoading(true);
                  setMessage({ type: '', text: '' });
                  try {
                    // Pay all fines via QRIS
                    const fines = fineData?.fines || [];
                    let allSuccess = true;
                    let lastMessage = '';

                    for (const fine of fines) {
                      console.log('Processing fine (QRIS):', fine);
                      // Use paymentId (peminjaman_id) found from loan history
                      const fineId = fine.paymentId || fine.denda_id || fine.id || fine.id_denda;
                      if (fineId) {
                        const result = await payFine(fineId);
                        console.log('Payment result (QRIS):', result);

                        if (!result.success) {
                          allSuccess = false;
                          lastMessage = result.message;
                          break;
                        }
                        lastMessage = result.message;
                      }
                    }

                    if (allSuccess && fines.length > 0) {
                      setMessage({ type: 'success', text: `Pembayaran via QRIS berhasil! ${lastMessage}` });

                      // Optimistic update: Manually clear fines from UI
                      setFineData({
                        total: 0,
                        fines: [],
                        count: 0
                      });

                      // Background refresh
                      setTimeout(async () => {
                        await getMyFines();
                      }, 2000);
                    } else if (fines.length === 0) {
                      setMessage({ type: 'error', text: 'Tidak ada denda untuk dibayar' });
                    } else {
                      setMessage({ type: 'error', text: lastMessage });
                    }
                  } catch (err) {
                    setMessage({ type: 'error', text: 'Gagal membayar denda' });
                  } finally {
                    setPayLoading(false);
                    setSelectedMethod(null);
                  }
                }}
                disabled={payLoading}
                className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-lg"
              >
                {payLoading ? 'Memproses...' : 'Sudah Bayar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fines;
