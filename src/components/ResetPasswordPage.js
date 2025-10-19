import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

const ResetPasswordPage = () => {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email; // කලින් page එකෙන් pass කරපු email එක

    if (!email) {
        navigate('/forgot-password');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/reset-password', { token, newPassword });
            toast.success(response.data);
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data || "Failed to reset password.");
        }
    };

    return (
        <div className="card glass-card p-5">
            <h2 className="mb-4">Reset Password</h2>
            <p className="text-muted mb-4">A reset code has been sent to <strong>{email}</strong>. Please enter the code and your new password.</p>
            <form onSubmit={handleSubmit}>
                <input type="text" className="form-control mb-3" placeholder="Enter 6-digit code" value={token} onChange={(e) => setToken(e.target.value)} required />
                <input type="password" className="form-control mb-3" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <button type="submit" className="btn btn-primary w-100">Reset Password</button>
            </form>
        </div>
    );
};
export default ResetPasswordPage;