// Book List Page

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import { CATEGORIES } from '../../utils/constants';
import { truncateText } from '../../utils/helpers';

const BookList = () => {
  const { books, getPopularBooks } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const popularBooks = getPopularBooks(5);

  // Filter books
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Buku</h1>
        <p className="text-gray-600 mt-1">Temukan buku favoritmu dan mulai membaca</p>
      </div>

      {/* Popular Books Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Buku Terpopuler
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {popularBooks.map((book) => (
            <Link key={book.id} to={`/books/${book.id}`} className="shrink-0">
              <div className="w-40 group">
                <div className="relative overflow-hidden rounded-lg shadow-md">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-40 h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Populer
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mt-2 text-sm truncate">{book.title}</h3>
                <p className="text-xs text-gray-500 truncate">{book.author}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari judul atau penulis..."
          className="flex-1"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        Menampilkan {filteredBooks.length} buku
      </p>

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBooks.map((book) => (
            <Link key={book.id} to={`/books/${book.id}`}>
              <Card hover padding="sm" className="h-full">
                <div className="relative">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {book.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium text-sm">Tidak Tersedia</span>
                    </div>
                  )}
                  <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                    {book.category}
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{book.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{book.author}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${book.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      Stok: {book.stock}
                    </span>
                    <span className="text-xs text-gray-400">
                      {book.borrowed}x dipinjam
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">Tidak ada buku yang ditemukan</p>
          <p className="text-sm text-gray-400 mt-1">Coba kata kunci atau kategori lain</p>
        </div>
      )}
    </div>
  );
};

export default BookList;
