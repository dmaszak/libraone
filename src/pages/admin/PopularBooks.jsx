// Popular Books Page (Admin)

import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';

const PopularBooks = () => {
  const { books } = useAuth();

  // Sort books by borrowed count
  const sortedBooks = [...books].sort((a, b) => b.borrowed - a.borrowed);

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

  // Calculate max borrowed for progress bar
  const maxBorrowed = sortedBooks.length > 0 ? sortedBooks[0].borrowed : 1;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buku Terpopuler</h1>
        <p className="text-gray-600 mt-1">Ranking buku berdasarkan jumlah peminjaman</p>
      </div>

      {/* Top 3 Podium */}
      {sortedBooks.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2nd Place */}
          <div className="text-center">
            <img 
              src={sortedBooks[1].cover} 
              alt={sortedBooks[1].title}
              className="w-24 h-32 object-cover rounded-lg mx-auto border-4 border-gray-400 shadow-lg"
            />
            <div className="bg-gray-400 text-white rounded-t-lg mt-2 px-6 py-6">
              <p className="font-bold text-xl">2</p>
            </div>
            <p className="text-sm font-medium text-gray-900 mt-2 truncate max-w-24">{sortedBooks[1].title}</p>
            <p className="text-xs text-gray-500">{sortedBooks[1].borrowed}x dipinjam</p>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="relative">
              <img 
                src={sortedBooks[0].cover} 
                alt={sortedBooks[0].title}
                className="w-28 h-36 object-cover rounded-lg mx-auto border-4 border-yellow-400 shadow-xl"
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
            <p className="text-sm font-medium text-gray-900 mt-2 truncate max-w-28">{sortedBooks[0].title}</p>
            <p className="text-xs text-gray-500">{sortedBooks[0].borrowed}x dipinjam</p>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <img 
              src={sortedBooks[2].cover} 
              alt={sortedBooks[2].title}
              className="w-24 h-32 object-cover rounded-lg mx-auto border-4 border-amber-600 shadow-lg"
            />
            <div className="bg-amber-600 text-white rounded-t-lg mt-2 px-6 py-4">
              <p className="font-bold text-xl">3</p>
            </div>
            <p className="text-sm font-medium text-gray-900 mt-2 truncate max-w-24">{sortedBooks[2].title}</p>
            <p className="text-xs text-gray-500">{sortedBooks[2].borrowed}x dipinjam</p>
          </div>
        </div>
      )}

      {/* Full Ranking List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Semua Ranking</h2>
        {sortedBooks.map((book, index) => {
          const rank = index + 1;
          const percentage = (book.borrowed / maxBorrowed) * 100;

          return (
            <Card 
              key={book.id} 
              className={`${getRankBg(rank)}`}
              padding="sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankStyle(rank)}`}>
                  {rank}
                </div>
                <img 
                  src={book.cover} 
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{book.title}</p>
                      <p className="text-sm text-gray-500 truncate">{book.author}</p>
                    </div>
                    <span className="font-bold text-emerald-600 ml-4 shrink-0">
                      {book.borrowed}x
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

      {sortedBooks.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500">Belum ada data buku</p>
        </div>
      )}
    </div>
  );
};

export default PopularBooks;
