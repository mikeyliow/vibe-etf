import type { Portfolio, TotalPerformance, Transaction, StockInfo } from './types';

const API_BASE_URL = 'https://vibe-etf-be-production.up.railway.app/api';

export async function fetchPortfolio(): Promise<Portfolio> {
    const response = await fetch(`${API_BASE_URL}/portfolio`);
    if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
    }
    const data = await response.json();
    // Transform the data to include symbol
    return Object.entries(data).reduce((acc, [symbol, stock]: [string, any]) => {
        acc[symbol] = { ...stock, symbol };
        return acc;
    }, {} as Portfolio);
}

export async function fetchTotalPerformance(): Promise<TotalPerformance> {
    const response = await fetch(`${API_BASE_URL}/total`);
    if (!response.ok) {
        throw new Error('Failed to fetch total performance data');
    }
    return response.json();
}

export async function fetchTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    if (!response.ok) {
        throw new Error('Failed to fetch transactions data');
    }
    return response.json();
}

export async function fetchStockInfo(ticker: string): Promise<StockInfo> {
    const response = await fetch(`${API_BASE_URL}/stock/${ticker}`);
    if (!response.ok) {
        throw new Error('Failed to fetch stock info');
    }
    return response.json();
}

export async function fetchAllStockInfo(): Promise<StockInfo[]> {
    const response = await fetch(`${API_BASE_URL}/stock`);
    if (!response.ok) {
        throw new Error('Failed to fetch stock info');
    }
    return response.json();
} 