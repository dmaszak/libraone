// User Ranking Page (Admin) - With Olympic Podium

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
        setLeaderboard(data || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Gagal memuat data ranking');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [getLeaderboard]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 shrink-0">
            {rank}
          </div>
        );
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-50 border-yellow-200';
      case 2: return 'bg-gray-50 border-gray-200';
      case 3: return 'bg-amber-50 border-amber-200';
      default: return 'hover:bg-gray-50';
    }
  };

  // Podium config for each position
  const podiumConfig = {
    1: {
      height: 'h-36 sm:h-44',
      bgGradient: 'from-yellow-300 via-yellow-400 to-amber-500',
      borderColor: 'border-yellow-400',
      shadowColor: 'shadow-yellow-400/50',
      badge: '🥇',
      label: '1st',
      order: 'order-2' // Center
    },
    2: {
      height: 'h-28 sm:h-36',
      bgGradient: 'from-gray-300 via-slate-400 to-gray-500',
      borderColor: 'border-gray-400',
      shadowColor: 'shadow-gray-400/50',
      badge: '🥈',
      label: '2nd',
      order: 'order-1' // Left
    },
    3: {
      height: 'h-24 sm:h-32',
      bgGradient: 'from-amber-500 via-orange-500 to-amber-700',
      borderColor: 'border-amber-600',
      shadowColor: 'shadow-amber-500/50',
      badge: '🥉',
      label: '3rd',
      order: 'order-3' // Right
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
        </div>
        <div className="h-48 bg-gray-200 rounded-xl mb-6 animate-pulse"></div>
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
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Ranking User</h1>
        <p className="text-gray-600 mt-1">Peringkat user berdasarkan XP yang dikumpulkan</p>
      </div>

      {/* Olympic Podium (Hall of Fame) */}
      {top3.length >= 3 && (
        <div className="mb-10">
          <div className="flex justify-center items-end gap-2 sm:gap-4 px-2">
            {top3.map((item, index) => {
              const rank = item.rank || index + 1;
              const config = podiumConfig[rank];
              const displayAvatar = item.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=10B981&color=fff`;

              return (
                <div key={item.email || index} className={`flex flex-col items-center ${config.order} flex-1 max-w-[140px]`}>
                  {/* Avatar */}
                  <div className={`relative mb-2 ${rank === 1 ? 'animate-pulse' : ''}`}>
                    <img
                      src={displayAvatar}
                      alt={item.name}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white object-cover shadow-sm bg-white"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=10B981&color=fff`;
                      }}
                    />
                  </div>

                  {/* Name & XP */}
                  <div className="text-center mb-2 w-full">
                    <p className="font-bold text-gray-800 text-sm sm:text-base truncate w-full">
                      {item.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">{item.xp || 0} XP</p>
                  </div>

                  {/* Podium Block */}
                  <div className={`w-full ${config.height} bg-gradient-to-t ${config.bgGradient} rounded-t-lg flex items-center justify-center shadow-lg relative overflow-hidden group`}>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-white/20 skew-y-12 translate-y-full group-hover:translate-y-[-200%] transition-transform duration-700"></div>
                    <span className="text-white font-bold text-xl sm:text-2xl drop-shadow">{config.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Remaining List */}
      <div className="space-y-3">
        {restOfLeaderboard.length > 0 ? restOfLeaderboard.map((user, index) => {
          const rank = user.rank || index + 4; // Assuming top 3 are removed

          return (
            <Card key={user.email || index} className={`${getRankBg(rank)} transition-shadow`}>
              <div className="flex items-center gap-4">
                {getRankIcon(rank)}

                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10B981&color=fff`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10B981&color=fff`;
                  }}
                />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-emerald-600">{user.xp || 0}<span className="text-xs sm:hidden"> XP</span></p>
                  <p className="text-xs text-gray-500 hidden sm:block">XP Total</p>
                </div>
              </div>
            </Card>
          );
        }) : (
          top3.length === 0 && (
            <Card className="p-8 text-center text-gray-500">
              Tidak ada data ranking
            </Card>
          )
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200 mt-8">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Info Admin:</p>
            <p>Ranking ini dihitung otomatis berdasarkan aktivitas user. Tidak dapat diubah manual.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserRanking;
