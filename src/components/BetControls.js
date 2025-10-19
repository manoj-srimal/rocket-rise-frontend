import React, { useState, useEffect } from 'react';

const BetControls = ({ betState, onPlaceBet, onCashOut, gameStatus, currentMultiplier }) => {
    const [betAmount, setBetAmount] = useState(20.00);
    const [isAuto, setIsAuto] = useState(false);

    // --- Auto Bet සහ Auto Cash Out සඳහා අලුත් states ---
    const [isAutoBetActive, setIsAutoBetActive] = useState(false);
    const [isAutoCashOutEnabled, setIsAutoCashOutEnabled] = useState(false);
    const [autoCashOutValue, setAutoCashOutValue] = useState(2.00);

    // --- Auto Bet Logic එක සඳහා useEffect ---
    useEffect(() => {
        // Auto Bet on වෙලා, game එක waiting state එකේ, සහ තවම bet එකක් තියලා නැත්නම්
        if (isAutoBetActive && gameStatus === 'WAITING' && betState.status === 'IDLE') {
            const cashOutTarget = isAutoCashOutEnabled ? autoCashOutValue : null;
            onPlaceBet(betAmount, cashOutTarget);
        }
    }, [gameStatus, isAutoBetActive, betState.status, onPlaceBet, betAmount, isAutoCashOutEnabled, autoCashOutValue]);

    // --- Auto Cash Out Logic එක සඳහා useEffect ---
    useEffect(() => {
        // Auto Cash Out on වෙලා, bet එකක් තියලා, cash out කරලා නැත්නම්, සහ multiplier එක target එකට ආවොත්
        if (isAutoCashOutEnabled && betState.status === 'PLACED' && currentMultiplier >= autoCashOutValue) {
            onCashOut();
        }
    }, [currentMultiplier, isAutoCashOutEnabled, betState.status, onCashOut, autoCashOutValue]);

    const handleManualPlaceBet = () => {
        const cashOutTarget = isAutoCashOutEnabled ? autoCashOutValue : null;
        onPlaceBet(betAmount, cashOutTarget);
    };

    const handleToggleAutoBet = () => {
        setIsAutoBetActive(prev => !prev);
    };

    // --- Manual Bet Button Logic ---
    let manualButtonText = "Place Bet";
    let manualButtonClass = "btn-success";
    let isManualButtonDisabled = false;
    let manualButtonAction = handleManualPlaceBet;

    if (betState.status === 'WON') {
        manualButtonText = "Cashed Out!";
        manualButtonClass = "btn-info";
        isManualButtonDisabled = true;
    } else if (gameStatus === 'RUNNING') {
        if (betState.status === 'PLACED') {
            manualButtonText = `Cash Out @ ${currentMultiplier.toFixed(2)}x`;
            manualButtonClass = "btn-warning";
            isManualButtonDisabled = false;
            manualButtonAction = onCashOut;
        } else {
            manualButtonText = "Waiting...";
            manualButtonClass = "btn-secondary";
            isManualButtonDisabled = true;
        }
    } else { // WAITING or COMPLETED
        if(betState.status === 'PLACED' || betState.status === 'PENDING') {
            manualButtonText = "Bet Placed";
            manualButtonClass = "btn-secondary";
            isManualButtonDisabled = true;
        } else { // IDLE
            manualButtonText = "Place Bet";
            manualButtonClass = "btn-success";
            isManualButtonDisabled = false;
            manualButtonAction = handleManualPlaceBet;
        }
    }

    const isInputDisabled = betState.status !== 'IDLE' && !isAuto;

    return (
        <div className="bet-controls-container glass-card">
            <div className="bet-auto-toggle">
                <button className={!isAuto ? 'active' : ''} onClick={() => setIsAuto(false)}>Bet</button>
                <button className={isAuto ? 'active' : ''} onClick={() => setIsAuto(true)}>Auto</button>
            </div>

            {/* Manual Bet UI */}
            {!isAuto && (
                <>
                    <div className="controls-main">
                        <div className="bet-input-section">
                            <label>Bet Amount</label>
                            <div className="input-group">
                                <button className="btn btn-secondary btn-sm" onClick={() => setBetAmount(prev => Math.max(0, prev - 10))} disabled={isInputDisabled}>-</button>
                                <input type="number" className="form-control bet-input" value={betAmount.toFixed(2)} onChange={(e) => setBetAmount(parseFloat(e.target.value))} disabled={isInputDisabled} />
                                <button className="btn btn-secondary btn-sm" onClick={() => setBetAmount(prev => prev + 10)} disabled={isInputDisabled}>+</button>
                            </div>
                        </div>
                        <div className="bet-action-section">
                            <button className={`btn btn-lg place-bet-btn ${manualButtonClass}`} onClick={manualButtonAction} disabled={isManualButtonDisabled}>
                                {manualButtonText}
                            </button>
                        </div>
                    </div>
                    <div className="auto-cashout-section mt-3">
                        <div className="form-check form-switch d-flex align-items-center">
                            <input className="form-check-input me-2" type="checkbox" role="switch" checked={isAutoCashOutEnabled} onChange={(e) => setIsAutoCashOutEnabled(e.target.checked)} disabled={isInputDisabled} />
                            <label className="form-check-label">Auto Cash Out</label>
                        </div>
                        {isAutoCashOutEnabled && (
                            <div className="input-group mt-2">
                                <input type="number" className="form-control bet-input" value={autoCashOutValue.toFixed(2)} onChange={e => setAutoCashOutValue(parseFloat(e.target.value))} disabled={isInputDisabled} />
                                <span className="input-group-text">x</span>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Auto Bet UI */}
            {isAuto && (
                <div className="controls-main-auto">
                    <div className="bet-input-section">
                        <label>Base Bet</label>
                        <div className="input-group">
                            <button className="btn btn-secondary btn-sm" onClick={() => setBetAmount(prev => Math.max(0, prev - 10))}>-</button>
                            <input type="number" className="form-control bet-input" value={betAmount.toFixed(2)} onChange={(e) => setBetAmount(parseFloat(e.target.value))} />
                            <button className="btn btn-secondary btn-sm" onClick={() => setBetAmount(prev => prev + 10)}>+</button>
                        </div>
                    </div>
                    <div className="auto-cashout-section">
                        <label>Auto Cash Out</label>
                        <div className="input-group">
                            <input type="number" className="form-control bet-input" value={autoCashOutValue.toFixed(2)} onChange={e => setAutoCashOutValue(parseFloat(e.target.value))} />
                            <span className="input-group-text">x</span>
                        </div>
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" role="switch" checked={isAutoCashOutEnabled} onChange={e => setIsAutoCashOutEnabled(e.target.checked)} />
                        </div>
                    </div>
                    <div className="bet-action-section">
                        <button className={`btn btn-lg place-bet-btn ${isAutoBetActive ? 'btn-danger' : 'btn-success'}`} onClick={handleToggleAutoBet}>
                            {isAutoBetActive ? 'Stop Auto Bet' : 'Start Auto Bet'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BetControls;