import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode'; // <-- අලුත් import එක
import api from '../../api/axiosConfig';
import AssignAdmin from './AssignAdmin'; // <-- අලුත් import එක

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false); // Super Admin ද කියා බැලීමට අලුත් state එක

    // Users ලා fetch කරන function එක
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const url = searchTerm ? `/admin/users/search?query=${searchTerm}` : '/admin/users';
            const response = await api.get(url);
            setUsers(response.data);
        } catch (error) {
            toast.error("Could not fetch users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Token එක decode කර, Super Admin ද කියා බලනවා
                const decodedToken = jwtDecode(token);
                if (decodedToken.roles && decodedToken.roles.includes("ROLE_SUPER_ADMIN")) {
                    setIsSuperAdmin(true);
                }
            } catch (error) {
                console.error("Invalid token", error);
            }
        }
        fetchUsers();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            await api.put(`/admin/users/${userId}/status`, { status: newStatus });
            toast.success("User status updated successfully!");
            const updatedUsers = users.map(user =>
                user.id === userId ? { ...user, status: newStatus } : user
            );
            setUsers(updatedUsers);
        } catch (error) {
            toast.error("Failed to update user status.");
        }
    };

    if (loading && users.length === 0) {
        return <p className="text-center p-4">Loading users...</p>;
    }

    return (
        <div className="user-management-page">
            <h1 className="mb-4">User Management</h1>

            <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Public User ID (e.g., CRG...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            <div className="table-responsive">
                <table className="table table-dark table-hover align-middle">
                    <thead>
                    <tr>
                        <th>Public ID</th>
                        <th>Name</th>
                        <th>Email & Mobile</th>
                        <th>Balance</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="font-monospace">{user.publicUserId}</td>
                            <td>{user.name}</td>
                            <td>
                                {user.email}
                                <br/>
                                <small className="text-muted">{user.mobileNumber}</small>
                            </td>
                            <td className="text-success fw-bold">${user.balance.toFixed(2)}</td>
                            <td>
                                    <span className={`status-badge status-${user.status.toLowerCase()}`}>
                                        {user.status}
                                    </span>
                            </td>
                            <td>
                                <select
                                    className="form-select form-select-sm"
                                    value={user.status}
                                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="SUSPENDED">Suspended</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* --- Super Admin ට විතරක් පේන Assign Admin කොටස --- */}
            {isSuperAdmin && <AssignAdmin />}
        </div>
    );
};

export default UserManagement;