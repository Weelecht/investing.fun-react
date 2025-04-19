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

export default function StatusBar({ portfolio, totalValue }: Props) {
    const averageSharpe = portfolio.reduce((sum, coin) => sum + coin.sharpe, 0) / portfolio.length;

    return (
        <div className='Status-Container'>
            <h3>{`Portfolio Sharpe: ${averageSharpe.toFixed(2)}`}</h3>
            <h3>{`Portfolio Value: $${totalValue.toFixed(2)}`}</h3>
        </div>
    );
} 