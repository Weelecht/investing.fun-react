import React, { ReactElement } from 'react'
import { useState,useEffect } from 'react';
import "./Card.css"


type CardInfo = {
  name: string,
  sharpe: number,
  days: number;
  lastPrice: number,
}

type Props = {
  cardInfo: CardInfo;
  onDragStart?: (e: React.DragEvent, card: CardInfo) => void;
};

export default function Card({ cardInfo, onDragStart }: Props) {
  const [amount, setAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState(0);
  
  const handleSubmission = (e:React.FormEvent) => {
    e.preventDefault();
    if (amount) {
      setSavedAmount(parseInt(amount));
      setAmount('');
    }
  }

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
  }

  return (
    <div draggable
      onDragStart={onDragStart ? (e) => onDragStart(e, cardInfo) : undefined}
      className="Card-Container">

      <h4 className='Title'>{cardInfo.name}</h4>
      <p className='Sharpe-Days-Price-Amount'>{`Sharpe: ${cardInfo.sharpe} \n 
        Days: ${cardInfo.days} \n 
        Amount: ${savedAmount} \n 
        Price: ${cardInfo.lastPrice}`}</p>
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
