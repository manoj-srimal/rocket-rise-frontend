import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const GameSignals = () => {
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Refresh කරන වෙලාවට loading state එකක් පාලනය කරන්න
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Data fetch කරන logic එක, වෙනම function එකකට ගන්නවා
    const fetchSignals = async () => {
        // Refresh button එක click කළොත් isRefreshing true කරනවා
        if (!loading) setIsRefreshing(true);

        try {
            const response = await api.get('/admin/signals');
            setSignals(response.data);
        } catch (error) {
            toast.error("Could not fetch game signals. You may not have Super Admin privileges.");
        } finally {
            setLoading(false);
            setIsRefreshing(false); // Data load වෙලා ඉවර වුණාම isRefreshing false කරනවා
        }
    };

    // Component එක මුලින්ම load වෙනකොට signals ටික fetch කරනවා
    useEffect(() => {
        fetchSignals();
    }, []);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Upcoming Game Signals</h1>
                {/* --- අලුතෙන් එකතු කරන Refresh Button එක --- */}
                <button
                    className="btn btn-primary"
                    onClick={fetchSignals}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <p className="text-muted mb-4">This table shows the predetermined crash points for the next 10 upcoming rounds. This is visible only to Super Admins.</p>

            {loading ? <p>Loading signals...</p> : (
                <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Game ID</th>
                            <th>Crash Point</th>
                        </tr>
                        </thead>
                        <tbody>
                        {signals.map((signal, index) => (
                            <tr key={signal.gameId}>
                                <td>{index + 1}</td>
                                <td>{signal.gameId}</td>
                                <td className={`fw-bold ${signal.crashPoint >= 2 ? 'text-success' : 'text-danger'}`}>
                                    {signal.crashPoint.toFixed(2)}x
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default GameSignals;