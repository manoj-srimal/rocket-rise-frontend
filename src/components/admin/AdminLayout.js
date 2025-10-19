import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.roles && decoded.roles.includes("ROLE_SUPER_ADMIN")) {
                    setIsSuperAdmin(true);
                }
            } catch (e) {
                console.error("Invalid Token", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <nav className="admin-sidebar">
                <h3>Admin Panel</h3>
                <ul className="admin-nav-list">
                    <li><NavLink to="/admin/dashboard">Dashboard</NavLink></li>
                    <li><NavLink to="/admin/users">User Management</NavLink></li>
                    <li><NavLink to="/admin/transactions">Transactions</NavLink></li>
                    <li><NavLink to="/admin/payment-methods">Payment Methods</NavLink></li>

                    {/* Super Admin ට විතරක් පේන link එක */}
                    {isSuperAdmin && (
                        <li><NavLink to="/admin/signals">Game Signals</NavLink></li>
                    )}
                </ul>
                <div className="admin-sidebar-footer">
                    <button onClick={() => navigate('/dashboard')} className="btn btn-secondary w-100">Back to Game</button>
                    <button onClick={handleLogout} className="btn btn-danger w-100 mt-2">Logout</button>
                </div>
            </nav>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;