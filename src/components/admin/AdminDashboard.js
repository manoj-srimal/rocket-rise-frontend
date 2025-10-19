import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // API calls දෙකම එකවර යවනවා
                const [statsResponse, performanceResponse] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/performance')
                ]);
                setStats(statsResponse.data);
                setPerformance(performanceResponse.data);
            } catch (error) {
                console.error("Failed to fetch admin data", error);
                toast.error("Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    if (loading) return <p className="text-center p-4">Loading dashboard...</p>;
    if (!stats) return <p className="text-center text-danger p-4">Could not load dashboard statistics.</p>;

    return (
        <div>
            <h1 className="mb-4">Admin Dashboard</h1>

            <div className="row g-4 my-4">
                <div className="col-lg-3 col-md-6">
                    <div className="stat-card">
                        <h5>Total Users</h5>
                        <h2>{stats.totalUsers}</h2>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="stat-card">
                        <h5>Total Deposits</h5>
                        <h2 className="text-success">${stats.totalDeposits.toFixed(2)}</h2>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="stat-card">
                        <h5>Total Withdrawals</h5>
                        <h2 className="text-warning">${stats.totalWithdrawals.toFixed(2)}</h2>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="stat-card">
                        <h5>Pending Transactions</h5>
                        <h2 className="text-info">{stats.pendingTransactions}</h2>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <h3 className="mb-3">Admin Performance</h3>
                <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle performance-table">
                        <thead>
                        <tr>
                            <th>Admin Name</th>
                            <th>Total Deposits Handled</th>
                            <th>Total Withdrawals Handled</th>
                            <th>Profit</th>
                        </tr>
                        </thead>
                        <tbody>
                        {performance.map((admin, index) => (
                            <tr key={index}>
                                <td>{admin.adminName}</td>
                                <td className="text-success">+ ${admin.totalDeposits.toFixed(2)}</td>
                                <td className="text-warning">- ${admin.totalWithdrawals.toFixed(2)}</td>
                                <td className={`fw-bold ${admin.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                                    ${admin.profit.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;