import React, { useState, useEffect, useRef } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import api from '../api/axiosConfig';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import GameAnimation from './GameAnimation';
import RoundHistory from './RoundHistory';
import BetControls from './BetControls';
import { toast } from 'react-toastify';
import LiveBets from "./LiveBets";

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [multiplier, setMultiplier] = useState(1.00);
    const [gameStatus, setGameStatus] = useState('WAITING');
    const [countdown, setCountdown] = useState(10);
    const stompClientRef = useRef(null);

    // --- Bet panels දෙකේම state එක මෙතන තියාගන්නවා ---
    const [bets, setBets] = useState({
        panel1: { id: null, amount: 20, status: 'IDLE' }, // IDLE, PENDING, PLACED, WON
        panel2: { id: null, amount: 20, status: 'IDLE' }
    });

    // Game එක WAITING වෙනකොට bet states reset කරනවා
    useEffect(() => {
        if (gameStatus === 'WAITING' || gameStatus === 'COMPLETED') {
            setBets(prev => ({
                panel1: { ...prev.panel1, id: null, status: 'IDLE' },
                panel2: { ...prev.panel2, id: null, status: 'IDLE' }
            }));
        }
    }, [gameStatus]);

    // User data fetch කරන useEffect එක
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const fetchUserData = async () => {
            try {
                const response = await api.get('/user/me');
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user data", error);
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [navigate]);

    // WebSocket connection එක සඳහා useEffect hook එක
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: { 'Authorization': `Bearer ${token}` },
            onConnect: () => {
                console.log('WebSocket Connected with Authentication!');
                stompClientRef.current = client;

                client.subscribe('/topic/game-updates', (message) => {
                    const gameUpdate = JSON.parse(message.body);
                    setMultiplier(gameUpdate.multiplier);
                    setGameStatus(gameUpdate.status);
                    setCountdown(gameUpdate.countdown);
                });
                client.subscribe('/user/queue/errors', (message) => { toast.error(message.body); });
                client.subscribe('/user/queue/balance', (message) => {
                    const newBalance = JSON.parse(message.body);
                    setUser(prevUser => ({ ...prevUser, balance: newBalance }));
                });
                client.subscribe('/user/queue/notifications', (message) => { toast.success(message.body); });

                client.subscribe('/user/queue/bet-confirmations', (message) => {
                    const confirmation = JSON.parse(message.body);
                    toast.info(`Bet of $${confirmation.betAmount.toFixed(2)} placed!`);
                    setBets(prev => ({
                        ...prev,
                        [confirmation.panelId]: { ...prev[confirmation.panelId], status: 'PLACED', id: confirmation.betId }
                    }));
                });
            },
            onStompError: (frame) => { console.error(frame); },
        });

        client.activate();
        return () => { if (client.active) client.deactivate(); };
    }, []);

    // Bet එකක් place කරන function එක
    const handlePlaceBet = (panelId, amount, autoCashOutTarget) => {
        if (stompClientRef.current?.active) {
            setBets(prev => ({ ...prev, [panelId]: { ...prev[panelId], status: 'PENDING', amount: amount }}));
            stompClientRef.current.publish({
                destination: '/app/game/bet',
                body: JSON.stringify({ betAmount: amount, panelId: panelId, autoCashOutAt: autoCashOutTarget })
            });
        }
    };

    // Cash out කරන function එක
    const handleCashOut = (betId) => {
        if (stompClientRef.current?.active && betId) {
            stompClientRef.current.publish({
                destination: '/app/game/cashout',
                body: JSON.stringify({ betId: betId })
            });
            // UI එකේදී cashed out status එක වෙනස් කරනවා
            setBets(prev => {
                const newBets = { ...prev };
                if (newBets.panel1.id === betId) newBets.panel1.status = 'WON';
                if (newBets.panel2.id === betId) newBets.panel2.status = 'WON';
                return newBets;
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return <div className="container text-center text-white mt-5"><h1>Loading...</h1></div>;
    }

    return (
        <div className="dashboard-root">
            <header className="top-bar">
                <div className="top-bar-left">
                    <h3><Link to="/account" className="text-white text-decoration-none">Welcome, {user.firstName}!</Link></h3>
                </div>
                <div className="top-bar-right">
                    {user && (
                        <div className='user-balance-info'>
                            <span>Balance: </span>
                            <span className="balance-amount">${user.balance.toFixed(2)}</span>
                        </div>
                    )}
                    <button onClick={handleLogout} className="btn btn-danger btn-sm logout-button">Logout</button>
                </div>
            </header>

            <main className="main-content">
                <p className="tagline text-center">Your game journey starts here.</p>
                <RoundHistory gameStatus={gameStatus} />
                <div className="game-area-card glass-card">
                    <div className="card-body">
                        <GameAnimation multiplier={multiplier} status={gameStatus} countdown={countdown} />
                        {gameStatus === 'WAITING' && countdown > 0 && (
                            <div className="countdown-overlay">
                                Next Round in <span className="countdown-number">{countdown}</span>s
                            </div>
                        )}
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-lg-6 mb-3">
                        <BetControls
                            betState={bets.panel1}
                            onPlaceBet={(amount, autoCashOutTarget) => handlePlaceBet('panel1', amount, autoCashOutTarget)}
                            onCashOut={() => handleCashOut(bets.panel1.id)}
                            gameStatus={gameStatus}
                            currentMultiplier={multiplier}
                        />
                    </div>
                    <div className="col-lg-6 mb-3">
                        <BetControls
                            betState={bets.panel2}
                            onPlaceBet={(amount, autoCashOutTarget) => handlePlaceBet('panel2', amount, autoCashOutTarget)}
                            onCashOut={() => handleCashOut(bets.panel2.id)}
                            gameStatus={gameStatus}
                            currentMultiplier={multiplier}
                        />
                    </div>
                </div>
                <LiveBets stompClient={stompClientRef.current} gameStatus={gameStatus} />
            </main>
        </div>
    );
}

export default Dashboard;