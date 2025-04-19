import React from 'react'
import "./StatusBar.css";

type CardInfo = {
    name: string,
    sharpe: number,
    days: number;
    lastPrice: number;
    amount?: number;
    position?: number;
}

type Props = {
    portfolio: CardInfo[];
    totalValue: number;
};

const getSharpeColor = (value: number): string => {
    if (isNaN(value)) return '#e0e0e0'; // White for NaN
    if (value < 0) return '#ff0000'; // Red for negative values
    if (value < 1) {
        // Gradient from red to yellow to green for values between 0 and 1
        const hue = value * 120; // 0 (red) to 120 (green)
        return `hsl(${hue}, 100%, 50%)`;
    }
    if (value < 2) return '#00cc00'; // Light green for 1-2
    if (value < 3) return '#009900'; // Medium green for 2-3
    return '#006600'; // Dark green for 3+
};

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

const LoadingDots = () => (
    <span className="Loading-Dots">
        <span>.</span>
        <span>.</span>
        <span>.</span>
    </span>
);

export default function StatusBar({ portfolio, totalValue }: Props) {
    const weightedSharpe = portfolio.reduce((sum, coin) => {
        if (!coin.amount || totalValue === 0) return sum;
        const weight = (coin.amount * coin.lastPrice) / totalValue;
        return sum + (weight * coin.sharpe);
    }, 0);

    const sharpeColor = getSharpeColor(weightedSharpe);
    const isNaNSharpe = isNaN(weightedSharpe) || totalValue === 0;

    return (
        <div className='Status-Container'>
            <h3>
                Portfolio Sharpe:&nbsp;
                <span style={{ color: sharpeColor, fontWeight: 'bold' }}>
                    {isNaNSharpe ? <LoadingDots /> : ` ${weightedSharpe.toFixed(2)}`}
                </span>
            </h3>
            <h3>{`Portfolio Value: ${formatCurrency(totalValue)}`}</h3>
        </div>
    );
} 