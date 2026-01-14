// Mock data untuk peminjaman

export const loans = [
  {
    id: 1,
    oderId: 2,
    bookId: 1,
    borrowDate: "2026-01-05",
    dueDate: "2026-01-12",
    returnDate: null,
    extensionCount: 0,
    status: "active"
  },
  {
    id: 2,
    userId: 2,
    bookId: 5,
    borrowDate: "2025-12-20",
    dueDate: "2025-12-27",
    returnDate: "2025-12-26",
    extensionCount: 0,
    status: "returned"
  },
  {
    id: 3,
    userId: 3,
    bookId: 7,
    borrowDate: "2026-01-02",
    dueDate: "2026-01-09",
    returnDate: null,
    extensionCount: 1,
    status: "active"
  },
  {
    id: 4,
    userId: 4,
    bookId: 3,
    borrowDate: "2025-12-25",
    dueDate: "2026-01-01",
    returnDate: null,
    extensionCount: 0,
    status: "overdue"
  },
  {
    id: 5,
    userId: 5,
    bookId: 2,
    borrowDate: "2025-12-15",
    dueDate: "2025-12-22",
    returnDate: "2025-12-21",
    extensionCount: 0,
    status: "returned"
  },
  {
    id: 6,
    userId: 3,
    bookId: 9,
    borrowDate: "2025-11-10",
    dueDate: "2025-11-17",
    returnDate: "2025-11-16",
    extensionCount: 0,
    status: "returned"
  },
  {
    id: 7,
    userId: 6,
    bookId: 4,
    borrowDate: "2026-01-08",
    dueDate: "2026-01-15",
    returnDate: null,
    extensionCount: 0,
    status: "active"
  },
  {
    id: 8,
    userId: 7,
    bookId: 8,
    borrowDate: "2025-12-28",
    dueDate: "2026-01-04",
    returnDate: null,
    extensionCount: 2,
    status: "active"
  },
  {
    id: 9,
    userId: 5,
    bookId: 10,
    borrowDate: "2026-01-10",
    dueDate: "2026-01-17",
    returnDate: null,
    extensionCount: 0,
    status: "active"
  },
  {
    id: 10,
    userId: 8,
    bookId: 12,
    borrowDate: "2025-12-30",
    dueDate: "2026-01-06",
    returnDate: null,
    extensionCount: 0,
    status: "overdue"
  }
];

export default loans;
