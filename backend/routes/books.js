const express = require("express");
const db = require("../db");

const router = express.Router();

// ========================================
// GET ALL BOOKS
// ========================================
router.get("/", (req, res) => {

    const sql = "SELECT * FROM books ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch books."
            });
        }

        res.json({
            success: true,
            books: results
        });
    });
});


// ========================================
// GET SINGLE BOOK
// ========================================
router.get("/:id", (req, res) => {

    const bookId = req.params.id;

    const sql = "SELECT * FROM books WHERE id = ?";

    db.query(sql, [bookId], (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch book."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Book not found."
            });
        }

        res.json({
            success: true,
            book: results[0]
        });
    });
});


// ========================================
// ADD NEW BOOK
// ========================================
router.post("/", (req, res) => {

    const {
        title,
        author,
        isbn,
        category,
        quantity
    } = req.body;

    if (!title || !author || quantity === undefined) {

        return res.status(400).json({
            success: false,
            message: "Title, author and quantity are required."
        });
    }

    const sql = `
        INSERT INTO books
        (title, author, isbn, category, quantity, available_quantity)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            title,
            author,
            isbn || null,
            category || null,
            quantity,
            quantity
        ],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to add book."
                });
            }

            res.status(201).json({
                success: true,
                message: "Book added successfully!",
                bookId: result.insertId
            });
        }
    );
});


// ========================================
// UPDATE BOOK
// ========================================
router.put("/:id", (req, res) => {

    const bookId = req.params.id;

    const {
        title,
        author,
        isbn,
        category,
        quantity
    } = req.body;

    if (!title || !author || quantity === undefined) {

        return res.status(400).json({
            success: false,
            message: "Title, author and quantity are required."
        });
    }

    // First get the existing book
    db.query(
        "SELECT quantity, available_quantity FROM books WHERE id = ?",
        [bookId],
        (err, results) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (results.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Book not found."
                });
            }

            const oldQuantity = results[0].quantity;
            const oldAvailable = results[0].available_quantity;

            // Calculate how many books are currently borrowed
            const borrowed = oldQuantity - oldAvailable;

            // New available quantity
            const newAvailable = Math.max(
                0,
                quantity - borrowed
            );

            const updateSql = `
                UPDATE books
                SET title = ?,
                    author = ?,
                    isbn = ?,
                    category = ?,
                    quantity = ?,
                    available_quantity = ?
                WHERE id = ?
            `;

            db.query(
                updateSql,
                [
                    title,
                    author,
                    isbn || null,
                    category || null,
                    quantity,
                    newAvailable,
                    bookId
                ],
                (err) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message: "Failed to update book."
                        });
                    }

                    res.json({
                        success: true,
                        message: "Book updated successfully!"
                    });
                }
            );
        }
    );
});


// ========================================
// DELETE BOOK
// ========================================
router.delete("/:id", (req, res) => {

    const bookId = req.params.id;

    const sql = "DELETE FROM books WHERE id = ?";

    db.query(sql, [bookId], (err, result) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Cannot delete this book. It may have borrowing records."
            });
        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Book not found."
            });
        }

        res.json({
            success: true,
            message: "Book deleted successfully!"
        });
    });
});


module.exports = router;