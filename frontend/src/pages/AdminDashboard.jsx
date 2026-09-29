import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard({ user, onLogout }) {
  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [blockchainTransactions, setBlockchainTransactions] = useState([]);

  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingBorrowings, setLoadingBorrowings] = useState(true);
  const [loadingBlockchain, setLoadingBlockchain] = useState(true);

  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    quantity: "",
  });

  // =====================================================
  // FETCH BOOKS
  // =====================================================
  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/books"
      );

      setBooks(response.data.books);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setLoadingBooks(false);
    }
  };

  // =====================================================
  // FETCH BORROWINGS
  // =====================================================
  const fetchBorrowings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/borrowings"
      );

      setBorrowings(response.data.borrowings);
    } catch (error) {
      console.error(
        "Failed to fetch borrowings:",
        error
      );
    } finally {
      setLoadingBorrowings(false);
    }
  };

  // =====================================================
  // FETCH BLOCKCHAIN TRANSACTIONS
  // =====================================================
  const fetchBlockchainTransactions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/borrowings/blockchain/history"
      );

      setBlockchainTransactions(
        response.data.transactions || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch blockchain transactions:",
        error
      );
    } finally {
      setLoadingBlockchain(false);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================
  useEffect(() => {
    fetchBooks();
    fetchBorrowings();
    fetchBlockchainTransactions();
  }, []);

  // =====================================================
  // HANDLE FORM INPUT
  // =====================================================
  const handleInputChange = (e) => {
    setBookForm({
      ...bookForm,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // ADD / UPDATE BOOK
  // =====================================================
  const handleBookSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBook) {
        await axios.put(
          `http://localhost:5000/api/books/${editingBook.id}`,
          {
            ...bookForm,
            quantity: Number(bookForm.quantity),
          }
        );

        alert("Book updated successfully!");
      } else {
        await axios.post(
          "http://localhost:5000/api/books",
          {
            ...bookForm,
            quantity: Number(bookForm.quantity),
          }
        );

        alert("Book added successfully!");
      }

      setBookForm({
        title: "",
        author: "",
        isbn: "",
        category: "",
        quantity: "",
      });

      setEditingBook(null);
      setShowBookForm(false);

      fetchBooks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Operation failed."
      );
    }
  };

  // =====================================================
  // EDIT BOOK
  // =====================================================
  const handleEdit = (book) => {
    setEditingBook(book);

    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || "",
      category: book.category || "",
      quantity: book.quantity,
    });

    setShowBookForm(true);
  };

  // =====================================================
  // DELETE BOOK
  // =====================================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/books/${id}`
      );

      alert(response.data.message);

      fetchBooks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete book."
      );
    }
  };

  // =====================================================
  // RETURN BOOK
  // =====================================================
  const handleReturnBook = async (borrowingId) => {
    const confirmReturn = window.confirm(
      "Are you sure you want to mark this book as returned?"
    );

    if (!confirmReturn) {
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/borrowings/return/${borrowingId}`
      );

      alert(
        `${response.data.message}\nFine: ₹${response.data.fine}`
      );

      // Refresh all related sections
      await fetchBorrowings();
      await fetchBooks();
      await fetchBlockchainTransactions();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to return book."
      );
    }
  };

  // =====================================================
  // CANCEL FORM
  // =====================================================
  const handleCancel = () => {
    setShowBookForm(false);
    setEditingBook(null);

    setBookForm({
      title: "",
      author: "",
      isbn: "",
      category: "",
      quantity: "",
    });
  };

  // =====================================================
  // SUMMARY VALUES
  // =====================================================
  const totalBooks = books.reduce(
    (total, book) =>
      total + Number(book.quantity || 0),
    0
  );

  const availableBooks = books.reduce(
    (total, book) =>
      total +
      Number(book.available_quantity || 0),
    0
  );

  const issuedBooks = borrowings.filter(
    (borrowing) =>
      borrowing.status === "issued"
  ).length;

  const totalFine = borrowings.reduce(
    (total, borrowing) =>
      total + Number(borrowing.fine || 0),
    0
  );

  // =====================================================
  // BLOCKCHAIN TRANSACTION SHORT HASH
  // =====================================================
  const shortenHash = (hash) => {
    if (!hash) {
      return "-";
    }

    if (hash.length <= 18) {
      return hash;
    }

    return `${hash.substring(0, 10)}...${hash.substring(
      hash.length - 8
    )}`;
  };

  // =====================================================
  // BLOCKCHAIN TRANSACTION TYPE STYLE
  // =====================================================
  const getTransactionBadgeStyle = (type) => {
    if (type === "ISSUE") {
      return styles.issueBlockchainBadge;
    }

    if (type === "RETURN") {
      return styles.returnBlockchainBadge;
    }

    return styles.defaultBlockchainBadge;
  };

  return (
    <div style={styles.page}>

      {/* =================================================
          NAVBAR
      ================================================= */}
      <nav style={styles.navbar}>

        <div style={styles.logo}>
          📚 Library Management System
        </div>

        <div style={styles.navRight}>

          <span style={styles.adminText}>
            Admin: {user?.name}
          </span>

          <button
            onClick={onLogout}
            style={styles.logoutButton}
          >
            Logout
          </button>

        </div>

      </nav>


      <main style={styles.container}>

        {/* =================================================
            WELCOME
        ================================================= */}
        <div style={styles.welcomeCard}>

          <h1>
            Welcome, {user?.name} 👋
          </h1>

          <p style={styles.welcomeText}>
            Manage books and student borrowing
            activities from the admin dashboard.
          </p>

        </div>


        {/* =================================================
            SUMMARY CARDS
        ================================================= */}
        <div style={styles.summaryGrid}>

          <div style={styles.summaryCard}>

            <div style={styles.summaryIcon}>
              📚
            </div>

            <div>
              <h3>Total Books</h3>

              <p style={styles.summaryNumber}>
                {totalBooks}
              </p>
            </div>

          </div>


          <div style={styles.summaryCard}>

            <div style={styles.summaryIcon}>
              📖
            </div>

            <div>
              <h3>Available</h3>

              <p style={styles.summaryNumber}>
                {availableBooks}
              </p>
            </div>

          </div>


          <div style={styles.summaryCard}>

            <div style={styles.summaryIcon}>
              📋
            </div>

            <div>
              <h3>Issued Books</h3>

              <p style={styles.summaryNumber}>
                {issuedBooks}
              </p>
            </div>

          </div>


          <div style={styles.summaryCard}>

            <div style={styles.summaryIcon}>
              💰
            </div>

            <div>
              <h3>Total Fine</h3>

              <p style={styles.fineNumber}>
                ₹{totalFine}
              </p>
            </div>

          </div>

        </div>


        {/* =================================================
            BOOK MANAGEMENT
        ================================================= */}
        <div style={styles.section}>

          <div style={styles.sectionHeader}>

            <h2 style={styles.sectionTitle}>
              📚 Book Management
            </h2>

            <button
              style={styles.addButton}
              onClick={() => {
                setEditingBook(null);
                setShowBookForm(true);
              }}
            >
              + Add Book
            </button>

          </div>


          {/* BOOK FORM */}
          {showBookForm && (

            <div style={styles.formCard}>

              <h3 style={styles.formTitle}>
                {editingBook
                  ? "Edit Book"
                  : "Add New Book"}
              </h3>

              <form onSubmit={handleBookSubmit}>

                <div style={styles.formGrid}>

                  <div>
                    <label style={styles.label}>
                      Title
                    </label>

                    <input
                      name="title"
                      value={bookForm.title}
                      onChange={handleInputChange}
                      placeholder="Book title"
                      required
                      style={styles.input}
                    />
                  </div>


                  <div>
                    <label style={styles.label}>
                      Author
                    </label>

                    <input
                      name="author"
                      value={bookForm.author}
                      onChange={handleInputChange}
                      placeholder="Author name"
                      required
                      style={styles.input}
                    />
                  </div>


                  <div>
                    <label style={styles.label}>
                      ISBN
                    </label>

                    <input
                      name="isbn"
                      value={bookForm.isbn}
                      onChange={handleInputChange}
                      placeholder="ISBN"
                      style={styles.input}
                    />
                  </div>


                  <div>
                    <label style={styles.label}>
                      Category
                    </label>

                    <input
                      name="category"
                      value={bookForm.category}
                      onChange={handleInputChange}
                      placeholder="Category"
                      style={styles.input}
                    />
                  </div>


                  <div>
                    <label style={styles.label}>
                      Quantity
                    </label>

                    <input
                      name="quantity"
                      type="number"
                      min="1"
                      value={bookForm.quantity}
                      onChange={handleInputChange}
                      placeholder="Quantity"
                      required
                      style={styles.input}
                    />
                  </div>

                </div>


                <div style={styles.formButtons}>

                  <button
                    type="submit"
                    style={styles.saveButton}
                  >
                    {editingBook
                      ? "Update Book"
                      : "Add Book"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>

          )}


          {/* BOOK TABLE */}
          {loadingBooks ? (

            <p style={styles.loading}>
              Loading books...
            </p>

          ) : books.length === 0 ? (

            <p style={styles.noData}>
              No books found.
            </p>

          ) : (

            <div style={styles.tableWrapper}>

              <table style={styles.table}>

                <thead>

                  <tr>

                    <th style={styles.th}>
                      ID
                    </th>

                    <th style={styles.th}>
                      Title
                    </th>

                    <th style={styles.th}>
                      Author
                    </th>

                    <th style={styles.th}>
                      ISBN
                    </th>

                    <th style={styles.th}>
                      Category
                    </th>

                    <th style={styles.th}>
                      Total
                    </th>

                    <th style={styles.th}>
                      Available
                    </th>

                    <th style={styles.th}>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {books.map((book) => (

                    <tr key={book.id}>

                      <td style={styles.td}>
                        {book.id}
                      </td>

                      <td style={styles.td}>
                        <strong>
                          {book.title}
                        </strong>
                      </td>

                      <td style={styles.td}>
                        {book.author}
                      </td>

                      <td style={styles.td}>
                        {book.isbn || "-"}
                      </td>

                      <td style={styles.td}>
                        {book.category || "-"}
                      </td>

                      <td style={styles.td}>
                        {book.quantity}
                      </td>

                      <td style={styles.td}>
                        {book.available_quantity}
                      </td>

                      <td style={styles.td}>

                        <button
                          onClick={() =>
                            handleEdit(book)
                          }
                          style={styles.editButton}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(book.id)
                          }
                          style={styles.deleteButton}
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =================================================
            BORROWING MANAGEMENT
        ================================================= */}
        <div style={styles.section}>

          <h2 style={styles.sectionTitle}>
            📋 Borrowing Management
          </h2>


          {loadingBorrowings ? (

            <p style={styles.loading}>
              Loading borrowing records...
            </p>

          ) : borrowings.length === 0 ? (

            <p style={styles.noData}>
              No borrowing records found.
            </p>

          ) : (

            <div style={styles.tableWrapper}>

              <table style={styles.table}>

                <thead>

                  <tr>

                    <th style={styles.th}>
                      ID
                    </th>

                    <th style={styles.th}>
                      Student
                    </th>

                    <th style={styles.th}>
                      Book
                    </th>

                    <th style={styles.th}>
                      Issue Date
                    </th>

                    <th style={styles.th}>
                      Due Date
                    </th>

                    <th style={styles.th}>
                      Return Date
                    </th>

                    <th style={styles.th}>
                      Status
                    </th>

                    <th style={styles.th}>
                      Fine
                    </th>

                    <th style={styles.th}>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {borrowings.map(
                    (borrowing) => (

                      <tr
                        key={borrowing.id}
                      >

                        <td style={styles.td}>
                          {borrowing.id}
                        </td>

                        <td style={styles.td}>

                          <strong>
                            {borrowing.student_name}
                          </strong>

                          <br />

                          <small>
                            {borrowing.student_email}
                          </small>

                        </td>

                        <td style={styles.td}>

                          <strong>
                            {borrowing.book_title}
                          </strong>

                          <br />

                          <small>
                            {borrowing.author}
                          </small>

                        </td>

                        <td style={styles.td}>
                          {formatDate(
                            borrowing.issue_date
                          )}
                        </td>

                        <td style={styles.td}>
                          {formatDate(
                            borrowing.due_date
                          )}
                        </td>

                        <td style={styles.td}>

                          {borrowing.return_date
                            ? formatDate(
                                borrowing.return_date
                              )
                            : "-"}

                        </td>

                        <td style={styles.td}>

                          <span
                            style={
                              borrowing.status ===
                              "issued"
                                ? styles.issuedBadge
                                : styles.returnedBadge
                            }
                          >
                            {borrowing.status}
                          </span>

                        </td>

                        <td style={styles.td}>

                          <span
                            style={
                              Number(
                                borrowing.fine
                              ) > 0
                                ? styles.fineText
                                : styles.noFineText
                            }
                          >
                            ₹
                            {Number(
                              borrowing.fine || 0
                            )}
                          </span>

                        </td>

                        <td style={styles.td}>

                          {borrowing.status ===
                          "issued" ? (

                            <button
                              onClick={() =>
                                handleReturnBook(
                                  borrowing.id
                                )
                              }
                              style={
                                styles.returnButton
                              }
                            >
                              Return Book
                            </button>

                          ) : (

                            <span
                              style={
                                styles.completedText
                              }
                            >
                              Completed
                            </span>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =================================================
            BLOCKCHAIN TRANSACTION HISTORY
        ================================================= */}
        <div style={styles.blockchainSection}>

          <div style={styles.blockchainHeader}>

            <div>

              <h2 style={styles.blockchainTitle}>
                🔗 Blockchain Transaction History
              </h2>

              <p style={styles.blockchainDescription}>
                All book issue and return transactions
                recorded on the blockchain.
              </p>

            </div>

            <div style={styles.blockchainCount}>
              {blockchainTransactions.length} Transactions
            </div>

          </div>


          {loadingBlockchain ? (

            <p style={styles.loading}>
              Loading blockchain transactions...
            </p>

          ) : blockchainTransactions.length === 0 ? (

            <div style={styles.blockchainEmpty}>

              <div style={styles.emptyBlockchainIcon}>
                🔗
              </div>

              <h3>
                No blockchain transactions yet
              </h3>

              <p>
                Book issue and return transactions
                will appear here.
              </p>

            </div>

          ) : (

            <div style={styles.blockchainTableWrapper}>

              <table style={styles.blockchainTable}>

                <thead>

                  <tr>

                    <th style={styles.blockchainTh}>
                      ID
                    </th>

                    <th style={styles.blockchainTh}>
                      Borrowing ID
                    </th>

                    <th style={styles.blockchainTh}>
                      Student
                    </th>

                    <th style={styles.blockchainTh}>
                      Book
                    </th>

                    <th style={styles.blockchainTh}>
                      Type
                    </th>

                    <th style={styles.blockchainTh}>
                      Block
                    </th>

                    <th style={styles.blockchainTh}>
                      Transaction Hash
                    </th>

                    <th style={styles.blockchainTh}>
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {blockchainTransactions.map(
                    (transaction) => (

                      <tr key={transaction.id}>

                        <td style={styles.blockchainTd}>
                          {transaction.id}
                        </td>

                        <td style={styles.blockchainTd}>
                          {transaction.borrowing_id}
                        </td>

                        <td style={styles.blockchainTd}>
                          {transaction.student_name || "-"}
                        </td>

                        <td style={styles.blockchainTd}>
                          <strong>
                            {transaction.book_title || "-"}
                          </strong>
                        </td>

                        <td style={styles.blockchainTd}>

                          <span
                            style={getTransactionBadgeStyle(
                              transaction.transaction_type
                            )}
                          >
                            {transaction.transaction_type}
                          </span>

                        </td>

                        <td style={styles.blockchainTd}>
                          #{transaction.block_number}
                        </td>

                        <td style={styles.blockchainTd}>

                          <code style={styles.hashCode}>
                            {shortenHash(
                              transaction.transaction_hash
                            )}
                          </code>

                          <button
                            style={styles.copyButton}
                            onClick={() => {
                              navigator.clipboard.writeText(
                                transaction.transaction_hash
                              );

                              alert(
                                "Transaction hash copied!"
                              );
                            }}
                          >
                            Copy
                          </button>

                        </td>

                        <td style={styles.blockchainTd}>
                          {formatDateTime(
                            transaction.created_at
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}


// =====================================================
// DATE FORMATTER
// =====================================================
function formatDate(date) {

  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}


// =====================================================
// DATE + TIME FORMATTER
// =====================================================
function formatDateTime(date) {

  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


// =====================================================
// STYLES
// =====================================================
const styles = {

  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
  },

  navbar: {
    height: "70px",
    background: "#0f172a",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
  },

  logo: {
    fontSize: "20px",
    fontWeight: "bold",
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  adminText: {
    color: "#cbd5e1",
  },

  logoutButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  container: {
    padding: "40px",
    maxWidth: "1500px",
    margin: "0 auto",
  },

  welcomeCard: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    marginBottom: "30px",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.08)",
  },

  welcomeText: {
    marginTop: "10px",
    color: "#64748b",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  summaryCard: {
    background: "white",
    padding: "22px",
    borderRadius: "15px",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  summaryIcon: {
    fontSize: "38px",
  },

  summaryNumber: {
    fontSize: "25px",
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: "5px",
  },

  fineNumber: {
    fontSize: "25px",
    fontWeight: "bold",
    color: "#dc2626",
    marginTop: "5px",
  },

  section: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.08)",
    marginBottom: "30px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  sectionTitle: {
    color: "#0f172a",
    marginBottom: "20px",
  },

  addButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "11px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  formCard: {
    background: "#f8fafc",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "25px",
    border: "1px solid #e2e8f0",
  },

  formTitle: {
    marginBottom: "20px",
    color: "#0f172a",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "bold",
    color: "#334155",
  },

  input: {
    width: "100%",
    padding: "11px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
  },

  formButtons: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
  },

  saveButton: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "11px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  cancelButton: {
    background: "#64748b",
    color: "white",
    border: "none",
    padding: "11px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },

  th: {
    background: "#f8fafc",
    color: "#334155",
    padding: "14px",
    textAlign: "left",
    borderBottom:
      "2px solid #e2e8f0",
    fontSize: "13px",
  },

  td: {
    padding: "14px",
    borderBottom:
      "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "13px",
  },

  editButton: {
    background: "#f59e0b",
    color: "white",
    border: "none",
    padding: "7px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "7px",
    fontWeight: "bold",
  },

  deleteButton: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "7px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  returnButton: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  issuedBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "bold",
    fontSize: "11px",
    textTransform: "capitalize",
  },

  returnedBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#dcfce7",
    color: "#15803d",
    fontWeight: "bold",
    fontSize: "11px",
    textTransform: "capitalize",
  },

  fineText: {
    color: "#dc2626",
    fontWeight: "bold",
  },

  noFineText: {
    color: "#16a34a",
    fontWeight: "bold",
  },

  completedText: {
    color: "#16a34a",
    fontWeight: "bold",
    fontSize: "12px",
  },

  loading: {
    textAlign: "center",
    padding: "30px",
    color: "#64748b",
  },

  noData: {
    textAlign: "center",
    padding: "30px",
    color: "#64748b",
  },


  // =====================================================
  // BLOCKCHAIN STYLES
  // =====================================================

  blockchainSection: {
    background: "#0f172a",
    color: "white",
    padding: "30px",
    borderRadius: "15px",
    marginBottom: "30px",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.25)",
  },

  blockchainHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
  },

  blockchainTitle: {
    margin: 0,
    fontSize: "24px",
  },

  blockchainDescription: {
    marginTop: "8px",
    color: "#94a3b8",
    fontSize: "14px",
  },

  blockchainCount: {
    background: "#1e293b",
    border:
      "1px solid #334155",
    padding: "10px 16px",
    borderRadius: "20px",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  blockchainTableWrapper: {
    overflowX: "auto",
    background: "#111827",
    borderRadius: "10px",
  },

  blockchainTable: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1200px",
  },

  blockchainTh: {
    background: "#1e293b",
    color: "#cbd5e1",
    padding: "14px",
    textAlign: "left",
    borderBottom:
      "1px solid #334155",
    fontSize: "12px",
    whiteSpace: "nowrap",
  },

  blockchainTd: {
    padding: "14px",
    color: "#e2e8f0",
    borderBottom:
      "1px solid #1e293b",
    fontSize: "13px",
  },

  hashCode: {
    background: "#020617",
    color: "#93c5fd",
    padding: "6px 8px",
    borderRadius: "5px",
    fontSize: "11px",
    marginRight: "8px",
  },

  copyButton: {
    background: "#334155",
    color: "white",
    border: "none",
    padding: "5px 9px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "11px",
  },

  issueBlockchainBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#1d4ed8",
    color: "white",
    fontWeight: "bold",
    fontSize: "11px",
  },

  returnBlockchainBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#15803d",
    color: "white",
    fontWeight: "bold",
    fontSize: "11px",
  },

  defaultBlockchainBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#64748b",
    color: "white",
    fontWeight: "bold",
    fontSize: "11px",
  },

  blockchainEmpty: {
    textAlign: "center",
    padding: "50px 20px",
    background: "#111827",
    borderRadius: "10px",
    color: "#cbd5e1",
  },

  emptyBlockchainIcon: {
    fontSize: "45px",
    marginBottom: "10px",
  },
};

export default AdminDashboard;