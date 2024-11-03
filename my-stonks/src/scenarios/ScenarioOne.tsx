import React, { useState, useEffect } from 'react';
import 'nes.css/css/nes.min.css';
import './ScenarioOne.css';
import Portfolio from '../components/Portfolio';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface Stock {
    shares: number;
}

interface PortfolioI {
    cash: number;
    stocks: Stock[];
}

const ScenarioOne: React.FC = () => {
    const [day, setDay] = useState<number>(0);
    const [prices, setPrices] = useState<number[][]>([
        [100],
        [120],
        [80]
    ]);

    const [portfolio, setPortfolio] = useState<PortfolioI>({
        cash: 1000,
        stocks: [{ shares: 0 }, { shares: 0 }, { shares: 0 }]
    });
    
    const timelineMessages = [
        "Housing market weakens as home prices start to fall.",
        "Mortgage defaults rise, hitting banks with losses.",
        "Lehman Brothers collapses, triggering panic.",
        "Global markets plunge as fears of recession grow.",
        "Government bailouts aim to stabilize the market.",
        "Early signs of recovery as market stabilizes."
    ];

    const stockSymbols = ["Stock A", "Stock B", "Stock C"];

    const [buyCounts, setBuyCounts] = useState<number[]>(stockSymbols.map(() => 0));
    const [sellCounts, setSellCounts] = useState<number[]>(stockSymbols.map(() => 0));

    const getCurrentMessage = () => {
        if (day < 50) return timelineMessages[0];
        if (day < 100) return timelineMessages[1];
        if (day < 150) return timelineMessages[2];
        if (day < 200) return timelineMessages[3];
        if (day < 250) return timelineMessages[4];
        return timelineMessages[5];
    };

    useEffect(() => {
        const interval = setInterval(() => setDay((prevDay) => prevDay + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (day > 0) {
            setPrices((prevPrices) => prevPrices.map((priceSeries) => {
                const previousPrice = priceSeries[day - 1];
                let newPrice;

                if (day < 50) {
                    newPrice = previousPrice * (1 - Math.random() * 0.02);
                } else if (day < 150) {
                    newPrice = previousPrice * (1 - Math.random() * 0.01);
                } else if (day < 200) {
                    newPrice = previousPrice * (1 + Math.random() * 0.005);
                } else {
                    newPrice = previousPrice * (1 + Math.random() * 0.01);
                }

                return [...priceSeries, newPrice];
            }));
        }
    }, [day]);

    const handleBuy = (index: number) => {
        const price = prices[index][day];
        if (portfolio.cash >= price) {
            setPortfolio((prevPortfolio) => ({
                ...prevPortfolio,
                cash: prevPortfolio.cash - price,
                stocks: prevPortfolio.stocks.map((stock, i) => i === index
                    ? { shares: stock.shares + 1 }
                    : stock
                )
            }));
            setBuyCounts((prevCounts) => 
                prevCounts.map((count, i) => i === index ? count + 1 : count)
            );
        }
    };

    const handleSell = (index: number) => {
        const price = prices[index][day];
        if (portfolio.stocks[index].shares > 0) {
            setPortfolio((prevPortfolio) => ({
                ...prevPortfolio,
                cash: prevPortfolio.cash + price,
                stocks: prevPortfolio.stocks.map((stock, i) => i === index
                    ? { shares: stock.shares - 1 }
                    : stock
                )
            }));
            setSellCounts((prevCounts) => 
                prevCounts.map((count, i) => i === index ? count + 1 : count)
            );
        }
    };

    const createChartData = (priceSeries: number[]) => ({
        labels: Array.from({ length: day + 1 }, (_, i) => (i + 1).toString()),
        datasets: [
            {
                label: 'Stock Price',
                data: priceSeries,
                fill: false,
                borderColor: 'green',
            },
        ],
    });

    const totalPortfolioValue = (
        portfolio.cash +
        portfolio.stocks.reduce((total, stock, index) => {
            const stockValue = stock.shares * (prices[index][day] || 0);
            return total + stockValue;
        }, 0)
    ).toFixed(2);

    return (
        <div className="grid-container-outer">
            <div className="left-column">
                <h1 className='title'>2008 Market Simulation</h1>
                <div className="nes-container" style={{ height: '100%' }}>

                    <h4 className=''>Day: {day + 1}</h4>
                    <div className="nes-container is-rounded is-dark">
                        {getCurrentMessage()}
                    </div>
                    <br></br>
                    <p><strong>Cash:</strong> ${portfolio.cash.toFixed(2)}</p>
                    <p><strong>Total Portfolio Value:</strong> ${totalPortfolioValue}</p>

                    {prices.map((priceSeries, index) => {
                        const currentPrice = priceSeries[day]?.toFixed(2) || "0.00";
                        const stockValue = (portfolio.stocks[index].shares * (priceSeries[day] || 0)).toFixed(2);

                        return (
                            <div key={index} className="chart-container">
                                <h3>{stockSymbols[index]}</h3>
                                <Line data={createChartData(priceSeries)} />
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="right-column">
                <h3 className='title'>Goal: Try to make a profit.</h3>
                <h3 className='title'>Decide whether to buy, hold, or sell based on the market conditions.</h3>
                <div className="nes-container" style={{ height: '100%' }}>
                    <center><h3 className='title'>Portfolio</h3></center>
                </div>
                <div className="nes-container with-title" style={{ height: '100%' }}>
                    <Portfolio />
                </div>
                <div className="nes-container with-title" style={{ height: '50%' }}>
                    <h3 className='title'>Buy/Sell</h3>
                    {
                        stockSymbols.map((item, index) => (
                            <div key={index} className="stock-control">
                                <p>{item} - Shares: {portfolio.stocks[index].shares}</p>
                                <button onClick={() => handleBuy(index)} className="nes-btn is-primary">
                                    Buy
                                </button>
                                <button onClick={() => handleSell(index)} className="nes-btn is-error" disabled={portfolio.stocks[index].shares === 0}>
                                    Sell
                                </button>
                            </div>
                        ))
                        // stockSymbols.map((item, index) => (
                        //     <p key={index}>{item} </p>
                        // ))
                    }
                </div>

            </div>
        </div >
    );
};

export default ScenarioOne;


// function ScenarioOne() {
//     return (
//         <div className="grid-container-outer">
//             <div className="left-column">
//                 <div className="nes-container with-title " style={{'height':'100%'}}>
//                      <h3 className='title'>Scenario</h3>
//                  </div>
//             </div>
//             <div className="right-column">
//                 <div className="box-inner">
//                     <div className="nes-container with-title" style={{'height':'100%'}}>
//                         <h3 className='title'>Scenario</h3>
//                     </div>
//                 </div>
//                 <div className="box-inner" >
//                     <div className="nes-container with-title" style={{'height':'100%'}}>
//                          <Portfolio />
//                     </div>
//                 </div>
//             </div>
//         </div>

// <div className='container-outer'>
//     <div className="box">
//         <div className="nes-container with-title">
//             <h3 className='title'>Scenario</h3>
//         </div>
//     </div>
//     <div className="box">
//         <div className="nes-container with-title">
//             <h3 className='title'>Stock View</h3>
//         </div>
//         <div className="nes-container with-title">
//             <Portfolio />
//         </div>
//     </div>
// </div>

//     );
// }

// export default ScenarioOne;
