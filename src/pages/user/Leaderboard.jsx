// Leaderboard Page

import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';

const Leaderboard = () => {
  const { user, getLeaderboard } = useAuth();
  
  const leaderboard = getLeaderboard();
  const userRank = leaderboard.findIndex(u => u.id === user.id) + 1;

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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-1">Peringkat pembaca berdasarkan XP</p>
      </div>

      {/* User Rank Card */}
      <Card className="bg-linear-to-r from-emerald-500 to-emerald-600 text-white mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-14 h-14 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-emerald-100 text-sm">Peringkat Kamu</p>
              <p className="text-3xl font-bold">#{userRank}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-sm">Total XP</p>
            <p className="text-2xl font-bold">{user.xp} XP</p>
          </div>
        </div>
      </Card>

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
              Kamu akan mendapatkan <strong>+10 XP</strong> setiap kali berhasil mengembalikan buku. 
              Pinjam lebih banyak buku untuk naik peringkat!
            </p>
          </div>
        </div>
      </Card>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2nd Place */}
          <div className="text-center">
            <img 
              src={leaderboard[1].avatar} 
              alt={leaderboard[1].name}
              className="w-16 h-16 rounded-full mx-auto border-4 border-gray-400"
            />
            <div className="bg-gray-400 text-white rounded-t-lg mt-2 px-4 py-6">
              <p className="font-bold text-lg">2</p>
            </div>
            <p className="text-sm font-medium text-gray-900 mt-2 truncate max-w-20">{leaderboard[1].name.split(' ')[0]}</p>
            <p className="text-xs text-gray-500">{leaderboard[1].xp} XP</p>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="relative">
              <img 
                src={leaderboard[0].avatar} 
                alt={leaderboard[0].name}
                className="w-20 h-20 rounded-full mx-auto border-4 border-yellow-400"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
                </svg>
              </div>
            </div>
            <div className="bg-yellow-400 text-white rounded-t-lg mt-2 px-6 py-8">
              <p className="font-bold text-xl">1</p>
            </div>
            <p className="text-sm font-medium text-gray-900 mt-2 truncate max-w-24">{leaderboard[0].name.split(' ')[0]}</p>
            <p className="text-xs text-gray-500">{leaderboard[0].xp} XP</p>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <img 
              src={leaderboard[2].avatar} 
              alt={leaderboard[2].name}
              className="w-16 h-16 rounded-full mx-auto border-4 border-amber-600"
            />
            <div className="bg-amber-600 text-white rounded-t-lg mt-2 px-4 py-4">
              <p className="font-bold text-lg">3</p>
            </div>
            <p className="text-sm font-medium text-gray-900 mt-2 truncate max-w-20">{leaderboard[2].name.split(' ')[0]}</p>
            <p className="text-xs text-gray-500">{leaderboard[2].xp} XP</p>
          </div>
        </div>
      )}

      {/* Full Ranking List */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Semua Peringkat</h2>
        {leaderboard.map((rankedUser, index) => {
          const rank = index + 1;
          const isCurrentUser = rankedUser.id === user.id;

          return (
            <Card 
              key={rankedUser.id} 
              className={`${getRankBg(rank, isCurrentUser)} ${isCurrentUser ? 'ring-2 ring-emerald-500' : ''}`}
              padding="sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getRankIcon(rank)}
                  <img 
                    src={rankedUser.avatar} 
                    alt={rankedUser.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className={`font-medium ${isCurrentUser ? 'text-emerald-700' : 'text-gray-900'}`}>
                      {rankedUser.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                          Kamu
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{rankedUser.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isCurrentUser ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {rankedUser.xp} XP
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500">Belum ada data peringkat</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
