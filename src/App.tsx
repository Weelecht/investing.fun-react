import React from "react";
import { useState } from "react";
import CoinFeed from "./Components/CoinFeed/CoinFeed";
import Portfolio from "./Components/Portfolio/Portfolio";
import "./App.css"


type CardInfo = {
  name: string,
  sharpe: number,
  days: number;
  lastPrice: number;
  amount?: number;
  position?: number;
}

function App() {
  const [portfolio, setPortfolio] = useState<CardInfo[]>([]);
  const [draggedCard, setDraggedCard] = useState<CardInfo | null>(null);
  
  const handleDropCard = (card: CardInfo) => {
    // Prevent duplicates
    const alreadyExists = portfolio.some((c) => c.name === card.name);
    if (!alreadyExists) {
      setPortfolio((prev) => [...prev, card]);
    }
  };

  const handleDragStart = (e: React.DragEvent, card: CardInfo) => {
    e.dataTransfer.setData('card', JSON.stringify(card));
    setDraggedCard(card);
  };
  
  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dropTarget = e.target as HTMLElement;
    const isPortfolio = dropTarget.closest(".Portfolio-Container");
    const isCoinFeed = dropTarget.closest(".CoinFeed-Container");
    
    // If dropping in CoinFeed or outside both containers, remove from portfolio
    if ((isCoinFeed || (!isPortfolio && !isCoinFeed)) && draggedCard) {
      setPortfolio((prev) => prev.filter((c) => c.name !== draggedCard.name));
    }
    
    setDraggedCard(null);
  };

  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      onDragOver={handleGlobalDragOver}
      onDrop={handleGlobalDrop}
      style={{ minHeight: '100vh', position: 'relative' }}
    >
      <Portfolio
        portfolio={portfolio}
        onDropCard={handleDropCard}
        onDragStart={handleDragStart}
        onAmountUpdate={(name, amount) => {
          setPortfolio(prev => prev.map(card => 
            card.name === name ? { ...card, amount } : card
          ));
        }}
      />
      <CoinFeed onDragStart={handleDragStart} />
    </div>
  );
}

export default App;
