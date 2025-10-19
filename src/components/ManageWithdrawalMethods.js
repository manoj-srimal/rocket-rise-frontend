import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

const ManageWithdrawalMethods = () => {
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newMethod, setNewMethod] = useState({
        methodType: 'BANK',
        methodName: '',
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        branchName: ''
    });

    const fetchMethods = async () => {
        try {
            const response = await api.get('/withdrawal-methods');
            setMethods(response.data);
        } catch (error) {
            toast.error("Could not load withdrawal methods.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMethod(prev => ({ ...prev, [name]: value }));
    };

    const handleAddMethod = async (e) => {
        e.preventDefault();
        if (!newMethod.methodName || !newMethod.accountHolderName || !newMethod.accountNumber || !newMethod.bankName) {
            toast.error("Please fill all required fields.");
            return;
        }
        setIsSubmitting(true);
        try {
            await api.post('/withdrawal-methods', newMethod);
            toast.success("Withdrawal method added successfully!");
            setNewMethod({ methodType: 'BANK', methodName: '', accountHolderName: '', accountNumber: '', bankName: '', branchName: '' });
            fetchMethods();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add method.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMethod = async (id) => {
        if (window.confirm("Are you sure you want to delete this withdrawal method?")) {
            try {
                await api.delete(`/withdrawal-methods/${id}`);
                toast.success("Method deleted successfully!");
                fetchMethods();
            } catch (error) {
                toast.error("Failed to delete method.");
            }
        }
    };

    if (loading) {
        return <p className="p-4 text-center">Loading withdrawal methods...</p>;
    }

    return (
        <div className="p-4">
            <h3 className="card-title">My Withdrawal Methods</h3>
            <p className="text-muted mb-4">Manage your saved bank accounts for withdrawals.</p>

            <div className="mb-4">
                {methods.length > 0 ? (
                    methods.map(method => (
                        <div key={method.id} className="saved-method-card">
                            <div>
                                <strong>{method.methodName}</strong> ({method.bankName})
                                <small className="d-block text-muted">{method.accountNumber}</small>
                            </div>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteMethod(method.id)}>Delete</button>
                        </div>
                    ))
                ) : (
                    <p>You have no saved withdrawal methods yet.</p>
                )}
            </div>

            <hr className="my-4" />

            <h4 className="mt-4">Add New Method</h4>
            <form onSubmit={handleAddMethod}>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Method Nickname</label>
                        <input type="text" name="methodName" placeholder="e.g., My BOC Savings" className="form-control" value={newMethod.methodName} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Account Holder Name</label>
                        <input type="text" name="accountHolderName" placeholder="Manoj Srimal" className="form-control" value={newMethod.accountHolderName} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Bank Name</label>
                        <input type="text" name="bankName" placeholder="Bank of Ceylon" className="form-control" value={newMethod.bankName} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Branch Name</label>
                        <input type="text" name="branchName" placeholder="Colombo Main" className="form-control" value={newMethod.branchName} onChange={handleInputChange} />
                    </div>
                    <div className="col-12 mb-3">
                        <label className="form-label">Account Number</label>
                        <input type="text" name="accountNumber" placeholder="Enter your full account number" className="form-control" value={newMethod.accountNumber} onChange={handleInputChange} required />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 mt-3" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save New Method'}
                </button>
            </form>
        </div>
    );
};

export default ManageWithdrawalMethods;