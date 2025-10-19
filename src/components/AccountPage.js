import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileDetails from './ProfileDetails';
import TransactionHistory from './TransactionHistory';
import DepositPage from './DepositPage';
import WithdrawalPage from './WithdrawalPage';
import ManageWithdrawalMethods from './ManageWithdrawalMethods'; // <-- අලුත් import එක

const AccountPage = () => {
    const [activeView, setActiveView] = useState('profile');

    const renderView = () => {
        switch (activeView) {
            case 'history': return <TransactionHistory />;
            case 'deposit': return <DepositPage />;
            case 'withdraw': return <WithdrawalPage />;
            case 'methods': return <ManageWithdrawalMethods />; // <-- අලුත් case එක
            case 'profile':
            default:
                return <ProfileDetails />;
        }
    };

    return (
        <div className="account-page-container">
            <Link to="/dashboard" className="btn btn-secondary mb-4">{'<'} Back to Game</Link>

            <div className="row">
                <div className="col-lg-3 mb-4">
                    <div className="card glass-card account-nav">
                        <ul className="list-group list-group-flush">
                            <li className={`list-group-item ${activeView === 'profile' ? 'active' : ''}`} onClick={() => setActiveView('profile')}>My Profile</li>
                            <li className={`list-group-item ${activeView === 'history' ? 'active' : ''}`} onClick={() => setActiveView('history')}>Transaction History</li>
                            <li className={`list-group-item ${activeView === 'deposit' ? 'active' : ''}`} onClick={() => setActiveView('deposit')}>Deposit</li>
                            <li className={`list-group-item ${activeView === 'withdraw' ? 'active' : ''}`} onClick={() => setActiveView('withdraw')}>Withdraw</li>
                            {/* --- අලුත් Tab එක --- */}
                            <li className={`list-group-item ${activeView === 'methods' ? 'active' : ''}`} onClick={() => setActiveView('methods')}>Withdrawal Methods</li>
                        </ul>
                    </div>
                </div>

                <div className="col-lg-9">
                    <div className="card glass-card account-content">
                        {renderView()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;