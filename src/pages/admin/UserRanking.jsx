// User Ranking Page (Admin)

import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';

const UserRanking = () => {
  const { getLeaderboard } = useAuth();

  const leaderboard = getLeaderboard();

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
  const maxXP = leaderboard.length > 0 ? leaderboard[0].xp : 1;

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
          <p className="text-sm text-blue-700">
            User mendapatkan <strong>+10 XP</strong> setiap kali mengembalikan buku yang dipinjam.
          </p>
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
              className="w-20 h-20 rounded-full mx-auto border-4 border-gray-400 shadow-lg"
            />
            <div className="bg-gray-400 text-white rounded-t-lg mt-2 px-6 py-6">
              <p className="font-bold text-xl">2</p>
            </div>
            <p className="text-sm font-medium text-gray-900 mt-2 truncate max-w-24">{leaderboard[1].name.split(' ')[0]}</p>
            <p className="text-xs text-gray-500">{leaderboard[1].xp} XP</p>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="relative">
              <img 
                src={leaderboard[0].avatar} 
                alt={leaderboard[0].name}
                className="w-24 h-24 rounded-full mx-auto border-4 border-yellow-400 shadow-xl"
              />
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
                </svg>
              </div>
            </div>
            <div className="bg-yellow-400 text-white rounded-t-lg mt-2 px-8 py-8">
              <p className="font-bold text-2xl">1</p>
            </div>
            <p className="text-sm font-medium text-gray-900 mt-2 truncate max-w-28">{leaderboard[0].name.split(' ')[0]}</p>
            <p className="text-xs text-gray-500">{leaderboard[0].xp} XP</p>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <img 
              src={leaderboard[2].avatar} 
              alt={leaderboard[2].name}
              className="w-20 h-20 rounded-full mx-auto border-4 border-amber-600 shadow-lg"
            />
            <div className="bg-amber-600 text-white rounded-t-lg mt-2 px-6 py-4">
              <p className="font-bold text-xl">3</p>
            </div>
            <p className="text-sm font-medium text-gray-900 mt-2 truncate max-w-24">{leaderboard[2].name.split(' ')[0]}</p>
            <p className="text-xs text-gray-500">{leaderboard[2].xp} XP</p>
          </div>
        </div>
      )}

      {/* Full Ranking List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Semua Ranking</h2>
        {leaderboard.map((user, index) => {
          const rank = index + 1;
          const percentage = maxXP > 0 ? (user.xp / maxXP) * 100 : 0;

          return (
            <Card 
              key={user.id} 
              className={`${getRankBg(rank)}`}
              padding="sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankStyle(rank)}`}>
                  {rank}
                </div>
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <span className="font-bold text-emerald-600 ml-4 shrink-0">
                      {user.xp} XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        rank === 1 ? 'bg-yellow-400' :
                        rank === 2 ? 'bg-gray-400' :
                        rank === 3 ? 'bg-amber-600' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-500">Belum ada data user</p>
        </div>
      )}
    </div>
  );
};

export default UserRanking;
