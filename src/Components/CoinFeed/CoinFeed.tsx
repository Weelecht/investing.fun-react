import React from 'react'
import { useEffect,useState } from 'react';
import Card from '../Card/Card';
import "./CoinFeed.css"

type CardInfo = {
  name: string,
  sharpe: number,
  days: number;
  lastPrice: number;
  amount?: number;
  position?: number;
}

type CoinFeedProps = {
  onDragStart: (e: React.DragEvent, card: CardInfo) => void;
};

export default function CoinFeed({onDragStart}:CoinFeedProps) {
    const [coins, setCoins] = useState<coin[]>([]); 
  
    type coin = {
      name: string,
      sharpe: number,
      days: number
      lastPrice: number
      amount: number
      position: number
    }
  
    useEffect(() => {
      const riskfreerate:number = 0.0435;
      // Fetch function to get coin data from API
      const fetchCoinList = async () => {
        const queryString = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&include_tokens=top";
        try{
          const data = await fetch(queryString, {
            method: "GET",
            headers: {
              accept: 'application/json',
              'x-cg-demo-api-key': 'CG-UyXZhTiKe8vnDMdHGEPzL2tr',
            },
          });
    
          const res: any[] = await data.json();
          return res.map((coin) => coin.id);
        }catch(err){
          console.log(err);
          return [];
        }
      };
  
      const fetchPriceData = async(coin:String, timePeriod:Number) => {
        const queryString = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${timePeriod}&interval=daily&precision=2`;
        try{
          const res = await fetch(queryString, {
            method: "GET",
            headers: {
                accept: "application/json",
                'x-cg-demo-api-key': 'CG-UyXZhTiKe8vnDMdHGEPzL2tr'
            }
          }) 
      
          const data = await res.json();
          console.log(data);
          return data.prices.map((price:any) => price[1]);
        }catch(err) {
          console.log(err);
          return [];
        }
      }
  
      const calculateSharpeRatio = (priceData: number[], riskfreerate: number): number => {
        if (priceData.length < 2) return 0; 
      
        const decimalReturnsArray: number[] = priceData.map((price, i, array) => {
          if (i === 0) return 0;
          const prevPrice = array[i - 1];
          const decimal = (price - prevPrice) / prevPrice;
          return decimal;
        });
      
        const avgReturn = decimalReturnsArray.reduce((sum, decimalReturn) => sum + decimalReturn, 0) /decimalReturnsArray.length;
      
        const squaredDiff: number[] = decimalReturnsArray.map((decimalReturn) =>
          Math.pow(decimalReturn - avgReturn, 2)
        );
      
        const variance = squaredDiff.reduce((sum, v) => sum + v, 0) / (squaredDiff.length - 1);
      
        const stdDev = Math.sqrt(variance);
        const dailyRf = riskfreerate / 365;
        const avgExcessReturn = avgReturn - dailyRf;
      
        const dailySharpe = stdDev === 0 ? 0 : avgExcessReturn / stdDev;
        const annualSharpe = dailySharpe * Math.sqrt(365);
      
        return parseFloat(annualSharpe.toFixed(2)); 
      };


      const loadCoins = async () => {
        const coins = await fetchCoinList();
        if (!coins) return;
        
        const section = coins.slice(0,3);  
        try{
          const mapping = await Promise.all(
            section.map(async(coin)=> {
            const price = await fetchPriceData(coin,365);
            if (!price) return null;
            
            const sharpe = calculateSharpeRatio(price,riskfreerate); 
            const lastPrice = price[price.length-1];
            return {
              name: coin,
              sharpe,
              days: price.length-1,
              lastPrice,
              amount: 0,
              position: 0
            }
          }))
          const validCoins = mapping.filter((coin): coin is coin => coin !== null);
          setCoins(validCoins);
        }catch(err) {
          console.log(err)
        }
      };
  
      loadCoins(); 
      
    }, []);
  
  return (
    <div className='CoinFeed-Container'>
        {coins.map(coin => {
            return (
                <Card 
                    key={coin.name} 
                    cardInfo={coin} 
                    onDragStart={onDragStart}
                />
            )
        })} 
    </div>
  )
}
