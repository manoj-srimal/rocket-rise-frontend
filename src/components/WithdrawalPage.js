import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

const WithdrawalPage = () => {
    const [amount, setAmount] = useState('');
    const [selectedMethodId, setSelectedMethodId] = useState('');
    const [methods, setMethods] = useState([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [methodsRes, userRes] = await Promise.all([
                api.get('/withdrawal-methods'),
                api.get('/user/me')
            ]);
            setMethods(methodsRes.data);
            setBalance(userRes.data.balance);
            if (methodsRes.data.length > 0) {
                setSelectedMethodId(methodsRes.data[0].id);
            }
        } catch (error) {
            toast.error("Could not load withdrawal data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleWithdrawal = async (e) => {
        e.preventDefault();
        const withdrawalAmount = parseFloat(amount);
        if (!selectedMethodId) {
            toast.error("Please select a withdrawal method. You can add one in 'Withdrawal Methods' tab.");
            return;
        }
        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }
        if (withdrawalAmount > balance) {
            toast.error("Withdrawal amount cannot exceed your balance.");
            return;
        }
        try {
            const response = await api.post('/transactions/withdraw', {
                amount: parseFloat(amount),
                withdrawalMethodId: parseInt(selectedMethodId) // <-- වැදගත්ම line එක
            });
            toast.success(response.data);
        } catch (error) {
            toast.error(error.response?.data || "Withdrawal request failed.");
        }
    };

    if (loading) return <p className="p-4 text-center">Loading...</p>;

    return (
        <div className="p-4">
            <h3 className="card-title">Withdraw Funds</h3>
            <p className="text-muted">Your current balance is <strong className="text-success">${balance.toFixed(2)}</strong>.</p>
            <p className="text-muted mb-4">Your withdrawal request will be reviewed and processed by an administrator.</p>

            {methods.length > 0 ? (
                <form onSubmit={handleWithdrawal}>
                    <div className="mb-3">
                        <label className="form-label">Select Withdrawal Method</label>
                        <select
                            className="form-select"
                            value={selectedMethodId}
                            onChange={e => setSelectedMethodId(e.target.value)}
                        >
                            {methods.map(method => (
                                <option key={method.id} value={method.id}>
                                    {method.methodName} (...{method.accountNumber.slice(-4)})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="withdrawalAmount" className="form-label">Amount ($)</label>
                        <input
                            type="number"
                            className="form-control"
                            id="withdrawalAmount"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                            min="1"
                            step="0.01"
                            max={balance}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Submit Withdrawal Request</button>
                </form>
            ) : (
                <div className="alert alert-warning">
                    You have no saved withdrawal methods. Please add a method in the 'Withdrawal Methods' tab before requesting a withdrawal.
                </div>
            )}
        </div>
    );
};

export default WithdrawalPage;