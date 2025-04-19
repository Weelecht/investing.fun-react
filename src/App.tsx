import React from "react";
import { useState } from "react";
import CoinFeed from "./Components/CoinFeed/CoinFeed";
import Portfolio from "./Components/Portfolio/Portfolio";
import "./App.css"


type CardInfo = {
  name: string,
  sharpe: number,
  days: number;
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
    const dropTarget = e.target as HTMLElement;
  
    if (!dropTarget.closest(".Portfolio-Container") && draggedCard) {
      setPortfolio((prev) => prev.filter((c) => c.name !== draggedCard.name));
    }
  
    setDraggedCard(null);
  };

  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={handleGlobalDrop}>
      <Portfolio
        portfolio={portfolio}
        onDropCard={handleDropCard}
        onDragStart={handleDragStart}
      />
      <CoinFeed onDragStart={handleDragStart} />
    </div>
  );
}

export default App;
