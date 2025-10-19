import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler // Filler plugin එක import කිරීම
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler // Filler plugin එක register කිරීම
);

const GameChart = ({ multiplier, status }) => {
    const [chartData, setChartData] = useState({
        labels: [1],
        datasets: [{
            data: [1],
            borderColor: '#e6465d',
            backgroundColor: 'transparent', // Gradient එක පස්සේ add කරනවා
            tension: 0.4,
            pointRadius: 0,
            fill: true, // Line එකට යටින් fill කරන්න කියනවා
        }]
    });

    const chartRef = useRef(null);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        // Gradient එක නිර්මාණය කිරීම
        const gradient = chart.ctx.createLinearGradient(0, chart.chartArea.bottom, 0, chart.chartArea.top);
        gradient.addColorStop(0, 'rgba(230, 70, 93, 0)');
        gradient.addColorStop(1, 'rgba(230, 70, 93, 0.4)');
        chart.data.datasets[0].backgroundColor = gradient;

        if (status === 'RUNNING') {
            chart.data.labels.push(multiplier.toFixed(2));
            chart.data.datasets[0].data.push(multiplier);
        } else if (status === 'COMPLETED') {
            chart.data.datasets[0].borderColor = '#ff4d4d'; // Crash color
        } else if (status === 'WAITING' && chartData.labels.length > 1) {
            chart.data.labels = [1];
            chart.data.datasets[0].data = [1];
            chart.data.datasets[0].borderColor = '#e6465d';
        }
        chart.update('none');

    }, [multiplier, status, chartData.labels.length]);

    const options = {
        // ... (options වල වෙනසක් නෑ, කලින් වගේමයි)
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '300px' }}>
            <Line ref={chartRef} options={options} data={chartData} />
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                color: status === 'COMPLETED' ? '#ff4d4d' : 'white',
                fontSize: '6rem',
                fontWeight: 'bold',
            }}>
                {status === 'COMPLETED' ? `Crashed @ ${multiplier.toFixed(2)}x` : `${multiplier.toFixed(2)}x`}
            </div>
        </div>
    );
};

export default GameChart;