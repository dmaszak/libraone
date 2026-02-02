// User Ranking Page (Admin)

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';

const UserRanking = () => {
  const { getLeaderboard } = useAuth();
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Gagal memuat data ranking');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [getLeaderboard]);

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-400 text-white';
      case 2:
        return 'bg-gray-400 text-white';
      case 3:
        return 'bg-amber-600 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-amber-50 border-amber-200';
      default:
        return '';
    }
  };

  // Calculate max XP for progress bar
  const maxXP = leaderboard.length > 0 ? (leaderboard[0].xp || 1) : 1;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ranking User</h1>
        <p className="text-gray-600 mt-1">Peringkat user berdasarkan XP yang dikumpulkan</p>
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Cara Mendapatkan XP:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Meminjam buku: <strong>+5 XP</strong></li>
              <li>Mengembalikan tepat waktu: <strong>+10 XP</strong></li>
              <li>Bonus streak peminjaman: <strong>+5 XP</strong></li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Ranking List */}
      <div className="space-y-3">
        {leaderboard.length > 0 ? leaderboard.map((user, index) => {
          const rank = user.rank || index + 1;
          const progress = maxXP > 0 ? ((user.xp || 0) / maxXP) * 100 : 0;
          
          return (
            <Card key={user.email || index} className={`${getRankBg(rank)} hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${getRankStyle(rank)}`}>
                  {rank}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <div className="mt-2 hidden sm:block">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-emerald-600">{user.xp || 0}</p>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
              </div>
            </Card>
          );
        }) : (
          <Card className="p-8 text-center text-gray-500">
            Tidak ada data ranking
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserRanking;
