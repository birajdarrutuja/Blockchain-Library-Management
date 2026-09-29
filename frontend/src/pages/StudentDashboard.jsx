import { useEffect, useState } from "react";
import axios from "axios";

function StudentDashboard({ user, onLogout }) {
  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [blockchainTransactions, setBlockchainTransactions] = useState([]);

  const [loadingBlockchain, setLoadingBlockchain] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingBorrowings, setLoadingBorrowings] = useState(true);

  const [issuingBookId, setIssuingBookId] = useState(null);

  // =====================================================
  // FETCH ALL BOOKS
  // =====================================================

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/books"
      );

      setBooks(response.data.books || []);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setLoadingBooks(false);
    }
  };

  // =====================================================
  // FETCH STUDENT BORROWINGS
  // =====================================================

  const fetchBorrowings = async () => {
    if (!user?.id) {
      setLoadingBorrowings(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/borrowings/user/${user.id}`
      );

      setBorrowings(response.data.borrowings || []);
    } catch (error) {
      console.error("Failed to fetch borrowings:", error);
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
        response.data.transactions ||
          response.data.history ||
          []
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
  }, [user]);

  // =====================================================
  // ISSUE BOOK
  // =====================================================

  const handleIssueBook = async (bookId) => {
    if (!user?.id) {
      alert("Student information not found.");
      return;
    }

    const dueDate = window.prompt(
      "Enter due date (YYYY-MM-DD):",
      "2026-09-20"
    );

    if (!dueDate) {
      return;
    }

    setIssuingBookId(bookId);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/borrowings/issue",
        {
          user_id: user.id,
          book_id: bookId,
          due_date: dueDate,
        }
      );

      alert(response.data.message);

      // Refresh books and borrowings
      await fetchBooks();
      await fetchBorrowings();

      // Refresh blockchain records
      await fetchBlockchainTransactions();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to issue book."
      );
    } finally {
      setIssuingBookId(null);
    }
  };

  // =====================================================
  // CALCULATE TOTAL FINE
  // =====================================================

  const totalFine = borrowings.reduce(
    (total, borrowing) =>
      total + Number(borrowing.fine || 0),
    0
  );

  // =====================================================
  // CURRENTLY ISSUED BOOKS
  // =====================================================

  const currentlyIssued = borrowings.filter(
    (borrowing) => borrowing.status === "issued"
  );

  // =====================================================
  // STUDENT BLOCKCHAIN TRANSACTIONS
  // =====================================================

  const studentBlockchainTransactions =
    blockchainTransactions.filter((tx) =>
      borrowings.some(
        (borrowing) =>
          Number(borrowing.id) ===
          Number(tx.borrowing_id)
      )
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div style={styles.page}>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav style={styles.navbar}>
        <div style={styles.logo}>
          📚 Library Management System
        </div>

        <button
          onClick={onLogout}
          style={styles.logoutButton}
        >
          Logout
        </button>
      </nav>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main style={styles.container}>

        {/* =================================================
            WELCOME
        ================================================= */}

        <div style={styles.welcomeCard}>
          <h1>
            Welcome, {user?.name} 👋
          </h1>

          <p style={styles.welcomeText}>
            Manage your books and borrowing activities
            from here.
          </p>
        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div style={styles.summaryGrid}>

          {/* Available Books */}

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              📖
            </div>

            <div>
              <h3>Available Books</h3>

              <p style={styles.summaryNumber}>
                {
                  books.filter(
                    (book) =>
                      Number(book.available_quantity) > 0
                  ).length
                }
              </p>
            </div>
          </div>

          {/* My Borrowings */}

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              📚
            </div>

            <div>
              <h3>My Borrowings</h3>

              <p style={styles.summaryNumber}>
                {currentlyIssued.length}
              </p>
            </div>
          </div>

          {/* My Fine */}

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              💰
            </div>

            <div>
              <h3>My Fine</h3>

              <p style={styles.summaryNumber}>
                ₹{totalFine}
              </p>
            </div>
          </div>

          {/* Blockchain */}

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              🔗
            </div>

            <div>
              <h3>Blockchain</h3>

              <p style={styles.summaryStatus}>
                {loadingBlockchain
                  ? "Checking..."
                  : `${studentBlockchainTransactions.length} Records`}
              </p>
            </div>
          </div>

        </div>

        {/* =================================================
            AVAILABLE BOOKS
        ================================================= */}

        <div style={styles.section}>

          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              📚 Available Books
            </h2>
          </div>

          {loadingBooks ? (
            <p style={styles.loading}>
              Loading books...
            </p>
          ) : books.filter(
              (book) =>
                Number(book.available_quantity) > 0
            ).length === 0 ? (
            <p style={styles.noBooks}>
              No books are currently available.
            </p>
          ) : (
            <div style={styles.bookGrid}>

              {books
                .filter(
                  (book) =>
                    Number(book.available_quantity) > 0
                )
                .map((book) => (

                  <div
                    key={book.id}
                    style={styles.bookCard}
                  >

                    <div style={styles.bookIcon}>
                      📖
                    </div>

                    <h3 style={styles.bookTitle}>
                      {book.title}
                    </h3>

                    <p style={styles.bookInfo}>
                      <strong>Author:</strong>{" "}
                      {book.author}
                    </p>

                    <p style={styles.bookInfo}>
                      <strong>Category:</strong>{" "}
                      {book.category || "General"}
                    </p>

                    <p style={styles.bookInfo}>
                      <strong>Available:</strong>{" "}
                      {book.available_quantity}
                    </p>

                    <button
                      style={styles.issueButton}
                      onClick={() =>
                        handleIssueBook(book.id)
                      }
                      disabled={
                        issuingBookId === book.id
                      }
                    >
                      {issuingBookId === book.id
                        ? "Issuing..."
                        : "Issue Book"}
                    </button>

                  </div>
                ))}
            </div>
          )}

        </div>

        {/* =================================================
            MY BORROWINGS
        ================================================= */}

        <div style={styles.section}>

          <h2 style={styles.sectionTitle}>
            📚 My Borrowings
          </h2>

          {loadingBorrowings ? (
            <p style={styles.loading}>
              Loading borrowing records...
            </p>
          ) : borrowings.length === 0 ? (

            <div style={styles.emptyBox}>

              <div style={styles.emptyIcon}>
                📚
              </div>

              <h3>
                No borrowing records
              </h3>

              <p style={styles.emptyText}>
                You have not borrowed any books yet.
              </p>

            </div>

          ) : (

            <div style={styles.tableWrapper}>

              <table style={styles.table}>

                <thead>
                  <tr>

                    <th style={styles.th}>
                      Book
                    </th>

                    <th style={styles.th}>
                      Author
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

                  </tr>
                </thead>

                <tbody>

                  {borrowings.map(
                    (borrowing) => (

                      <tr
                        key={borrowing.id}
                      >

                        <td style={styles.td}>
                          <strong>
                            {borrowing.book_title}
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {borrowing.author}
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

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* =================================================
            BLOCKCHAIN SECTION
        ================================================= */}

        <div style={styles.blockchainCard}>

          <div style={styles.blockchainIcon}>
            🔗
          </div>

          <div style={{ width: "100%" }}>

            <h2 style={{ marginBottom: "10px" }}>
              Blockchain Transaction History
            </h2>

            {loadingBlockchain ? (

              <p style={styles.blockchainText}>
                Loading blockchain records...
              </p>

            ) : studentBlockchainTransactions.length ===
              0 ? (

              <p style={styles.blockchainText}>
                No blockchain transactions found for
                your borrowing records.
              </p>

            ) : (

              <div style={styles.blockchainTableWrapper}>

                <table
                  style={styles.blockchainTable}
                >

                  <thead>

                    <tr>

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
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {studentBlockchainTransactions.map(
                      (tx) => {

                        const borrowing =
                          borrowings.find(
                            (borrowing) =>
                              Number(
                                borrowing.id
                              ) ===
                              Number(
                                tx.borrowing_id
                              )
                          );

                        return (

                          <tr key={tx.id}>

                            <td
                              style={
                                styles.blockchainTd
                              }
                            >
                              <strong>
                                {borrowing?.book_title ||
                                  "Book"}
                              </strong>
                            </td>

                            <td
                              style={
                                styles.blockchainTd
                              }
                            >

                              <span
                                style={
                                  tx.transaction_type ===
                                  "ISSUE"
                                    ? styles.issueBlockchainBadge
                                    : styles.returnBlockchainBadge
                                }
                              >
                                {tx.transaction_type}
                              </span>

                            </td>

                            <td
                              style={
                                styles.blockchainTd
                              }
                            >
                              {tx.block_number || "-"}
                            </td>

                            <td
                              style={
                                styles.blockchainTd
                              }
                            >

                              <span
                                title={
                                  tx.transaction_hash
                                }
                                style={
                                  styles.hashText
                                }
                              >
                                {tx.transaction_hash
                                  ? `${tx.transaction_hash.slice(
                                      0,
                                      10
                                    )}...${tx.transaction_hash.slice(
                                      -8
                                    )}`
                                  : "-"}
                              </span>

                            </td>

                            <td
                              style={
                                styles.blockchainTd
                              }
                            >

                              <span
                                style={
                                  styles.verifiedBadge
                                }
                              >
                                ✓ Recorded
                              </span>

                            </td>

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

            <p style={styles.blockchainText}>
              Your ISSUE and RETURN activities are
              recorded on the local blockchain.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(date) {
  if (!date) {
    return "-";
  }

  const formattedDate =
    new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );

  return formattedDate;
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
    maxWidth: "1400px",
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

  summaryStatus: {
    color: "#f59e0b",
    fontWeight: "bold",
    marginTop: "5px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  section: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.08)",
    marginBottom: "30px",
  },

  sectionTitle: {
    color: "#0f172a",
    marginBottom: "20px",
  },

  loading: {
    textAlign: "center",
    padding: "30px",
    color: "#64748b",
  },

  noBooks: {
    textAlign: "center",
    padding: "30px",
    color: "#64748b",
  },

  bookGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },

  bookCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    background: "#f8fafc",
  },

  bookIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  bookTitle: {
    color: "#0f172a",
    marginBottom: "12px",
  },

  bookInfo: {
    marginBottom: "8px",
    color: "#475569",
    fontSize: "14px",
  },

  issueButton: {
    width: "100%",
    marginTop: "12px",
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "11px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  emptyBox: {
    textAlign: "center",
    padding: "40px",
    border:
      "1px dashed #cbd5e1",
    borderRadius: "10px",
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "10px",
  },

  emptyText: {
    marginTop: "8px",
    color: "#64748b",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
  },

  th: {
    background: "#f8fafc",
    color: "#334155",
    padding: "14px",
    textAlign: "left",
    borderBottom:
      "2px solid #e2e8f0",
    fontSize: "14px",
  },

  td: {
    padding: "14px",
    borderBottom:
      "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "14px",
  },

  issuedBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "bold",
    fontSize: "12px",
    textTransform: "capitalize",
  },

  returnedBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#dcfce7",
    color: "#15803d",
    fontWeight: "bold",
    fontSize: "12px",
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

  blockchainCard: {
    background: "#0f172a",
    color: "white",
    padding: "30px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    overflow: "hidden",
  },

  blockchainIcon: {
    fontSize: "45px",
  },

  blockchainText: {
    marginTop: "15px",
    color: "#cbd5e1",
  },

  blockchainTableWrapper: {
    overflowX: "auto",
    width: "100%",
  },

  blockchainTable: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "750px",
    marginTop: "15px",
  },

  blockchainTh: {
    background: "#1e293b",
    color: "#e2e8f0",
    padding: "13px",
    textAlign: "left",
    borderBottom:
      "1px solid #334155",
    fontSize: "13px",
  },

  blockchainTd: {
    padding: "13px",
    borderBottom:
      "1px solid #334155",
    color: "#e2e8f0",
    fontSize: "13px",
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

  verifiedBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#14532d",
    color: "#86efac",
    fontWeight: "bold",
    fontSize: "11px",
  },

  hashText: {
    fontFamily: "monospace",
    color: "#93c5fd",
    fontSize: "12px",
    cursor: "pointer",
  },
};

export default StudentDashboard;