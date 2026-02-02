// Popular Books Page (Admin)

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';

const PopularBooks = () => {
  const { getPopularBooks } = useAuth();
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await getPopularBooks();
        // Data already sorted by popularity from API
        setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Gagal memuat data buku');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [getPopularBooks]);

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
  const maxBorrowed = books.length > 0 ? (books[0].borrowed || 1) : 1;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
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
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Buku Terpopuler</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Ranking buku berdasarkan jumlah peminjaman</p>
      </div>

      {/* Book Rankings */}
      <div className="space-y-3">
        {books.length > 0 ? books.map((book, index) => {
          const rank = index + 1;
          const progress = maxBorrowed > 0 ? ((book.borrowed || 0) / maxBorrowed) * 100 : 0;
          
          return (
            <Card key={book.id} className={`${getRankBg(rank)} hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Rank Badge */}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base shrink-0 ${getRankStyle(rank)}`}>
                  {rank}
                </div>

                {/* Book Cover */}
                <img
                  src={book.cover || '/placeholder-book.png'}
                  alt={book.title}
                  className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded shadow shrink-0"
                  onError={(e) => { e.target.src = '/placeholder-book.png'; }}
                />

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{book.title}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{book.author}</p>
                  <div className="mt-1.5 sm:mt-2 hidden sm:block">
                    <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Borrowed Count */}
                <div className="text-right shrink-0">
                  <p className="text-lg sm:text-2xl font-bold text-emerald-600">{book.borrowed || 0}</p>
                  <p className="text-xs text-gray-500">dipinjam</p>
                </div>
              </div>
            </Card>
          );
        }) : (
          <Card className="p-8 text-center text-gray-500">
            Tidak ada data buku
          </Card>
        )}
      </div>
    </div>
  );
};

export default PopularBooks;
