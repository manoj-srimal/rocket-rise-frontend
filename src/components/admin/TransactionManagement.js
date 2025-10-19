import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const TransactionManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const url = searchTerm ? `/admin/transactions/search?query=${searchTerm}` : '/admin/transactions';
            const response = await api.get(url);
            setTransactions(response.data);
        } catch (error) {
            toast.error("Could not fetch transactions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTransactions();
    };

    const handleProcess = (transactionId, newStatus) => {
        MySwal.fire({
            title: `Confirm ${newStatus}`,
            html: `Are you sure you want to <strong>${newStatus.toLowerCase()}</strong> this transaction?`,
            icon: newStatus === 'COMPLETED' ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, ${newStatus.toLowerCase()} it!`,
            confirmButtonColor: newStatus === 'COMPLETED' ? '#28a745' : '#dc3545',
            cancelButtonColor: '#6c757d',
            background: '#2c2c38',
            color: 'white'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.put(`/admin/transactions/${transactionId}/process`, { status: newStatus });
                    toast.success(`Transaction has been ${newStatus.toLowerCase()}.`);
                    fetchTransactions();
                } catch (error) {
                    toast.error(error.response?.data || "Failed to process transaction.");
                }
            }
        });
    };

    if (loading && transactions.length === 0) return <p className="text-center p-4">Loading transactions...</p>;

    return (
        <div className="transaction-management-page">
            <h1 className="mb-4">Transaction Management</h1>

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
                        <th>User ID</th>
                        <th>User Name</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Details</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {transactions.length > 0 ? transactions.map(tx => (
                        <tr key={tx.transactionId}>
                            <td className="font-monospace">{tx.userPublicId}</td>
                            <td>{tx.userName}</td>
                            <td><span className={`badge ${tx.type === 'DEPOSIT' ? 'bg-success' : 'bg-warning text-dark'}`}>{tx.type}</span></td>
                            <td className="fw-bold">${tx.amount.toFixed(2)}</td>
                            <td>
                                {tx.type === 'DEPOSIT' ? (
                                    tx.receiptUrl ? <a href={tx.receiptUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info">View</a> : 'N/A'
                                ) : (
                                    <pre className="withdrawal-details">{tx.withdrawalMethodDetails}</pre>
                                )}
                            </td>
                            <td>{new Date(tx.createdAt).toLocaleString()}</td>
                            <td><span className={`status-badge status-${tx.status.toLowerCase()}`}>{tx.status}</span></td>
                            <td>
                                {tx.status === 'PENDING' && (
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-success" onClick={() => handleProcess(tx.transactionId, 'COMPLETED')}>Approve</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleProcess(tx.transactionId, 'REJECTED')}>Reject</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="8" className="text-center p-4">No transactions found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionManagement;