require("dotenv").config();
const { ethers } = require("ethers");

// Local Hardhat blockchain
const provider = new ethers.JsonRpcProvider(
    "http://127.0.0.1:8545"
);

// Hardhat Account #0
// Private key is stored in backend/.env
const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
    throw new Error("PRIVATE_KEY is not set in backend/.env");
}

const wallet = new ethers.Wallet(privateKey, provider);

// Deployed LibraryManagement contract
const contractAddress =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Smart contract ABI
const contractABI = [
    "function recordTransaction(uint256 borrowingId, uint256 userId, uint256 bookId, string memory transactionType) public",
    "function getTransactionCount() public view returns (uint256)",
    "function getTransaction(uint256 transactionId) public view returns (uint256 borrowingId, uint256 userId, uint256 bookId, string memory transactionType, uint256 timestamp)"
];

const libraryContract = new ethers.Contract(
    contractAddress,
    contractABI,
    wallet
);

module.exports = {
    provider,
    wallet,
    libraryContract
};