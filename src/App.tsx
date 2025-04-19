import React from "react";
import { useState, useEffect } from "react";
import CoinFeed from "./Components/CoinFeed/CoinFeed";
import Portfolio from "./Components/Portfolio/Portfolio";
import Graphs from "./Components/Graphs/Graphs";
import "./App.css"


type CardInfo = {
  name: string,
  sharpe: number,
  days: number;
  lastPrice: number;
  amount?: number;
  position?: number;
}

type PriceData = {
  prices: number[];
  dates: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    pointRadius: number;
    borderWidth: number;
  }[];
  bitcoinData?: {
    prices: number[];
    dates: string[];
  };
}

function App() {
  const [portfolio, setPortfolio] = useState<CardInfo[]>([]);
  const [draggedCard, setDraggedCard] = useState<CardInfo | null>(null);
  const [priceData, setPriceData] = useState<PriceData>({ prices: [], dates: [], datasets: [] });
  
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

  // Update price data when portfolio changes
  useEffect(() => {
    if (portfolio.length > 0) {
      const fetchPriceData = async () => {
        try {
          // Fetch price data for all coins in parallel
          const pricePromises = portfolio.map(async (coin) => {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/coins/${coin.name}/market_chart?vs_currency=usd&days=365&interval=daily`,
              {
                headers: {
                  'x-cg-demo-api-key': 'CG-UyXZhTiKe8vnDMdHGEPzL2tr'
                }
              }
            );
            const data = await response.json();
            return {
              name: coin.name,
              amount: coin.amount || 0,
              prices: data.prices.map((price: [number, number]) => price[1]),
              dates: data.prices.map((price: [number, number]) => {
                const date = new Date(price[0]);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              })
            };
          });

          // Fetch Bitcoin price data
          const bitcoinResponse = await fetch(
            'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily',
            {
              headers: {
                'x-cg-demo-api-key': 'CG-UyXZhTiKe8vnDMdHGEPzL2tr'
              }
            }
          );
          const bitcoinData = await bitcoinResponse.json();

          const allPriceData = await Promise.all(pricePromises);
          const dates = allPriceData[0].dates;
          
          // Calculate portfolio total value for each day
          const portfolioValues = dates.map((_: string, dayIndex: number) => {
            return allPriceData.reduce((total, coinData) => {
              return total + (coinData.amount * coinData.prices[dayIndex]);
            }, 0);
          });

          // Normalize Bitcoin data relative to portfolio value
          const initialPortfolioValue = portfolioValues[0];
          const initialBitcoinPrice = bitcoinData.prices[0][1];
          const ratio = initialPortfolioValue / initialBitcoinPrice;

          const normalizedBitcoinData = {
            prices: bitcoinData.prices.map((price: [number, number]) => {
              return (price[1] * ratio) / initialPortfolioValue;
            }),
            dates: bitcoinData.prices.map((price: [number, number]) => {
              const date = new Date(price[0]);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            })
          };

          // Normalize portfolio values for comparison
          const normalizedPortfolioValues = portfolioValues.map((value: number) => value / initialPortfolioValue);

          // Calculate daily returns using normalized values
          const dailyReturns = normalizedPortfolioValues.map((value: number, index: number) => {
            if (index === 0) return 0;
            return (value - normalizedPortfolioValues[index - 1]) / normalizedPortfolioValues[index - 1];
          });

          // Calculate rolling 30-day Sharpe ratio
          const riskFreeRate = 0.0435; // Annual risk-free rate (4.35%)
          const dailyRiskFreeRate = riskFreeRate / 365;
          const windowSize = 30;
          
          const sharpeRatios = dates.map((_: string, index: number) => {
            if (index < windowSize) return 0;
            
            const windowReturns = dailyReturns.slice(index - windowSize, index);
            const avgReturn = windowReturns.reduce((sum: number, ret: number) => sum + ret, 0) / windowSize;
            
            const squaredDiffs = windowReturns.map((ret: number) => Math.pow(ret - avgReturn, 2));
            const variance = squaredDiffs.reduce((sum: number, diff: number) => sum + diff, 0) / (windowSize - 1);
            const stdDev = Math.sqrt(variance);
            
            const dailySharpe = (avgReturn - dailyRiskFreeRate) / stdDev;
            return dailySharpe * Math.sqrt(365); // Annualize the Sharpe ratio
          });

          // Calculate Bitcoin's daily returns
          const bitcoinPrices = bitcoinData.prices.map((price: [number, number]) => price[1]);
          const bitcoinDailyReturns = bitcoinPrices.map((price: number, index: number) => {
            if (index === 0) return 0;
            return (price - bitcoinPrices[index - 1]) / bitcoinPrices[index - 1];
          });

          // Calculate Bitcoin's rolling 30-day Sharpe ratio
          const bitcoinSharpeRatios = dates.map((_: string, index: number) => {
            if (index < windowSize) return 0;
            
            const windowReturns = bitcoinDailyReturns.slice(index - windowSize, index);
            const avgReturn = windowReturns.reduce((sum: number, ret: number) => sum + ret, 0) / windowSize;
            
            const squaredDiffs = windowReturns.map((ret: number) => Math.pow(ret - avgReturn, 2));
            const variance = squaredDiffs.reduce((sum: number, diff: number) => sum + diff, 0) / (windowSize - 1);
            const stdDev = Math.sqrt(variance);
            
            const dailySharpe = (avgReturn - dailyRiskFreeRate) / stdDev;
            return dailySharpe * Math.sqrt(365); // Annualize the Sharpe ratio
          });

          // Create datasets for both portfolio value and Sharpe ratio
          const datasets = [
            {
              label: 'Portfolio Value (Normalized)',
              data: normalizedPortfolioValues,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 2,
              yAxisID: 'y'
            },
            {
              label: 'Sharpe Ratio (30-day rolling)',
              data: sharpeRatios,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 2,
              yAxisID: 'y1'
            },
            {
              label: 'Bitcoin Sharpe Ratio',
              data: bitcoinSharpeRatios,
              borderColor: '#F7931A',
              backgroundColor: 'rgba(247, 147, 26, 0.1)',
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 2,
              yAxisID: 'y1'
            }
          ];

          setPriceData({ 
            prices: [], 
            dates, 
            datasets,
            bitcoinData: normalizedBitcoinData
          });
        } catch (error) {
          console.error('Error fetching price data:', error);
        }
      };

      fetchPriceData();
    }
  }, [portfolio]);

  return (
    <div 
      onDragOver={handleGlobalDragOver}
      onDrop={handleGlobalDrop}
      style={{ minHeight: '100vh', position: 'relative' }}
      className={`App-Container ${portfolio.length > 0 ? 'with-graphs' : ''}`}
    >
      <div className="Main-Content">
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
      {portfolio.length > 0 && <Graphs priceData={priceData} />}
    </div>
  );
}

export default App;
