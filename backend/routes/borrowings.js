const express = require("express");
const router = express.Router();

const db = require("../db");
const { libraryContract } = require("../blockchain");


// =====================================================
// GET ALL BORROWINGS
// =====================================================
router.get("/", (req, res) => {

    const sql = `
        SELECT
            br.id,
            br.user_id,
            u.name AS student_name,
            u.email AS student_email,
            br.book_id,
            b.title AS book_title,
            b.author,
            br.issue_date,
            br.due_date,
            br.return_date,
            br.status,
            br.fine
        FROM borrowings br
        JOIN users u ON br.user_id = u.id
        JOIN books b ON br.book_id = b.id
        ORDER BY br.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Error fetching borrowings:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch borrowings."
            });
        }

        res.json({
            success: true,
            borrowings: results
        });
    });
});


// =====================================================
// GET BORROWINGS OF ONE USER
// =====================================================
router.get("/user/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT
            br.id,
            br.user_id,
            br.book_id,
            b.title AS book_title,
            b.author,
            b.isbn,
            b.category,
            br.issue_date,
            br.due_date,
            br.return_date,
            br.status,
            br.fine
        FROM borrowings br
        JOIN books b ON br.book_id = b.id
        WHERE br.user_id = ?
        ORDER BY br.id DESC
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.error("Error fetching user borrowings:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch user borrowings."
            });
        }

        res.json({
            success: true,
            borrowings: results
        });
    });
});


// =====================================================
// ISSUE BOOK
// =====================================================
router.post("/issue", async (req, res) => {

    const { user_id, book_id, due_date } = req.body;


    // -------------------------------------------------
    // Validate input
    // -------------------------------------------------
    if (!user_id || !book_id || !due_date) {

        return res.status(400).json({
            success: false,
            message: "user_id, book_id and due_date are required."
        });
    }


    // -------------------------------------------------
    // Check book
    // -------------------------------------------------
    db.query(
        "SELECT * FROM books WHERE id = ?",
        [book_id],
        (bookErr, bookResults) => {

            if (bookErr) {

                console.error("Book check error:", bookErr);

                return res.status(500).json({
                    success: false,
                    message: "Database error while checking book."
                });
            }


            if (bookResults.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Book not found."
                });
            }


            const book = bookResults[0];


            // -------------------------------------------------
            // Check availability
            // -------------------------------------------------
            if (book.available_quantity <= 0) {

                return res.status(400).json({
                    success: false,
                    message: "Book is currently not available."
                });
            }


            // -------------------------------------------------
            // Check whether student already has this book
            // -------------------------------------------------
            db.query(
                `
                SELECT *
                FROM borrowings
                WHERE user_id = ?
                AND book_id = ?
                AND status = 'issued'
                `,
                [user_id, book_id],
                (existingErr, existingResults) => {

                    if (existingErr) {

                        console.error(
                            "Existing borrowing check error:",
                            existingErr
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Database error while checking borrowing."
                        });
                    }


                    if (existingResults.length > 0) {

                        return res.status(400).json({
                            success: false,
                            message: "You already have this book issued."
                        });
                    }


                    // -------------------------------------------------
                    // Create borrowing record in MySQL
                    // -------------------------------------------------
                    const insertSql = `
                        INSERT INTO borrowings
                        (
                            user_id,
                            book_id,
                            issue_date,
                            due_date,
                            status,
                            fine
                        )
                        VALUES
                        (
                            ?,
                            ?,
                            CURDATE(),
                            ?,
                            'issued',
                            0
                        )
                    `;


                    db.query(
                        insertSql,
                        [user_id, book_id, due_date],
                        async (insertErr, result) => {

                            if (insertErr) {

                                console.error(
                                    "Error creating borrowing:",
                                    insertErr
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Failed to issue book."
                                });
                            }


                            const borrowingId = result.insertId;


                            // -------------------------------------------------
                            // Reduce available quantity
                            // -------------------------------------------------
                            db.query(
                                `
                                UPDATE books
                                SET available_quantity =
                                    available_quantity - 1
                                WHERE id = ?
                                `,
                                [book_id],
                                async (quantityErr) => {

                                    if (quantityErr) {

                                        console.error(
                                            "Quantity update error:",
                                            quantityErr
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Borrowing created but book quantity update failed."
                                        });
                                    }


                                    // =================================================
                                    // BLOCKCHAIN - RECORD ISSUE TRANSACTION
                                    // =================================================
                                    try {

                                        console.log(
                                            "Recording ISSUE transaction on blockchain..."
                                        );


                                        const tx =
                                            await libraryContract.recordTransaction(
                                                borrowingId,
                                                user_id,
                                                book_id,
                                                "ISSUE"
                                            );


                                        console.log(
                                            "Blockchain transaction submitted:",
                                            tx.hash
                                        );


                                        const receipt =
                                            await tx.wait();


                                        console.log(
                                            "Blockchain ISSUE transaction confirmed:",
                                            receipt.hash
                                        );


                                        // -------------------------------------------------
                                        // Save blockchain transaction in MySQL
                                        // -------------------------------------------------
                                        db.query(
                                            `
                                            INSERT INTO blockchain_transactions
                                            (
                                                borrowing_id,
                                                transaction_hash,
                                                transaction_type,
                                                block_number
                                            )
                                            VALUES (?, ?, ?, ?)
                                            `,
                                            [
                                                borrowingId,
                                                receipt.hash,
                                                "ISSUE",
                                                receipt.blockNumber.toString()
                                            ],
                                            (blockchainDbErr) => {

                                                if (blockchainDbErr) {

                                                    console.error(
                                                        "Blockchain transaction confirmed but MySQL save failed:",
                                                        blockchainDbErr
                                                    );

                                                } else {

                                                    console.log(
                                                        "Blockchain transaction saved in MySQL."
                                                    );
                                                }
                                            }
                                        );


                                        // -------------------------------------------------
                                        // Send successful response
                                        // -------------------------------------------------
                                        return res.status(201).json({
                                            success: true,
                                            message:
                                                "Book issued successfully and transaction recorded on blockchain.",
                                            borrowingId: borrowingId,
                                            transactionHash: receipt.hash,
                                            blockNumber:
                                                receipt.blockNumber
                                        });


                                    } catch (blockchainError) {

                                        // =================================================
                                        // BLOCKCHAIN FAILED
                                        // =================================================
                                        console.error(
                                            "Blockchain ISSUE failed:",
                                            blockchainError
                                        );


                                        // MySQL borrowing already exists.
                                        // We don't delete it here.
                                        return res.status(201).json({
                                            success: true,
                                            message:
                                                "Book issued successfully, but blockchain transaction failed.",
                                            borrowingId: borrowingId,
                                            blockchainError:
                                                blockchainError.message
                                        });
                                    }
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});


// =====================================================
// RETURN BOOK
// =====================================================
router.put("/return/:id", async (req, res) => {

    const borrowingId = req.params.id;


    // -------------------------------------------------
    // Find borrowing
    // -------------------------------------------------
    db.query(
        `
        SELECT *
        FROM borrowings
        WHERE id = ?
        `,
        [borrowingId],
        (findErr, results) => {

            if (findErr) {

                console.error(
                    "Error finding borrowing:",
                    findErr
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }


            if (results.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Borrowing record not found."
                });
            }


            const borrowing = results[0];


            // -------------------------------------------------
            // Already returned?
            // -------------------------------------------------
            if (borrowing.status === "returned") {

                return res.status(400).json({
                    success: false,
                    message: "This book has already been returned."
                });
            }


            // -------------------------------------------------
            // Calculate fine
            // ₹10 per late day
            // -------------------------------------------------
            const fineSql = `
                SELECT
                    GREATEST(
                        DATEDIFF(CURDATE(), due_date),
                        0
                    ) * 10 AS fine
                FROM borrowings
                WHERE id = ?
            `;


            db.query(
                fineSql,
                [borrowingId],
                (fineErr, fineResults) => {

                    if (fineErr) {

                        console.error(
                            "Fine calculation error:",
                            fineErr
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to calculate fine."
                        });
                    }


                    const fine = fineResults[0].fine;


                    // -------------------------------------------------
                    // Update borrowing
                    // -------------------------------------------------
                    db.query(
                        `
                        UPDATE borrowings
                        SET
                            return_date = CURDATE(),
                            status = 'returned',
                            fine = ?
                        WHERE id = ?
                        `,
                        [fine, borrowingId],
                        (updateErr) => {

                            if (updateErr) {

                                console.error(
                                    "Return update error:",
                                    updateErr
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Failed to return book."
                                });
                            }


                            // -------------------------------------------------
                            // Increase available quantity
                            // -------------------------------------------------
                            db.query(
                                `
                                UPDATE books
                                SET available_quantity =
                                    available_quantity + 1
                                WHERE id = ?
                                `,
                                [borrowing.book_id],
                                async (quantityErr) => {

                                    if (quantityErr) {

                                        console.error(
                                            "Quantity update error:",
                                            quantityErr
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Book returned but quantity update failed."
                                        });
                                    }


                                    // =================================================
                                    // BLOCKCHAIN - RECORD RETURN TRANSACTION
                                    // =================================================
                                    try {

                                        console.log(
                                            "Recording RETURN transaction on blockchain..."
                                        );


                                        const tx =
                                            await libraryContract.recordTransaction(
                                                borrowingId,
                                                borrowing.user_id,
                                                borrowing.book_id,
                                                "RETURN"
                                            );


                                        console.log(
                                            "Blockchain transaction submitted:",
                                            tx.hash
                                        );


                                        const receipt =
                                            await tx.wait();


                                        console.log(
                                            "Blockchain RETURN transaction confirmed:",
                                            receipt.hash
                                        );


                                        // -------------------------------------------------
                                        // Save blockchain transaction in MySQL
                                        // -------------------------------------------------
                                        db.query(
                                            `
                                            INSERT INTO blockchain_transactions
                                            (
                                                borrowing_id,
                                                transaction_hash,
                                                transaction_type,
                                                block_number
                                            )
                                            VALUES (?, ?, ?, ?)
                                            `,
                                            [
                                                borrowingId,
                                                receipt.hash,
                                                "RETURN",
                                                receipt.blockNumber.toString()
                                            ],
                                            (blockchainDbErr) => {

                                                if (blockchainDbErr) {

                                                    console.error(
                                                        "Blockchain transaction confirmed but MySQL save failed:",
                                                        blockchainDbErr
                                                    );

                                                } else {

                                                    console.log(
                                                        "Blockchain RETURN transaction saved in MySQL."
                                                    );
                                                }
                                            }
                                        );


                                        // -------------------------------------------------
                                        // Send successful response
                                        // -------------------------------------------------
                                        return res.json({
                                            success: true,
                                            message:
                                                "Book returned successfully and transaction recorded on blockchain.",
                                            fine: fine,
                                            transactionHash: receipt.hash,
                                            blockNumber:
                                                receipt.blockNumber
                                        });


                                    } catch (blockchainError) {

                                        // =================================================
                                        // BLOCKCHAIN FAILED
                                        // =================================================
                                        console.error(
                                            "Blockchain RETURN failed:",
                                            blockchainError
                                        );


                                        return res.json({
                                            success: true,
                                            message:
                                                "Book returned successfully, but blockchain transaction failed.",
                                            fine: fine,
                                            blockchainError:
                                                blockchainError.message
                                        });
                                    }
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// =====================================================
// GET BLOCKCHAIN TRANSACTION HISTORY
// =====================================================
router.get("/blockchain/history", (req, res) => {

    const sql = `
        SELECT
            bt.id,
            bt.borrowing_id,
            bt.transaction_hash,
            bt.transaction_type,
            bt.block_number,
            bt.created_at,

            u.name AS student_name,
            b.title AS book_title

        FROM blockchain_transactions bt

        LEFT JOIN borrowings br
            ON bt.borrowing_id = br.id

        LEFT JOIN users u
            ON br.user_id = u.id

        LEFT JOIN books b
            ON br.book_id = b.id

        ORDER BY bt.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Error fetching blockchain history:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch blockchain history."
            });
        }

        res.json({
            success: true,
            transactions: results
        });
    });
});


module.exports = router;