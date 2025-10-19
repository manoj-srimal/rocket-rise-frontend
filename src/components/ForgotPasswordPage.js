import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/forgot-password', { email });
            toast.success(response.data);
            // Email එක, ඊළඟ පිටුවට state එකක් විදියට pass කරනවා
            navigate('/reset-password', { state: { email: email } });
        } catch (error) {
            toast.error(error.response?.data || "Something went wrong.");
        }
    };

    return (
        <div className="card glass-card p-5">
            <h2 className="mb-4">Forgot Password</h2>
            <p className="text-muted mb-4">Enter your email address and we will send you a code to reset your password.</p>
            <form onSubmit={handleSubmit}>
                <input type="email" className="form-control mb-3" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button type="submit" className="btn btn-primary w-100">Send Reset Code</button>
            </form>
        </div>
    );
};
export default ForgotPasswordPage;