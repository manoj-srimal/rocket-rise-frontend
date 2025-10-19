import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

const RoundHistory = ({ gameStatus }) => {
    const [history, setHistory] = useState([]);
    const prevGameStatusRef = useRef();

    const fetchHistory = async () => {
        try {
            console.log("Fetching new history...");
            const response = await api.get('/game/history');
            setHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch game history", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        if (prevGameStatusRef.current === 'RUNNING' && gameStatus === 'COMPLETED') {
            setTimeout(fetchHistory, 1000);
        }

        prevGameStatusRef.current = gameStatus;
    }, [gameStatus]);

    return (
        <div className="round-history-bar">
            {history.map((multiplier, index) => (
                <span
                    key={index}
                    className={`history-item ${multiplier >= 2 ? 'high-multiplier' : 'low-multiplier'}`}
                >
                    {multiplier.toFixed(2)}x
                </span>
            ))}
        </div>
    );
};

export default RoundHistory;