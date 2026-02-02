// Manage Books Page (Admin)

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import { CATEGORIES } from '../../utils/constants';

const ManageBooks = () => {
  const { getBooks, addBook, updateBook, deleteBook } = useAuth();
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  const initialFormData = {
    idBuku: '',
    title: '',
    author: '',
    publisher: '',
    year: new Date().getFullYear(),
    category: 'Pendidikan',
    cover: '',
    synopsis: '',
    pages: 0
  };

  const [formData, setFormData] = useState(initialFormData);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await getBooks();
        setBooks(data);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Gagal memuat data buku');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [getBooks]);

  // Refresh books
  const refreshBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      console.error('Error refreshing books:', err);
    }
  };

  // Filter books
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' || name === 'pages' ? parseInt(value) || 0 : value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'File harus berupa gambar (JPG, PNG, dll)' });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' });
        return;
      }
      setCoverFile(file);
      // Create preview URL
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const clearCoverFile = () => {
    setCoverFile(null);
    setCoverPreview('');
  };

  const openAddModal = () => {
    setEditingBook(null);
    setFormData(initialFormData);
    setCoverFile(null);
    setCoverPreview('');
    setMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setCoverFile(null);
    // Show existing cover as preview
    if (book.cover && book.cover !== 'default.jpg') {
      setCoverPreview(`https://backend-libraone.vercel.app/uploads/${book.cover}`);
    } else {
      setCoverPreview('');
    }
    setFormData({
      idBuku: book.idBuku || '',
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      year: book.year || new Date().getFullYear(),
      category: book.category,
      cover: book.cover || '',
      synopsis: book.synopsis || '',
      pages: book.pages || 0
    });
    setMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const openDeleteModal = (book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.title || !formData.author) {
      setMessage({ type: 'error', text: 'Mohon lengkapi judul dan penulis' });
      setActionLoading(false);
      return;
    }

    // Generate id_buku if not provided (for new books)
    const generatedIdBuku = formData.idBuku || `buku${Date.now()}`;

    // Format tahun_terbit as date string (YYYY-01-01)
    const tahunTerbit = `${formData.year}-01-01`;

    // Map form data to API format
    const bookData = {
      id_buku: generatedIdBuku,
      judul: formData.title,
      pengarang: formData.author,
      penerbit: formData.publisher || '-',
      tahun_terbit: tahunTerbit,
      kategori: formData.category.toLowerCase(),
      cover: formData.cover || 'default.jpg',
      buku_deskripsi: formData.synopsis || '-',
      jumlah_halaman: parseInt(formData.pages) || 100
    };

    try {
      if (editingBook) {
        // Update book
        const result = await updateBook(editingBook.id, bookData, coverFile);
        if (result.success) {
          setMessage({ type: 'success', text: 'Buku berhasil diperbarui!' });
          setTimeout(async () => {
            setShowModal(false);
            setMessage({ type: '', text: '' });
            setCoverFile(null);
            setCoverPreview('');
            await refreshBooks();
          }, 1500);
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } else {
        // Add new book
        const result = await addBook(bookData, coverFile);
        if (result.success) {
          setMessage({ type: 'success', text: 'Buku berhasil ditambahkan!' });
          setTimeout(async () => {
            setShowModal(false);
            setFormData(initialFormData);
            setMessage({ type: '', text: '' });
            await refreshBooks();
          }, 1500);
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    }

    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (bookToDelete) {
      setActionLoading(true);
      try {
        const result = await deleteBook(bookToDelete.idBuku);
        if (result.success) {
          setShowDeleteModal(false);
          setBookToDelete(null);
          await refreshBooks();
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Buku</h1>
          <p className="text-gray-600 mt-1">Tambah, edit, atau hapus data buku</p>
        </div>
        <Button onClick={openAddModal}>
          <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Buku
        </Button>
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
        Menampilkan {filteredBooks.length} dari {books.length} buku
      </p>

      {/* Books Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buku
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Kategori
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Tahun
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Dipinjam
                </th>
                <th className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBooks.length > 0 ? filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          book.cover
                            ? book.cover.startsWith('http')
                              ? book.cover
                              : book.cover !== 'default.jpg'
                                ? `https://backend-libraone.vercel.app/uploads/${book.cover}`
                                : '/placeholder-book.png'
                            : '/placeholder-book.png'
                        }
                        alt={book.title}
                        className="w-8 h-12 sm:w-10 sm:h-14 object-cover rounded shrink-0"
                        onError={(e) => { e.target.src = '/placeholder-book.png'; }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm max-w-80px sm:max-w-xs">{book.title}</p>
                        <p className="text-xs text-gray-500 truncate hidden sm:block">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      {book.category}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-600 hidden md:table-cell">
                    {book.year || '-'}
                  </td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-600 hidden lg:table-cell">
                    {book.borrowed || 0}x
                  </td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(book)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openDeleteModal(book)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Tidak ada buku ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => !actionLoading && setShowModal(false)}>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {editingBook ? 'Edit Buku' : 'Tambah Buku Baru'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingBook && (
            <Input
              label="ID Buku (opsional)"
              name="idBuku"
              value={formData.idBuku}
              onChange={handleChange}
              placeholder="Contoh: buku001 (kosongkan untuk auto-generate)"
            />
          )}
          <Input
            label="Judul Buku *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Masukkan judul buku"
            required
          />
          <Input
            label="Penulis *"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Masukkan nama penulis"
            required
          />
          <Input
            label="Penerbit"
            name="publisher"
            value={formData.publisher}
            onChange={handleChange}
            placeholder="Masukkan nama penerbit"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tahun Terbit"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.filter(c => c !== 'Semua').map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Jumlah Halaman"
            name="pages"
            type="number"
            value={formData.pages}
            onChange={handleChange}
          />
          
          {/* Cover Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Buku</label>
            
            {/* Preview */}
            {coverPreview && (
              <div className="relative mb-3 inline-block">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-32 h-44 object-cover rounded-lg border border-gray-200 shadow-sm"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/128x176?text=No+Cover';
                  }}
                />
                <button
                  type="button"
                  onClick={clearCoverFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                  title="Hapus cover"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* File Input */}
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {coverFile ? coverFile.name : 'Pilih file gambar...'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Format: JPG, PNG, WebP. Maksimal 5MB
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sinopsis</label>
            <textarea
              name="synopsis"
              value={formData.synopsis}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Masukkan sinopsis buku..."
            />
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="flex-1"
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={actionLoading}>
              {actionLoading ? 'Menyimpan...' : editingBook ? 'Simpan Perubahan' : 'Tambah Buku'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => !actionLoading && setShowDeleteModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Buku?</h3>
          <p className="text-gray-600 mb-4">
            Apakah kamu yakin ingin menghapus buku <strong>"{bookToDelete?.title}"</strong>?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
              disabled={actionLoading}
            >
              Batal
            </Button>
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageBooks;
