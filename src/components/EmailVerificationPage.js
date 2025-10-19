import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const EmailVerificationPage = () => {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('Verifying your email, please wait...');
    const navigate = useNavigate();

    // --- අලුතෙන් එකතු කරන state එක ---
    // Request එක දැනටමත් යවලාද කියලා මතක තියාගන්න
    const verificationSent = useRef(false);

    useEffect(() => {
        // Request එක දැනටමත් යවලා නම්, ආයෙත් මුකුත් කරන්න එපා
        if (verificationSent.current) {
            return;
        }

        const token = searchParams.get('token');
        if (token) {
            verificationSent.current = true; // Request එක යවන බව සටහන් කරගන්නවා
            api.get(`/auth/verify-email?token=${token}`)
                .then(response => {
                    setMessage('✅ ' + response.data + ' Redirecting to login page...');
                    setTimeout(() => navigate('/login'), 3000);
                })
                .catch(error => {
                    setMessage('❌ ' + (error.response?.data || "Verification failed."));
                });
        } else {
            setMessage('❌ No verification token found.');
        }
    }, [searchParams, navigate]);

    return (
        <div className="container text-center text-white mt-5">
            <div className="card glass-card p-5">
                <h2>Email Verification</h2>
                <p className="mt-4 fs-5">{message}</p>
            </div>
        </div>
    );
};

export default EmailVerificationPage;