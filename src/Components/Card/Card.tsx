import React, { ReactElement } from 'react'
import { useState,useEffect } from 'react';
import "./Card.css"


type CardInfo = {
  name: string,
  sharpe: number,
  days: number;
  lastPrice: number,
  amount?: number;
  position?: number;
}

type Props = {
  cardInfo: CardInfo;
  onDragStart?: (e: React.DragEvent, card: CardInfo) => void;
  onAmountUpdate?: (name: string, amount: number) => void;
};

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

export default function Card({ cardInfo, onDragStart, onAmountUpdate }: Props) {
  const [amount, setAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState(cardInfo.amount || 0);
  const [position, setPosition] = useState(cardInfo.position || 0);
  
  useEffect(() => {
    setSavedAmount(cardInfo.amount || 0);
    setPosition((cardInfo.amount || 0) * cardInfo.lastPrice);
  }, [cardInfo.amount, cardInfo.lastPrice]);
  
  const handleSubmission = (e:React.FormEvent) => {
    e.preventDefault();
    if (amount) {
      const newAmount = parseInt(amount);
      setSavedAmount(newAmount);
      setPosition(newAmount * cardInfo.lastPrice);
      if (onAmountUpdate) {
        onAmountUpdate(cardInfo.name, newAmount);
      }
      setAmount('');
    }
  }

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, { ...cardInfo, amount: savedAmount, position });
    }
  }

  return (
    <div draggable
      onDragStart={handleDragStart}
      className="Card-Container">

      <h4 className='Title'>{cardInfo.name}</h4>
      <div className='Stats-Container'>
        <span className='Stat-Line'>
          Sharpe: <span style={{ color: cardInfo.sharpe > 0 ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>{cardInfo.sharpe}</span>
        </span>
        <span className='Stat-Line'>Amount: {savedAmount}</span>
        <span className='Stat-Line'>Price: {formatCurrency(cardInfo.lastPrice)}</span>
        <span className='Stat-Line'>
          Position: <span className={position > 0 ? 'Positive-Value' : ''}>{formatCurrency(position)}</span>
        </span>
      </div>
      <form onSubmit={handleSubmission} className="input-container">
        <input 
          type="number" 
          value={amount} 
          onChange={handleChange}
          placeholder="Amount"
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
