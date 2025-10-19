import React, { useRef, useEffect, useCallback, useState } from 'react';

const GameAnimation = ({ multiplier, status, countdown }) => {
    const canvasRef = useRef(null);
    const planeImage = useRef(new Image());
    const explosionImage = useRef(new Image());
    const animationFrameId = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const crashPointRef = useRef(1.00);

    useEffect(() => {
        let loadedCount = 0;
        const images = [planeImage.current, explosionImage.current];
        planeImage.current.src = '/plane.png';
        explosionImage.current.src = '/explosion.png';
        const onImageLoad = () => {
            loadedCount++;
            if (loadedCount === images.length) setImagesLoaded(true);
        };
        images.forEach(img => {
            img.onload = onImageLoad;
            img.onerror = () => { onImageLoad(); };
        });
    }, []);

    // --- මෙතන තමයි නිවැරදි කිරීම ---
    // dependency array එකට 'countdown' නැවත එකතු කළා
    const drawAnimation = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imagesLoaded) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const getPosition = (m) => {
            const time = Math.log(m) / Math.log(1.10);
            const x = 50 + time * 15;
            const y = (canvas.height - 50) - Math.pow(time, 1.7) * 0.8;
            return { x, y };
        };

        const progress = (status === 'WAITING' && countdown > 0) ? (10 - countdown) / 10 : 1;
        ctx.globalAlpha = (status === 'WAITING' && countdown > 0) ? progress : 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        if (status === 'RUNNING' || status === 'COMPLETED') {
            const pathMultiplier = (status === 'RUNNING') ? multiplier : crashPointRef.current;

            ctx.beginPath();
            const startPos = getPosition(1.00);
            ctx.moveTo(startPos.x, canvas.height);
            ctx.lineTo(startPos.x, startPos.y);
            for (let m = 1.01; m <= pathMultiplier; m += 0.05) {
                const pos = getPosition(m);
                ctx.lineTo(pos.x, pos.y);
            }
            const finalPos = getPosition(pathMultiplier);
            ctx.lineTo(finalPos.x, finalPos.y);
            ctx.lineTo(finalPos.x, canvas.height);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, "rgba(230, 70, 93, 0.05)");
            gradient.addColorStop(1, "rgba(230, 70, 93, 0.5)");
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            for (let m = 1.01; m <= pathMultiplier; m += 0.01) {
                const pos = getPosition(m);
                ctx.lineTo(pos.x, pos.y);
            }
            ctx.lineWidth = 4;
            ctx.strokeStyle = (status === 'RUNNING') ? '#e6465d' : '#ff4d4d';
            ctx.stroke();

            if (status === 'RUNNING') {
                ctx.save();
                ctx.translate(finalPos.x, finalPos.y);
                const prevPos = getPosition(pathMultiplier > 1.01 ? pathMultiplier - 0.01 : 1.00);
                const angle = Math.atan2(finalPos.y - prevPos.y, finalPos.x - prevPos.x);
                ctx.rotate(angle);
                ctx.drawImage(planeImage.current, -35, -25, 70, 50);
                ctx.restore();
            } else {
                ctx.drawImage(explosionImage.current, finalPos.x - 50, finalPos.y - 50, 100, 100);
            }
        }
    }, [status, multiplier, imagesLoaded, countdown]); // 'countdown' නැවත එකතු කළා

    useEffect(() => {
        if (!imagesLoaded) return;
        const canvas = canvasRef.current;
        const resizeCanvas = () => {
            if (canvas && canvas.parentElement) {
                canvas.width = canvas.parentElement.offsetWidth;
                canvas.height = canvas.parentElement.offsetHeight;
            }
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animationFrameId.current = requestAnimationFrame(drawAnimation);
        return () => {
            cancelAnimationFrame(animationFrameId.current);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [drawAnimation, imagesLoaded]);

    useEffect(() => {
        if (status === 'COMPLETED') {
            crashPointRef.current = multiplier;
        }
    }, [status, multiplier]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            <div className="multiplier-text" style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                color: status === 'COMPLETED' ? '#ff4d4d' : 'white',
                fontWeight: 'bold', textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
            }}>
                {status === 'COMPLETED' ? `Crashed @ ${crashPointRef.current.toFixed(2)}x` : `${multiplier.toFixed(2)}x`}
            </div>
        </div>
    );
};

export default GameAnimation;