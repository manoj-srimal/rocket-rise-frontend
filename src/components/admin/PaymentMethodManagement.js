import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const PaymentMethodManagement = () => {
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newMethod, setNewMethod] = useState({
        type: 'BANK', name: '', accountName: '', accountNumber: '', branch: '', description: ''
    });

    const fetchMethods = async () => {
        setLoading(true);
        try {
            const response = await api.get('/payment-methods/all');
            setMethods(response.data);
        } catch (error) {
            toast.error("Could not fetch payment methods.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMethods(); }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMethod(prev => ({ ...prev, [name]: value }));
    };

    const handleAddMethod = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/payment-methods', newMethod);
            toast.success("Payment method added successfully!");
            setNewMethod({ type: 'BANK', name: '', accountName: '', accountNumber: '', branch: '', description: '' });
            fetchMethods();
        } catch (error) {
            toast.error("Failed to add method.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.put(`/payment-methods/${id}/toggle`);
            toast.success("Status updated successfully!");
            fetchMethods();
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    const handleDelete = (id) => {
        MySwal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            background: '#2c2c38', color: 'white'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/payment-methods/${id}`);
                    toast.success("Method deleted.");
                    fetchMethods();
                } catch (error) {
                    toast.error("Failed to delete method.");
                }
            }
        });
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="user-management-page">
            <h1 className="mb-4">Payment Methods</h1>

            {/* Add New Method Form */}
            <div className="glass-card p-4 mb-5">
                <h4 className="mb-3">Add New Payment Method</h4>
                <form onSubmit={handleAddMethod}>
                    <div className="row">
                        <div className="col-md-4 mb-3"><select name="type" className="form-select" value={newMethod.type} onChange={handleInputChange}><option value="BANK">Bank</option><option value="CRYPTO">Crypto</option><option value="E_WALLET">E-Wallet</option></select></div>
                        <div className="col-md-4 mb-3"><input type="text" name="name" placeholder="Method Name (e.g., Commercial Bank)" className="form-control" value={newMethod.name} onChange={handleInputChange} required /></div>
                        <div className="col-md-4 mb-3"><input type="text" name="accountName" placeholder="Account Holder Name" className="form-control" value={newMethod.accountName} onChange={handleInputChange} required /></div>
                        <div className="col-md-6 mb-3"><input type="text" name="accountNumber" placeholder="Account/Wallet Number" className="form-control" value={newMethod.accountNumber} onChange={handleInputChange} required /></div>
                        <div className="col-md-6 mb-3"><input type="text" name="branch" placeholder="Branch (for banks)" className="form-control" value={newMethod.branch} onChange={handleInputChange} /></div>
                        <div className="col-12 mb-3"><input type="text" name="description" placeholder="Short Description (optional)" className="form-control" value={newMethod.description} onChange={handleInputChange} /></div>
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Add Method'}</button>
                </form>
            </div>

            {/* Existing Methods Table */}
            <div className="table-responsive">
                <table className="table table-dark table-hover align-middle">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Account Details</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {methods.map(method => (
                        <tr key={method.id}>
                            <td><strong>{method.name}</strong><br/><small className="text-muted">{method.type}</small></td>
                            <td>
                                    <pre className="withdrawal-details">
                                        Holder: {method.accountName}{'\n'}
                                        Number: {method.accountNumber}{'\n'}
                                        {method.branch && `Branch: ${method.branch}`}
                                    </pre>
                            </td>
                            <td>
                                    <span className={`status-badge ${method.active ? 'status-active' : 'status-inactive'}`}>
                                        {method.active ? 'Active' : 'Inactive'}
                                    </span>
                            </td>
                            <td>
                                <div className="d-flex gap-2">
                                    <button className={`btn btn-sm ${method.active ? 'btn-outline-secondary' : 'btn-outline-success'}`} onClick={() => handleToggleStatus(method.id)}>
                                        {method.active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(method.id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default PaymentMethodManagement;