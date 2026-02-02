import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const Profile = () => {
  const { user, getProfile, getMyRanking, getActiveLoans, getLoanHistory } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loanHistory, setLoanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [profileData, rankingData, activeData, historyData] = await Promise.all([
          getProfile(),
          getMyRanking(),
          getActiveLoans(),
          getLoanHistory()
        ]);
        
        setProfile(profileData);
        setRanking(rankingData);
        setActiveLoans(activeData || []);
        setLoanHistory(historyData || []);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Gagal memuat data profil');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getProfile, getMyRanking, getActiveLoans, getLoanHistory]);

  const getRankBadge = (rank) => {
    if (rank <= 3) return 'bg-linear-to-r from-yellow-400 to-amber-500';
    if (rank <= 10) return 'bg-linear-to-r from-emerald-400 to-green-500';
    return 'bg-linear-to-r from-blue-400 to-indigo-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Profile Header Skeleton */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
          </div>
        </Card>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {profile?.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {ranking?.ranking && ranking.ranking <= 10 && (
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full ${getRankBadge(ranking.ranking)} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                {ranking.ranking}
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-800">
              {profile?.name || user?.name || 'User'}
            </h1>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2 text-gray-600">
              <span className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {profile?.email || user?.email || '-'}
              </span>
              <span className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Bergabung: {formatDate(profile?.joinedAt)}
              </span>
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                profile?.status === 'aktif' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {profile?.status === 'aktif' ? '● Aktif' : '○ ' + (profile?.status || 'Member')}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-3xl font-bold text-gray-800">#{ranking?.ranking || '-'}</span>
          </div>
          <p className="text-gray-500 text-sm">Peringkat</p>
        </Card>

        <Card className="p-4 text-center hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-3xl font-bold text-gray-800">{profile?.xp || ranking?.poin || 0}</span>
          </div>
          <p className="text-gray-500 text-sm">Total XP</p>
        </Card>

        <Card className="p-4 text-center hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-3xl font-bold text-gray-800">{activeLoans.length}</span>
          </div>
          <p className="text-gray-500 text-sm">Sedang Dipinjam</p>
        </Card>

        <Card className="p-4 text-center hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-3xl font-bold text-gray-800">{profile?.totalLoans || loanHistory.length}</span>
          </div>
          <p className="text-gray-500 text-sm">Total Peminjaman</p>
        </Card>
      </div>

      {/* Active Loans */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Buku yang Sedang Dipinjam
        </h2>
        
        {activeLoans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>Tidak ada buku yang sedang dipinjam</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.slice(0, 4).map((loan) => (
              <div key={loan.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <img 
                  src={loan.cover || '/placeholder-book.png'} 
                  alt={loan.title}
                  className="w-16 h-24 object-cover rounded shadow"
                  onError={(e) => { e.target.src = '/placeholder-book.png'; }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 line-clamp-2">{loan.title}</h3>
                  <p className="text-sm text-gray-500">{loan.author}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Jatuh tempo: {formatDate(loan.dueDate)}
                  </p>
                  {new Date(loan.dueDate) < new Date() && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                      Terlambat
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Loan History Preview */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Riwayat Peminjaman Terakhir
        </h2>
        
        {loanHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Belum ada riwayat peminjaman</p>
          </div>
        ) : (
          <div className="space-y-3">
            {loanHistory.slice(0, 5).map((loan) => (
              <div key={loan.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <img 
                  src={loan.cover || '/placeholder-book.png'} 
                  alt={loan.title}
                  className="w-12 h-16 object-cover rounded shadow"
                  onError={(e) => { e.target.src = '/placeholder-book.png'; }}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{loan.title}</h3>
                  <p className="text-sm text-gray-500">{loan.author}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                    Dikembalikan
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(loan.returnDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Profile;
