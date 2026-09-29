import { useState } from "react";
import axios from "axios";
import "./App.css";

import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
    const [isRegister, setIsRegister] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    // MetaMask states
    const [walletAddress, setWalletAddress] = useState("");
    const [walletConnected, setWalletConnected] = useState(false);

    // Login fields
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Registration fields
    const [name, setName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // ==========================
    // CONNECT METAMASK
    // ==========================

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask is not installed!");
            return;
        }

        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            const chainId = await window.ethereum.request({
                method: "eth_chainId",
            });

            // Hardhat Local Chain ID: 31337
            // Hexadecimal: 0x7a69
            if (chainId !== "0x7a69") {
                alert(
                    "Please select Hardhat Local network in MetaMask."
                );
                return;
            }

            setWalletAddress(accounts[0]);
            setWalletConnected(true);

            alert("MetaMask connected successfully!");

            console.log("Connected wallet:", accounts[0]);
        } catch (error) {
            console.error(
                "MetaMask connection failed:",
                error
            );

            alert("Failed to connect MetaMask.");
        }
    };

    // ==========================
    // LOGIN
    // ==========================

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email: loginEmail,
                    password: loginPassword,
                }
            );

            const user = response.data.user;

            alert("Login successful!");

            // Save logged-in user
            setLoggedInUser(user);

            console.log("Logged in user:", user);
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );
        }
    };

    // ==========================
    // REGISTER
    // ==========================

    const handleRegister = async (e) => {
        e.preventDefault();

        if (registerPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/register",
                {
                    name: name,
                    email: registerEmail,
                    password: registerPassword,
                    role: "student",
                }
            );

            alert(
                response.data.message ||
                "Registration successful!"
            );

            // Clear registration form
            setName("");
            setRegisterEmail("");
            setRegisterPassword("");
            setConfirmPassword("");

            // Go to login
            setIsRegister(false);
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        }
    };

    // ==========================
    // LOGOUT
    // ==========================

    const handleLogout = () => {
        setLoggedInUser(null);
        setLoginEmail("");
        setLoginPassword("");

        alert("You have been logged out.");
    };

    // ==========================
    // SHOW DASHBOARD
    // ==========================

    if (loggedInUser) {
        if (loggedInUser.role === "admin") {
            return (
                <AdminDashboard
                    user={loggedInUser}
                    onLogout={handleLogout}
                />
            );
        }

        return (
            <StudentDashboard
                user={loggedInUser}
                onLogout={handleLogout}
            />
        );
    }

    // ==========================
    // LOGIN / REGISTER PAGE
    // ==========================

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="logo">📚</div>

                {!isRegister ? (
                    <>
                        {/* LOGIN */}

                        <h1>Library Management System</h1>

                        <p className="subtitle">
                            Blockchain-Based Library Management
                        </p>

                        {/* METAMASK BUTTON */}

                        <button
                            type="button"
                            onClick={connectWallet}
                        >
                            {walletConnected
                                ? `Wallet Connected: ${walletAddress.substring(
                                      0,
                                      6
                                  )}...${walletAddress.substring(
                                      walletAddress.length - 4
                                  )}`
                                : "Connect MetaMask"}
                        </button>

                        {/* LOGIN FORM */}

                        <form onSubmit={handleLogin}>
                            <label>Email</label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={loginEmail}
                                onChange={(e) =>
                                    setLoginEmail(
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={loginPassword}
                                onChange={(e) =>
                                    setLoginPassword(
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <button type="submit">
                                Login
                            </button>
                        </form>

                        <p className="register-text">
                            Don't have an account?{" "}
                            <span
                                onClick={() =>
                                    setIsRegister(true)
                                }
                            >
                                Register
                            </span>
                        </p>
                    </>
                ) : (
                    <>
                        {/* REGISTER */}

                        <h1>Create Account</h1>

                        <p className="subtitle">
                            Register for the Library Management
                            System
                        </p>

                        {/* REGISTRATION FORM */}

                        <form onSubmit={handleRegister}>
                            <label>Full Name</label>

                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                required
                            />

                            <label>Email</label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={registerEmail}
                                onChange={(e) =>
                                    setRegisterEmail(
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="Create a password"
                                value={registerPassword}
                                onChange={(e) =>
                                    setRegisterPassword(
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <label>Confirm Password</label>

                            <input
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <button type="submit">
                                Register
                            </button>
                        </form>

                        <p className="register-text">
                            Already have an account?{" "}
                            <span
                                onClick={() =>
                                    setIsRegister(false)
                                }
                            >
                                Login
                            </span>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;