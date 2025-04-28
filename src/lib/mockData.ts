export interface Stock {
    symbol: string;
    name: string;
    shares: number;
    avgPrice: number;
    currentPrice: number;
    totalValue: number;
    dailyChange: number;
    dailyChangePercent: number;
    description: string;
    portfolioPercentage: number;
}

export interface Transaction {
    date: string;
    type: 'BUY' | 'SELL';
    symbol: string;
    shares: number;
    price: number;
    total: number;
}

const totalPortfolioValue = 47537.50;

export const mockStocks: Stock[] = [
    {
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        shares: 100,
        avgPrice: 250.50,
        currentPrice: 260.75,
        totalValue: 26075,
        dailyChange: 2.50,
        dailyChangePercent: 0.97,
        description: 'Core holding for broad market exposure. Provides diversification across the entire US stock market.',
        portfolioPercentage: (26075 / totalPortfolioValue) * 100
    },
    {
        symbol: 'QQQ',
        name: 'Invesco QQQ Trust',
        shares: 50,
        avgPrice: 350.25,
        currentPrice: 365.80,
        totalValue: 18290,
        dailyChange: 3.20,
        dailyChangePercent: 0.88,
        description: 'Tech-focused ETF tracking the NASDAQ-100. Betting on continued tech innovation and growth.',
        portfolioPercentage: (18290 / totalPortfolioValue) * 100
    },
    {
        symbol: 'ARKK',
        name: 'ARK Innovation ETF',
        shares: 75,
        avgPrice: 45.60,
        currentPrice: 42.30,
        totalValue: 3172.50,
        dailyChange: -0.75,
        dailyChangePercent: -1.74,
        description: 'High-risk, high-reward play on disruptive innovation. Smaller position due to higher volatility.',
        portfolioPercentage: (3172.50 / totalPortfolioValue) * 100
    }
];

export const mockTransactions: Transaction[] = [
    {
        date: '2024-04-25',
        type: 'BUY',
        symbol: 'VTI',
        shares: 20,
        price: 258.50,
        total: 5170
    },
    {
        date: '2024-04-24',
        type: 'SELL',
        symbol: 'QQQ',
        shares: 10,
        price: 362.75,
        total: 3627.50
    },
    {
        date: '2024-04-23',
        type: 'BUY',
        symbol: 'ARKK',
        shares: 25,
        price: 43.20,
        total: 1080
    }
];

export const portfolioStats = {
    totalValue: totalPortfolioValue,
    dailyChangePercent: 0.13,
    monthlyChangePercent: 2.7,
    yearlyChangePercent: 22.5
}; 