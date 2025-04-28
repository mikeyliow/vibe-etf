export interface Stock {
    symbol: string;
    current_price: number;
    percentage: number;
    performance: number;
    monthly_performance: Record<string, any>;
}

export interface Portfolio {
    [key: string]: Stock;
}

export interface TotalPerformance {
    performance: number;
    monthly_performance: Record<string, any>;
}

export type Transaction = {
    date: string;
    ticker: string;
    action: 'buy' | 'sell';
};

export type StockInfo = {
    ticker: string;
    name: string;
    description: string;
}; 