import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartData
} from 'chart.js';
import "./Graph.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

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
        yAxisID?: string;
        borderDash?: number[];
        segment?: {
            borderColor: (ctx: any) => string;
        };
        hidden?: boolean;
    }[];
    bitcoinData?: {
        prices: number[];
        dates: string[];
    };
};

type Props = {
    priceData: PriceData;
    showSharpe?: boolean;
};

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

export default function Graph({ priceData, showSharpe = false }: Props) {
    const [showBitcoin, setShowBitcoin] = useState(false);
    const [chartData, setChartData] = useState<ChartData<'line'>>({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        if (priceData.datasets.length > 0) {
            const datasets = showSharpe 
                ? priceData.datasets.filter(d => d.yAxisID === 'y1' && d.label !== 'Bitcoin Sharpe Ratio')
                : priceData.datasets.filter(d => d.yAxisID === 'y');

            if (!showSharpe && showBitcoin && priceData.bitcoinData) {
                datasets.push({
                    label: 'Bitcoin',
                    data: priceData.bitcoinData.prices,
                    borderColor: '#F7931A',
                    backgroundColor: 'rgba(247, 147, 26, 0.1)',
                    tension: 0.1,
                    pointRadius: 0,
                    borderWidth: 2,
                    yAxisID: 'y'
                });
            }

            if (showSharpe) {
                // Add watermark at 0
                datasets.push({
                    label: 'Zero Line',
                    data: priceData.dates.map(() => 0),
                    borderColor: 'rgba(0, 0, 0, 0.3)',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    tension: 0,
                    pointRadius: 0,
                    borderWidth: 1,
                    borderDash: [5, 5],
                    yAxisID: 'y1'
                });

                // Add Bitcoin Sharpe ratio if toggled
                if (showBitcoin) {
                    const bitcoinSharpeDataset = priceData.datasets.find(d => d.label === 'Bitcoin Sharpe Ratio');
                    if (bitcoinSharpeDataset) {
                        datasets.push({
                            ...bitcoinSharpeDataset,
                            segment: {
                                borderColor: (ctx: any) => {
                                    const value = ctx.p0.parsed.y;
                                    return value >= 0 ? '#F7931A' : '#ff6b6b';
                                }
                            }
                        });
                    }
                }

                // Color the portfolio Sharpe ratio line based on value
                const portfolioSharpeDataset = datasets.find(d => d.label === 'Sharpe Ratio (30-day rolling)');
                if (portfolioSharpeDataset) {
                    portfolioSharpeDataset.segment = {
                        borderColor: (ctx: any) => {
                            const value = ctx.p0.parsed.y;
                            return value >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)';
                        }
                    };
                }
            }

            const data: ChartData<'line'> = {
                labels: priceData.dates,
                datasets
            };
            setChartData(data);
        }
    }, [priceData, showSharpe, showBitcoin]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20
                }
            },
            title: {
                display: true,
                text: showSharpe ? 'Portfolio Risk (30-day Rolling Sharpe Ratio)' : 'Portfolio Performance (Normalized)'
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            if (!showSharpe) {
                                const value = context.parsed.y;
                                const percentage = ((value - 1) * 100).toFixed(2);
                                label += `${percentage}%`;
                            } else {
                                label += context.parsed.y.toFixed(2);
                            }
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    maxTicksLimit: 12
                }
            },
            y: {
                type: 'linear' as const,
                display: !showSharpe,
                position: 'left' as const,
                title: {
                    display: !showSharpe,
                    text: 'Relative Performance'
                },
                beginAtZero: false,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    callback: function(value: any) {
                        if (!showSharpe) {
                            return `${((value - 1) * 100).toFixed(0)}%`;
                        }
                        return value;
                    }
                }
            },
            y1: {
                type: 'linear' as const,
                display: showSharpe,
                position: 'left' as const,
                title: {
                    display: showSharpe,
                    text: 'Sharpe Ratio'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    callback: function(value: any) {
                        return value.toFixed(1);
                    }
                }
            }
        }
    };

    return (
        <div className="Graph-Container">
            {!showSharpe && (
                <button 
                    className={`Bitcoin-Toggle ${showBitcoin ? 'active' : ''}`}
                    onClick={() => setShowBitcoin(!showBitcoin)}
                >
                    {showBitcoin ? 'Hide Bitcoin' : 'Show Bitcoin'}
                </button>
            )}
            {showSharpe && (
                <button 
                    className={`Bitcoin-Toggle ${showBitcoin ? 'active' : ''}`}
                    onClick={() => setShowBitcoin(!showBitcoin)}
                >
                    {showBitcoin ? 'Hide Bitcoin Sharpe' : 'Show Bitcoin Sharpe'}
                </button>
            )}
            <Line data={chartData} options={options} />
        </div>
    );
}
