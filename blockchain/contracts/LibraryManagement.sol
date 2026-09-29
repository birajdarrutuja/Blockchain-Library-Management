// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract LibraryManagement {

    struct LibraryTransaction {
        uint256 borrowingId;
        uint256 userId;
        uint256 bookId;
        string transactionType;
        uint256 timestamp;
    }

    LibraryTransaction[] private transactions;

    event TransactionRecorded(
        uint256 indexed transactionId,
        uint256 borrowingId,
        uint256 userId,
        uint256 bookId,
        string transactionType,
        uint256 timestamp
    );

    function recordTransaction(
        uint256 borrowingId,
        uint256 userId,
        uint256 bookId,
        string memory transactionType
    ) public {
        transactions.push(
            LibraryTransaction({
                borrowingId: borrowingId,
                userId: userId,
                bookId: bookId,
                transactionType: transactionType,
                timestamp: block.timestamp
            })
        );

        emit TransactionRecorded(
            transactions.length - 1,
            borrowingId,
            userId,
            bookId,
            transactionType,
            block.timestamp
        );
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 transactionId)
        public
        view
        returns (
            uint256 borrowingId,
            uint256 userId,
            uint256 bookId,
            string memory transactionType,
            uint256 timestamp
        )
    {
        LibraryTransaction memory transaction = transactions[transactionId];

        return (
            transaction.borrowingId,
            transaction.userId,
            transaction.bookId,
            transaction.transactionType,
            transaction.timestamp
        );
    }
}