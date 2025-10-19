import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import axios from 'axios';

const DepositPage = () => {
    const [amount, setAmount] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewSource, setPreviewSource] = useState('');
    const [uploading, setUploading] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loadingMethods, setLoadingMethods] = useState(true);

    useEffect(() => {
        const fetchMethods = async () => {
            try {
                const response = await api.get('/payment-methods');
                setPaymentMethods(response.data);
            } catch (error) {
                console.error("Could not load payment methods", error);
                toast.error("Could not load payment methods.");
            } finally {
                setLoadingMethods(false);
            }
        };
        fetchMethods();
    }, []);

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            previewFile(file);
        }
    };

    const previewFile = (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setPreviewSource(reader.result);
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            toast.error("Please enter a valid amount greater than zero.");
            return;
        }
        if (!selectedFile) {
            toast.error("Please upload a receipt image.");
            return;
        }

        setUploading(true);
        toast.info("Submitting your request...");

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('upload_preset', 'YOUR_UPLOAD_PRESET_NAME'); // <-- ඔබේ preset නම මෙතනට දාන්න

            const cloudinaryResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, // <-- ඔබේ cloud name එක මෙතනට දාන්න
                formData
            );

            const receiptUrl = cloudinaryResponse.data.secure_url;

            const response = await api.post('/transactions/deposit', {
                amount: depositAmount,
                receiptUrl: receiptUrl
            });

            toast.success(response.data);
            setAmount('');
            setSelectedFile(null);
            setPreviewSource('');
        } catch (error) {
            toast.error(error.response?.data || "Deposit request failed.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4">
            <h3 className="card-title">Deposit Funds</h3>

            {loadingMethods ? <p>Loading payment methods...</p> : (
                paymentMethods.length > 0 ? (
                    <>
                        <p className="text-muted mb-3">Please make your payment to one of the following methods:</p>
                        <div className="payment-methods-grid">
                            {paymentMethods.map(method => (
                                <div key={method.id} className="payment-method-card">
                                    <h5>{method.name} ({method.type})</h5>
                                    <pre>
                                        Acc Name: {method.accountName}{'\n'}
                                        Acc Number: {method.accountNumber}{'\n'}
                                        {method.branch && `Branch: ${method.branch}`}
                                    </pre>
                                    {method.description && <small className="text-muted d-block mt-2">{method.description}</small>}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-warning">No active payment methods found. Please contact support.</p>
                )
            )}

            <hr className="my-4" />

            <p className="text-muted mb-4">After making the payment, please fill the form below and upload the receipt.</p>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="depositAmount" className="form-label">Amount ($)</label>
                    <input type="number" className="form-control" id="depositAmount" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required min="1" step="0.01" disabled={uploading}/>
                </div>

                <div className="mb-3">
                    <label htmlFor="receiptFile" className="form-label">Payment Receipt</label>
                    <input type="file" className="form-control" id="receiptFile" onChange={handleFileInputChange} accept="image/*" required disabled={uploading}/>
                </div>

                {previewSource && (
                    <div className="mb-3 text-center">
                        <img src={previewSource} alt="Receipt Preview" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                    </div>
                )}

                <button type="submit" className="btn btn-primary w-100" disabled={uploading}>
                    {uploading ? 'Submitting...' : 'Submit Deposit Request'}
                </button>
            </form>
        </div>
    );
};

export default DepositPage;