import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate hook එක import කරගන්නවා
import axios from 'axios'; // axios import කරගන්නවා
import { toast } from 'react-toastify';

function SignUp() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(''); // Backend එකෙන් එන errors පෙන්වන්න අලුත් state එකක්
    const navigate = useNavigate(); // Page එක redirect කරන්න navigate function එක හදාගන්නවා

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validate = () => {
        // Validation logic එකේ කිසිම වෙනසක් නෑ
        let tempErrors = {};
        if (!formData.firstName) tempErrors.firstName = "First name is required.";
        if (!formData.lastName) tempErrors.lastName = "Last name is required.";
        if (!formData.email) {
            tempErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = "Email is not valid.";
        }
        if (!formData.mobileNumber) {
            tempErrors.mobileNumber = "Mobile number is required.";
        } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
            tempErrors.mobileNumber = "Mobile number must be 10 digits.";
        }
        if (!formData.password) {
            tempErrors.password = "Password is required.";
        } else if (formData.password.length < 8) {
            tempErrors.password = "Password must be at least 8 characters long.";
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // --- handleSubmit function එක සම්පූර්ණයෙන්ම වෙනස් වෙනවා ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        if (validate()) {
            try {
                const response = await axios.post('http://localhost:8080/api/auth/signup', formData);

                // --- alert() එක වෙනුවට toast.success() ---
                toast.success('Registration successful! Please check your email to verify your account.');

                // තත්පර 2-3කට පස්සේ login page එකට යවනවා, එතකොට user ට notification එක කියවන්න වෙලාව තියෙනවා
                setTimeout(() => {
                    navigate('/login');
                }, 3000);

            } catch (error) {
                const errorMessage = error.response && error.response.data ? error.response.data : 'An unexpected error occurred. Please try again.';
                console.error('Registration failed:', errorMessage);

                // --- Server error එක state එකට දානවට අමතරව, toast.error() එකක් පෙන්වනවා ---
                setServerError(errorMessage);
                toast.error(errorMessage);
            }
        } else {
            console.log("Form is invalid, please check the errors.");
            toast.warn("Please fill all the required fields correctly."); // Validation fail වුණොත් warning toast එකක්
        }
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card glass-card">
                        <div className="card-body p-5">
                            <h2 className="card-title text-center mb-4">Create Your Account</h2>
                            <form onSubmit={handleSubmit} noValidate>
                                {/* Server එකෙන් එන error එක මෙතන පෙන්වනවා */}
                                {serverError && <div className="alert alert-danger">{serverError}</div>}

                                {/* Input fields ටිකේ වෙනසක් නෑ */}
                                <div className="mb-3">
                                    <input type="text" name="firstName" className="form-control" placeholder="First Name" value={formData.firstName} onChange={handleChange}/>
                                    {errors.firstName && <div className="text-danger mt-1" style={{fontSize: '0.9em'}}>{errors.firstName}</div>}
                                </div>
                                <div className="mb-3">
                                    <input type="text" name="lastName" className="form-control" placeholder="Last Name" value={formData.lastName} onChange={handleChange}/>
                                    {errors.lastName && <div className="text-danger mt-1" style={{fontSize: '0.9em'}}>{errors.lastName}</div>}
                                </div>
                                <div className="mb-3">
                                    <input type="email" name="email" className="form-control" placeholder="Email" value={formData.email} onChange={handleChange}/>
                                    {errors.email && <div className="text-danger mt-1" style={{fontSize: '0.9em'}}>{errors.email}</div>}
                                </div>
                                <div className="mb-3">
                                    <input type="text" name="mobileNumber" className="form-control" placeholder="Mobile Number" value={formData.mobileNumber} onChange={handleChange}/>
                                    {errors.mobileNumber && <div className="text-danger mt-1" style={{fontSize: '0.9em'}}>{errors.mobileNumber}</div>}
                                </div>
                                <div className="mb-3">
                                    <input type="password" name="password" className="form-control" placeholder="Password" value={formData.password} onChange={handleChange}/>
                                    {errors.password && <div className="text-danger mt-1" style={{fontSize: '0.9em'}}>{errors.password}</div>}
                                </div>
                                <div className="d-grid mt-4">
                                    <button type="submit" className="btn btn-primary btn-lg">Get Started</button>
                                </div>
                            </form>
                            <div className="text-center mt-3">
                                <small className="text-white-50">Already have an account? <Link to="/login" className="fw-bold text-white">Sign In</Link></small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;