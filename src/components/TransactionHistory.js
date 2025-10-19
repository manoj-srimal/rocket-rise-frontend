import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/transactions/my-history')
            .then(response => setTransactions(response.data))
            .catch(err => toast.error("Could not load transactions."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="p-4">Loading history...</p>;

    return (
        <div className="p-4">
            <h3 className="card-title">Transaction History</h3>
            <div className="table-responsive">
                <table className="table table-dark table-hover">
                    <thead>
                    <tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                    {transactions.length > 0 ? transactions.map(tx => (
                        <tr key={tx.id}>
                            <td>{new Date(tx.createdAt).toLocaleString()}</td>
                            <td><span className={`badge ${tx.type === 'DEPOSIT' ? 'bg-success' : 'bg-warning text-dark'}`}>{tx.type}</span></td>
                            <td>${tx.amount.toFixed(2)}</td>
                            <td><span className={`status-badge status-${tx.status.toLowerCase()}`}>{tx.status}</span></td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4" className="text-center p-4">No transactions yet.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionHistory;