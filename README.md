📚 Blockchain-Based Library Management System

A blockchain-integrated web application designed to simplify library operations and provide transparent, tamper-resistant records of book issue and return transactions.

📌 1. Project Overview

The **Blockchain-Based Library Management System** is an academic mini project developed to combine traditional library management with blockchain technology.

Traditional library systems generally store their operational records in centralized databases. This project uses MySQL to manage library data and a Solidity smart contract to record important book issue and return transactions on a local Ethereum-compatible blockchain.

The application provides separate interfaces for students and administrators. Students can view available books and manage their borrowings, while administrators can manage library resources and monitor library activities.

The backend connects the frontend, MySQL database, and blockchain smart contract using Node.js, Express.js, and Ethers.js.

🎯 2. Project Objectives

- Develop a web-based system for managing library operations.
- Provide user registration and login functionality.
- Maintain book details and availability.
- Record book issue and return operations.
- Calculate fines for overdue book returns.
- Store application data in a MySQL database.
- Record important library transactions using a Solidity smart contract.
- Maintain transaction hashes and related blockchain information.
- Provide separate dashboards for students and administrators.
- Demonstrate the integration of web development, database management, and blockchain technology.

✨ 3. Features

🔐 User Authentication
- User registration and login.
- Role-based access for students and administrators, according to the configured application roles.
- Access to the appropriate dashboard after login.

👨‍🎓 Student Dashboard
- View available books.
- Check book availability.
- Issue available books.
- View borrowing information.
- Return issued books.
- View applicable overdue fines.

👨‍💼 Admin Dashboard
- Manage library book records.
- Monitor book availability.
- Review borrowing and return activities.
- Access relevant library information through the administrative interface.

📖 Book Management
- Store book titles, authors, ISBNs, categories, and quantities.
- Track available book quantities.
- Update availability after issuing and returning books.

📥 Book Issue
- Validate book availability.
- Create a borrowing record in MySQL.
- Update available book quantities.
- Submit an ISSUE transaction to the smart contract.
- Save the blockchain transaction details in MySQL.

📤 Book Return
- Process the return of an issued book.
- Calculate applicable overdue fines.
- Update the borrowing status and book availability.
- Submit a RETURN transaction to the smart contract.
- Store the associated blockchain transaction details.

⛓️ Blockchain Integration
- Use a Solidity smart contract to record library transactions.
- Record borrowing ID, user ID, book ID, transaction type, and timestamp.
- Generate blockchain transaction hashes.
- Retrieve transaction information from the deployed smart contract.
- Maintain a history connecting blockchain transactions with library records.

🗄️ Database Management
- Store user details.
- Maintain book records.
- Store borrowing and return information.
- Save blockchain transaction metadata.

🛠️ 4. Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Builds the frontend user interface |
| Vite | Runs the frontend development server |
| Node.js | Executes backend JavaScript |
| Express.js | Provides backend APIs |
| MySQL | Stores application data |
| XAMPP / phpMyAdmin | Supports local MySQL setup and database administration |
| Solidity | Implements the library smart contract |
| Hardhat | Runs the local blockchain development environment |
| Ethers.js | Connects the backend to the smart contract |
| MetaMask | Provides browser wallet connectivity where configured |
| Git | Tracks source code changes |
| GitHub | Hosts the project repository |

🏗️ 5. System Architecture

The application uses a layered architecture consisting of a frontend, backend, database, and blockchain.

```text
              Student / Administrator
                        |
                        v
                React.js Frontend
                        |
                        v
               Node.js + Express.js
                        |
              +---------+----------+
              |                    |
              v                    v
        MySQL Database          Ethers.js
                                   |
                                   v
                           Hardhat Network
                                   |
                                   v
                       LibraryManagement.sol
                           Smart Contract
```

Architecture Explanation

1. **Frontend:** React.js provides the user interface for login, dashboards, book management, and borrowing operations.
2. **Backend:** Node.js and Express.js process requests and apply the application's business logic.
3. **Database:** MySQL stores users, books, borrowings, fines, and blockchain transaction metadata.
4. **Blockchain connection:** Ethers.js connects the backend to the deployed smart contract.
5. **Smart contract:** The `LibraryManagement` contract records ISSUE and RETURN transaction details on the local blockchain.
6. **Transaction history:** Transaction hashes and related information are stored in MySQL for display and tracking.

**Important implementation detail:** In the current version, the backend submits ISSUE and RETURN transactions using a configured local Hardhat account. MetaMask provides browser wallet connectivity where configured; it does not sign every transaction in this implementation.

📂 6. Project Structure

```text
Blockchain-Library-Management/
│
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   └── borrowings.js
│   ├── server.js
│   ├── db.js
│   ├── blockchain.js
│   ├── .env.example
│   └── package.json
│
├── blockchain/
│   ├── contracts/
│   │   └── LibraryManagement.sol
│   ├── hardhat.config.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── index.html
│
├── .gitignore
└── README.md
```

*This is a simplified overview of the main project components. The actual repository may contain additional files.*

⚙️ 7. System Requirements

### Software Requirements
- Windows, Linux, or macOS.
- Node.js and npm.
- MySQL Server or XAMPP with MySQL.
- Git.
- A modern web browser.
- MetaMask browser extension if wallet connectivity is required.

### Hardware Requirements
- A computer capable of running Node.js, MySQL, and a local blockchain node.
- Sufficient memory and storage for the development tools and dependencies.

🚀 8. Installation and Setup

### Step 1: Clone the Repository

Open a terminal and execute:

```bash
git clone https://github.com/birajdarrutaruja/Blockchain-Library-Management.git
cd Blockchain-Library-Management
```

If the clone command fails, verify the repository URL on GitHub and use the exact URL shown by the repository's Code button.

### Step 2: Configure MySQL

1. Start MySQL from XAMPP or your installed MySQL service.
2. Open phpMyAdmin at `http://localhost/phpmyadmin`.
3. Create a database named `library_db`.
4. Create the required tables: `users`, `books`, `borrowings`, and `blockchain_transactions`.
5. Add sample records if the database does not already contain them.

Use the database schema from the project implementation. A fresh installation requires the schema and any necessary initial data; cloning the GitHub repository does not automatically create the database.

### Step 3: Install Backend Dependencies

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder, using `.env.example` as the template.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=library_db
PORT=5000
PRIVATE_KEY=your_local_hardhat_account_private_key
```

Replace the private-key placeholder with a local development account key appropriate for your Hardhat setup.

**Security warning:** Never commit the actual `.env` file or private key to GitHub. Never use a development private key containing funds or credentials for a production deployment.

### Step 4: Start the Local Blockchain

Open another terminal:

```bash
cd blockchain
npm install
npx hardhat node
```

Keep the blockchain terminal running.

The local Hardhat network normally uses:

- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`

If a Hardhat node is already running, do not start another one on the same port.

### Step 5: Deploy the Smart Contract

Use the deployment script provided in the repository's Hardhat setup.

After deployment:

1. Copy the deployed contract address.
2. Confirm that the address matches the one configured in `backend/blockchain.js`.
3. Ensure the backend ABI matches the deployed contract.
4. Restart the backend if its configuration has changed.

The local blockchain's state may reset when the node restarts. If the contract is no longer deployed at the configured address, redeploy it and update the configuration.

### Step 6: Start the Backend

Open another terminal:

```bash
cd backend
node server.js
```

The backend should run at:

`http://localhost:5000`

A successful startup should display the backend status and, when configured correctly, the MySQL connection status.

### Step 7: Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL displayed by Vite, usually:

`http://localhost:5173/`

Keep MySQL, the Hardhat node, backend, and frontend running while testing blockchain operations.

🗃️ 9. Database Design

The system uses a MySQL database named `library_db`.

### Main Tables

| Table | Purpose |
|---|---|
| `users` | Stores user information, login credentials, and roles |
| `books` | Stores book information, quantities, and availability |
| `borrowings` | Stores issue dates, due dates, return dates, borrowing status, and fines |
| `blockchain_transactions` | Stores transaction hashes, transaction types, block numbers, and related borrowing IDs |

### Database Relationships

- A user can have multiple borrowing records.
- A book can appear in multiple borrowing records over time.
- A borrowing record can be associated with blockchain transaction records.
- Foreign keys connect borrowing records to users and books.

MySQL is used for application operations and convenient querying. The smart contract separately records important transaction information on the blockchain.

⛓️ 10. Smart Contract Design

The smart contract is named `LibraryManagement` and is written in Solidity.

### Transaction Information

The contract records:

- Borrowing ID
- User ID
- Book ID
- Transaction type, such as `ISSUE` or `RETURN`
- Blockchain timestamp

### Main Functions

| Function | Description |
|---|---|
| `recordTransaction()` | Records a library transaction on the blockchain |
| `getTransactionCount()` | Returns the number of recorded transactions |
| `getTransaction()` | Retrieves a recorded transaction by its index |

### Smart Contract Events

The contract emits a `TransactionRecorded` event when a transaction is recorded. The event includes the transaction identifier and related borrowing, user, book, type, and timestamp information.

### Why Blockchain Is Used

- Provides a verifiable record of submitted transactions.
- Makes confirmed records on the blockchain difficult to alter unnoticed.
- Allows transaction details to be retrieved from the smart contract.
- Demonstrates how blockchain can complement a conventional database.

The local Hardhat network is a development environment, not a public production blockchain.

🔄 11. Working Flow

### Book Issue Process

1. A student logs in.
2. The student views available books.
3. The student selects an available book.
4. The backend validates the request.
5. The borrowing record is created in MySQL.
6. The available quantity is updated.
7. The backend submits an ISSUE transaction to the smart contract.
8. The transaction is confirmed on the local blockchain.
9. The transaction details are saved in MySQL.
10. The application displays the relevant result.

### Book Return Process

1. The student returns an issued book.
2. The backend processes the return.
3. The overdue fine is calculated when applicable.
4. The borrowing record and available quantity are updated.
5. The backend submits a RETURN transaction to the smart contract.
6. The transaction is confirmed on the local blockchain.
7. The transaction details are saved in MySQL.
8. The application displays the updated borrowing information.

### Transaction History

The transaction history connects the library's borrowing information with blockchain transaction metadata, helping administrators review ISSUE and RETURN activities.

🧪 12. Testing

The following functional tests should be performed before submission.

| Test | Expected Result |
|---|---|
| Register a valid user | Account is created |
| Log in with valid credentials | User can access the application |
| View available books | Book records and availability are displayed |
| Issue an available book | Borrowing is recorded and availability is updated |
| Issue an unavailable book | Request is rejected |
| Return an issued book | Borrowing status and availability are updated |
| Return an overdue book | Applicable fine is calculated |
| Record an ISSUE transaction | Blockchain transaction is confirmed |
| Record a RETURN transaction | Blockchain transaction is confirmed |
| View transaction history | Related transaction information is displayed |
| Access the admin dashboard | Authorized administrator can use available administrative functions |

Actual test results should be verified against the running application before final submission.

🔒 13. Security Considerations

- Keep private keys and database credentials in environment variables.
- Exclude `.env` files from Git version control.
- Use local development accounts only for the local Hardhat network.
- Validate user input on the backend.
- Enforce authorization for administrative operations.
- Protect stored credentials using appropriate password hashing.
- Avoid exposing private keys in logs, screenshots, or public repositories.

Additional testing and security hardening would be required before using the application in a real library.

⚠️ 14. Limitations

- The current implementation uses a local Hardhat blockchain.
- The Hardhat node must be running for blockchain operations.
- Local blockchain state and deployed contract addresses may change when the node is restarted.
- ISSUE and RETURN transactions are signed by the backend using a configured local development account.
- MySQL and blockchain operations are separate, so a failure between them may require recovery or reconciliation.
- The project is an academic prototype and requires additional security, deployment, and testing work for production use.

🔮 15. Future Enhancements

- Deploy the smart contract to a suitable public test network.
- Add user-authorized MetaMask transactions if required.
- Improve transaction verification and recovery.
- Add more detailed reports and analytics.
- Implement automated frontend, backend, database, and smart contract tests.
- Improve accessibility and responsive design.
- Add stronger role-based authorization and security controls.
- Deploy the application to suitable hosting infrastructure.

🎓 16. Project Information

- **Project Title:** Blockchain-Based Library Management System
- **Project Type:** Academic Mini Project
- **Degree:** B.Tech — Computer Science and Engineering (ICBT)
- **Institution:** School of Engineering and Technology, MGM University
- **Academic Year:** 2026–2027
- **Developer:** Rutuja Birajdar

📚 17. References

- React: https://react.dev/
- Vite: https://vite.dev/
- Node.js: https://nodejs.org/
- Express.js: https://expressjs.com/
- MySQL: https://dev.mysql.com/doc/
- Solidity: https://docs.soliditylang.org/
- Hardhat: https://hardhat.org/docs
- Ethers.js: https://docs.ethers.org/
- MetaMask: https://metamask.io/

📄 License

This project was developed for academic purposes. A license file should be added if specific reuse and distribution permissions are intended.
