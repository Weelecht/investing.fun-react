import React from 'react';
import Graph from '../Graph/Graph';
import './Graphs.css';

type Props = {
  priceData: {
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
      yAxisID?: string;
    }[];
    bitcoinData?: {
      prices: number[];
      dates: string[];
    };
  };
};

const Graphs: React.FC<Props> = ({ priceData }) => {
  return (
    <div className="Graphs-Container">
      <div className="Graphs-Wrapper">
        <div className="Graphs-Status">
          <h3>
            <span>Portfolio Performance (YTD)</span>
            <span>
              {priceData.datasets.length > 0 ? (
                (() => {
                  const perf = (priceData.datasets[0].data[priceData.datasets[0].data.length - 1] - 1) * 100;
                  return <span style={{ color: perf > 0 ? '#4caf50' : '#f44336' }}>
                    {`${perf.toFixed(2)}%`}
                  </span>;
                })()
              ) : (
                <span className="Loading-Dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              )}
            </span>
          </h3>
          <h3>
            <span>vs. Bitcoin (YTD)</span>
            <span>
              {priceData.datasets.length > 0 && priceData.bitcoinData ? (
                (() => {
                  const portfolioPerf = priceData.datasets[0].data[priceData.datasets[0].data.length - 1] - 1;
                  const bitcoinPerf = priceData.bitcoinData.prices[priceData.bitcoinData.prices.length - 1] - 1;
                  const delta = (portfolioPerf - bitcoinPerf) * 100;
                  const sign = delta > 0 ? '+' : '';
                  return <span style={{ color: delta > 0 ? '#4caf50' : '#F7931A' }}>
                    {`${sign}${delta.toFixed(2)}%`}
                  </span>;
                })()
              ) : (
                <span className="Loading-Dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              )}
            </span>
          </h3>
        </div>
        <Graph priceData={priceData} showSharpe={false} />
        <Graph priceData={priceData} showSharpe={true} />
      </div>
    </div>
  );
};

export default Graphs; 