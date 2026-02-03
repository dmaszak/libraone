// Leaderboard Page - API Version

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';

const Leaderboard = () => {
  const { user, getLeaderboard, getMyRanking } = useAuth();

  const [leaderboard, setLeaderboard] = useState([]);
  const [myRanking, setMyRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [leaderboardData, rankingData] = await Promise.all([
          getLeaderboard(),
          getMyRanking()
        ]);
        setLeaderboard(leaderboardData || []);
        setMyRanking(rankingData);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Gagal memuat data leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="font-bold text-gray-600">{rank}</span>
          </div>
        );
    }
  };

  const getRankBg = (rank, isCurrentUser) => {
    if (isCurrentUser) return 'bg-emerald-50 border-emerald-200';
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="bg-gray-200 rounded-lg h-24 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-16"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
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

  // Extract top 3 and rest
  const top3 = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🏆 Leaderboard</h1>
        <p className="text-gray-600 mt-1">Peringkat pembaca berdasarkan XP</p>
      </div>

      {/* Olympic Podium - Top 3 (MOVED ABOVE USER RANK) */}
      {top3.length >= 3 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 text-center mb-6">🎖️ Hall of Fame</h2>

          <div className="flex justify-center items-end gap-2 sm:gap-4 px-2">
            {top3.map((item, index) => {
              const rank = item.rank || index + 1;
              const config = podiumConfig[rank];
              const isCurrentUser = item.email === user?.email;
              const displayAvatar = isCurrentUser
                ? user?.avatar
                : (item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=10B981&color=fff`);

              return (
                <div key={item.email || index} className={`flex flex-col items-center ${config.order} flex-1 max-w-[140px]`}>
                  {/* Avatar (Clean - No Glow) */}
                  <div className={`relative mb-2 ${rank === 1 ? 'animate-pulse' : ''}`}>
                    <img
                      src={displayAvatar}
                      alt={item.name}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white object-cover shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=10B981&color=fff`;
                      }}
                    />
                    {/* Badge Removed */}
                  </div>

                  {/* Name & XP */}
                  <p className={`font-bold text-gray-800 text-center text-sm sm:text-base truncate w-full mt-3 ${isCurrentUser ? 'text-emerald-600' : ''}`}>
                    {item.name}
                    {isCurrentUser && <span className="block text-xs text-emerald-500">(Kamu)</span>}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">{item.xp} XP</p>

                  {/* Podium Block */}
                  <div className={`w-full ${config.height} bg-gradient-to-t ${config.bgGradient} rounded-t-lg mt-3 flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-xl sm:text-2xl drop-shadow">{config.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User Rank Card (MOVED BELOW PODIUM) */}
      {myRanking && (
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(myRanking.name)}&background=10B981&color=fff`}
                alt={myRanking.name}
                className="w-14 h-14 rounded-full border-2 border-white object-cover"
              />
              <div>
                <p className="text-emerald-100 text-sm">Peringkat Kamu</p>
                <p className="text-3xl font-bold">#{myRanking.rank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-emerald-100 text-sm">Total XP</p>
              <p className="text-2xl font-bold">{myRanking.xp} XP</p>
            </div>
          </div>
        </Card>
      )}

      {/* How to earn XP */}
      <Card className="bg-blue-50 border-blue-200 mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-blue-800">Cara Mendapatkan XP</p>
            <p className="text-sm text-blue-700 mt-1">
              Setiap meminjam buku kamu akan mendapat 10 XP. Semakin banyak buku yang kamu pinjam, semakin tinggi peringkatmu!
            </p>
          </div>
        </div>
      </Card>

      {/* Leaderboard List (Rank 4+) */}
      {restOfLeaderboard.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">📋 Peringkat Lainnya</h2>
          <div className="space-y-3">
            {restOfLeaderboard.map((item, index) => {
              const isCurrentUser = item.email === user?.email;
              const rank = item.rank || index + 4; // Starts from rank 4

              const displayAvatar = isCurrentUser
                ? user?.avatar
                : (item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=10B981&color=fff`);

              return (
                <Card
                  key={item.email || index}
                  className={`${getRankBg(rank, isCurrentUser)} ${isCurrentUser ? 'ring-2 ring-emerald-500' : ''}`}
                >
                  <div className="flex items-center space-x-4">
                    {getRankIcon(rank)}
                    <img
                      src={displayAvatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=10B981&color=fff`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                            Kamu
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{item.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{item.xp} XP</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="text-gray-500">Belum ada data leaderboard</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
