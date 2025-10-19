import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2'; // <-- react-bootstrap වෙනුවට, sweetalert2 import කරනවා
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const AssignAdmin = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;
        setLoading(true);
        setFoundUser(null);
        try {
            const response = await api.get(`/admin/users/search?query=${searchTerm}`);
            if (response.data.length > 0) {
                const user = response.data[0];
                if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
                    toast.warn(`${user.name} is already an admin.`);
                } else {
                    setFoundUser(user);
                }
            } else {
                toast.error("No user found with that Public ID.");
            }
        } catch (error) {
            toast.error("Failed to search user.");
        } finally {
            setLoading(false);
        }
    };

    // "Appoint as Admin" button එක click කළාම, අලුත් sweetalert එක පෙන්වන function එක
    const handleAppointClick = () => {
        if (!foundUser) return;

        MySwal.fire({
            title: 'Confirm Promotion',
            html: (
                <div>
                    <p>Are you sure you want to promote <strong>{foundUser.name}</strong> to an ADMIN?</p>
                    <p className="text-warning mt-3">This action grants significant privileges and should not be undone lightly.</p>
                </div>
            ),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm & Appoint',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            background: '#2c2c38', // Dark theme background
            color: 'white' // Text color
        }).then((result) => {
            if (result.isConfirmed) {
                confirmAppointment(); // User "Confirm" click කළොත්, promotion එක කරනවා
            }
        });
    };

    // ඇත්තටම userව promote කරන function එක
    const confirmAppointment = async () => {
        if (!foundUser) return;
        try {
            await api.put(`/admin/users/${foundUser.id}/role`, { role: 'ADMIN' });
            toast.success(`${foundUser.name} has been promoted to Admin.`);
            setFoundUser(null);
            setSearchTerm('');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to promote user. You may not have Super Admin privileges.");
        }
    };

    return (
        <div className="assign-admin-container glass-card mt-5">
            <h4 className="mb-3">Appoint New Admin</h4>
            <p className="text-muted">Search for a user by their Public ID to promote them to an Admin role.</p>
            <form onSubmit={handleSearch} className="mb-3">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter User's Public ID (e.g., CRG...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {foundUser && (
                <div className="found-user-card">
                    <div>
                        <strong>{foundUser.name}</strong> ({foundUser.publicUserId})
                        <small className="d-block text-muted">{foundUser.email}</small>
                    </div>
                    <button className="btn btn-success" onClick={handleAppointClick}>Appoint as Admin</button>
                </div>
            )}
        </div>
    );
};

export default AssignAdmin;