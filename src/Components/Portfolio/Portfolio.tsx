import React, { useState, useEffect } from 'react'
import "./Portfolio.css";
import Card from '../Card/Card';
import StatusBar from '../StatusBar/StatusBar';

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
    onDropCard: (card: CardInfo) => void;
    onDragStart: (e: React.DragEvent, card: CardInfo) => void;
    onAmountUpdate: (name: string, amount: number) => void;
};

export default function Portfolio({portfolio: initialPortfolio, onDropCard, onDragStart, onAmountUpdate}: Props) {
    const [portfolio, setPortfolio] = useState<CardInfo[]>(initialPortfolio);
    
    useEffect(() => {
        setPortfolio(initialPortfolio);
    }, [initialPortfolio]);

    const allowDrop = (e: React.DragEvent) => e.preventDefault();

    const handleDrop = (e:React.DragEvent) => {
        const data = e.dataTransfer.getData("card");
        const card: CardInfo = JSON.parse(data);
        // Ensure position is calculated if not provided
        if (!card.position && card.amount) {
            card.position = card.amount * card.lastPrice;
        }
        onDropCard(card);
    }

    const calculatePositions = (portfolio: CardInfo[]) => {
        return portfolio.map(coin => ({
            ...coin,
            position: (coin.amount || 0) * coin.lastPrice
        }));
    };

    const portfolioWithPositions = calculatePositions(portfolio);
    const totalPortfolioValue = portfolioWithPositions.reduce((sum, coin) => sum + (coin.position || 0), 0);

    const handleAmountUpdate = (name: string, amount: number) => {
        // Update the local portfolio state
        const updatedPortfolio = portfolio.map(coin => 
            coin.name === name ? { ...coin, amount } : coin
        );
        setPortfolio(updatedPortfolio);
        
        // Call the parent's onAmountUpdate if it exists
        if (typeof onAmountUpdate === 'function') {
            onAmountUpdate(name, amount);
        }
    };

    return (
        <div onDragOver={allowDrop} onDrop={handleDrop} className='Portfolio-Wrapper'>
            <StatusBar portfolio={portfolio} totalValue={totalPortfolioValue} />
            <div className='Portfolio-Container'>
                {portfolioWithPositions.map((card)=> {
                    return (
                        <Card 
                            key={card.name} 
                            cardInfo={card} 
                            onDragStart={onDragStart}
                            onAmountUpdate={handleAmountUpdate}
                        />
                    )
                })} 
            </div>
        </div>
    )
}
