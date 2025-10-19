import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

const ProfileDetails = () => {
    const [user, setUser] = useState(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/me')
            .then(response => setUser(response.data))
            .catch(err => toast.error("Could not load user details."))
            .finally(() => setLoading(false));
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long.");
            return;
        }
        try {
            const response = await api.post('/user/change-password', { oldPassword, newPassword });
            toast.success(response.data);
            setOldPassword('');
            setNewPassword('');
        } catch (error) {
            toast.error(error.response?.data || "Failed to change password.");
        }
    };

    if (loading) return <p className="p-4">Loading profile...</p>;

    return (
        <div className="p-4">
            <h3 className="card-title">My Profile</h3>
            {user && (
                <ul className="list-unstyled profile-details-list">
                    <li><strong>Public ID:</strong> <span>{user.publicUserId}</span></li>
                    <li><strong>Name:</strong> <span>{user.firstName} {user.lastName}</span></li>
                    <li><strong>Email:</strong> <span>{user.email}</span></li>
                    <li className="mt-3">
                        <h4>Balance: <span className="text-success">${user.balance.toFixed(2)}</span></h4>
                    </li>
                </ul>
            )}
            <hr />
            <h4 className="mt-4">Change Password</h4>
            <form onSubmit={handleChangePassword}>
                <input type="password" className="form-control mb-3" placeholder="Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                <input type="password" className="form-control mb-3" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <button type="submit" className="btn btn-primary w-100">Update Password</button>
            </form>
        </div>
    );
};

export default ProfileDetails;