import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode';

function SignIn() {
    // FIX #1: useNavigate hook එක call කරලා navigate function එක හදාගන්න ඕන
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});

    // FIX #2: 'no-restricted-globals' error එක නැතිවෙන විදියට function එක වෙනස් කිරීම
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.email) {
            tempErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = "Email is not valid.";
        }
        if (!formData.password) {
            tempErrors.password = "Password is required.";
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                const response = await api.post('/auth/login', formData);
                const token = response.data.token;

                localStorage.setItem('token', token);

                toast.success('Sign in successful!');

                const decodedToken = jwtDecode(token);

                if (decodedToken.roles && (decodedToken.roles.includes("ROLE_ADMIN") || decodedToken.roles.includes("ROLE_SUPER_ADMIN"))) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }

            } catch (error) {
                toast.error('Invalid email or password. Please try again.');
                console.error('Login failed:', error);
            }
        }
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card glass-card">
                        <div className="card-body p-5">
                            <h2 className="card-title text-center mb-4">Welcome Back!</h2>
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-3">
                                    <input type="email" name="email" className="form-control" placeholder="Email" value={formData.email} onChange={handleChange} />
                                    {errors.email && <div className="text-danger mt-1" style={{fontSize: '0.9em'}}>{errors.email}</div>}
                                </div>
                                <div className="mb-3">
                                    <input type="password" name="password" className="form-control" placeholder="Password" value={formData.password} onChange={handleChange} />
                                    {errors.password && <div className="text-danger mt-1" style={{fontSize: '0.9em'}}>{errors.password}</div>}
                                </div>
                                <div className="d-grid mt-4">
                                    <button type="submit" className="btn btn-primary btn-lg">Sign In</button>
                                </div>
                            </form>
                            <div className="text-center mt-3">
                                <small className="text-white-50">Don't have an account? <Link to="/signup" className="fw-bold text-white">Sign Up</Link></small>
                                <small className="d-block mt-2"><Link to="/forgot-password" style={{color: '#ccc'}}>Forgot Password?</Link></small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;