import React, { useState, useEffect } from 'react';
import './LiveBets.css';

const LiveBets = ({ stompClient, gameStatus }) => {
    const [liveBets, setLiveBets] = useState([]);

    useEffect(() => {
        if (gameStatus === 'WAITING' || gameStatus === 'COMPLETED') {
            setLiveBets([]); 
        }
    }, [gameStatus]);

    useEffect(() => {
        if (stompClient && stompClient.active) {
            const subscription = stompClient.subscribe('/topic/live-bets', (message) => {
                const newBet = JSON.parse(message.body);
                setLiveBets(prevBets => {
                    // Already exists? Update it (for cash out)
                    const existingBetIndex = prevBets.findIndex(b => b.username === newBet.username);
                    if (existingBetIndex > -1) {
                        const updatedBets = [...prevBets];
                        updatedBets[existingBetIndex] = newBet;
                        return updatedBets;
                    }
                    // New bet? Add it
                    return [...prevBets, newBet];
                });
            });
            return () => subscription.unsubscribe();
        }
    }, [stompClient]);

    return (
        <div className="live-bets-container glass-card mt-4">
            <h5 className="text-center mb-3">Current Round Bets</h5>
            <div className="live-bets-list">
                {liveBets.map((bet, index) => (
                    <div key={index} className={`live-bet-item ${bet.status === 'WON' ? 'cashed-out' : ''}`}>
                        <span className="username">{bet.username}</span>
                        <span className="bet-amount">${bet.betAmount.toFixed(2)}</span>
                        {bet.status === 'WON' ? (
                            <span className="cashout-info">
                                Cashed Out @ <span className="cashout-multiplier">{bet.cashOutAt.toFixed(2)}x</span>
                            </span>
                        ) : (
                            <span className="status-placed">Playing...</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveBets;