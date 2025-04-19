import React from 'react'
import "./Portfolio.css";
import Card from '../Card/Card';

type CardInfo = {
    name: string,
    sharpe: number,
    days: number;
  }

  type Props = {
    portfolio: CardInfo[];
    onDropCard: (card: CardInfo) => void;
    onDragStart: (e: React.DragEvent, card: CardInfo) => void;
  };
  

export default function Portfolio({portfolio, onDropCard, onDragStart}: Props) {
    const allowDrop = (e: React.DragEvent) => e.preventDefault();

    const handleDrop = (e:React.DragEvent) => {
        const data = e.dataTransfer.getData("card");
        const card: CardInfo = JSON.parse(data);
        onDropCard(card);
    }


  return (

    <div onDragOver={allowDrop} onDrop={handleDrop} className='Portfolio-Wrapper'>
        <div className='Status-Container'> 
           <h3>{`Portfolio Sharpe: ${portfolio.reduce((sum,coin)=> sum + coin.sharpe,0)/portfolio.length}`}</h3> 
        </div>
        <div className='Portfolio-Container'>
            {portfolio.map((card)=> {
                return <Card key={card.name} cardInfo={card} onDragStart={onDragStart}></Card>
            })} 
        </div>
    </div>
  )
}
