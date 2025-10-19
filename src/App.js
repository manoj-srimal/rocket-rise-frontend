import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import AccountPage from './components/AccountPage';
import DepositPage from './components/DepositPage';
import WithdrawalPage from './components/WithdrawalPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import TransactionManagement from './components/admin/TransactionManagement';
import PaymentMethodManagement from './components/admin/PaymentMethodManagement';
import GameSignals from './components/admin/GameSignals';
import EmailVerificationPage from './components/EmailVerificationPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';

// Assets
import bgVideo from './assets/background.mp4';
import Dashboard from "./components/Dashboard";

// --- Public පිටු සඳහා Layout Component එක ---
const PublicLayout = () => (
    <div className="app-container">
        <video className="video-background" autoPlay loop muted>
            <source src={bgVideo} type="video/mp4" />
        </video>
        <div className="overlay"></div>
        <Outlet />
    </div>
);

// --- Home Page Component එක ---
function HomePage() {
    return (
        <div style={{ textAlign: 'center' }}>
            <h1 className="main-heading">Reach for the Sky</h1>
            <p className="tagline">Experience the thrill, aim for the peak.</p>
            <div className="mt-5">
                <Link to="/signup" className="btn btn-primary btn-lg mx-2 px-5 py-3 fw-bold">Get Started Now</Link>
            </div>
            <div className="mt-3">
                <small className="text-white-50">Already have an account? <Link to="/login" className="fw-bold text-white">Sign In</Link></small>
            </div>
        </div>
    );
}

// --- ප්‍රධාන App Component එක ---
function App() {
    return (
        <BrowserRouter>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            <Routes>
                {/* PublicLayout එක ඇතුළේ තියෙන routes වලට විතරක් video background එක ලැබෙනවා */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<SignIn />} />
                    <Route path="/verify-email" element={<EmailVerificationPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/deposit" element={<DepositPage />} />
                    <Route path="/withdraw" element={<WithdrawalPage />} />
                </Route>

                {/* Login වුණාට පස්සේ එන Player පිටු */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/account" element={<AccountPage />} />

                {/* Admin Panel එකට අදාළ සියලුම routes, වෙනම තියෙන්නේ */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="transactions" element={<TransactionManagement />} />
                    <Route path="payment-methods" element={<PaymentMethodManagement />} />
                    <Route path="signals" element={<GameSignals />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;