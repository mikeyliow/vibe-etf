<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { fetchPortfolio, fetchTotalPerformance, fetchTransactions, fetchStockInfo } from '$lib/api';
    import type { Portfolio, TotalPerformance, Transaction, StockInfo } from '$lib/types';
    
    let activeTab = 'portfolio';
    let selectedTimeframe = 'ALL';
    let expandedStock: string | null = null;
    let chartCanvas: HTMLCanvasElement;
    let chart: any = null;
    
    let portfolio: Portfolio = {};
    let totalPerformance: TotalPerformance = { performance: 0, monthly_performance: {} };
    let transactions: Transaction[] = [];
    let stockInfo: Record<string, StockInfo> = {};
    let loading = true;
    let error: string | null = null;
    let initialInvestment = 1000;
    
    const timeframes = ['1W', '1M', '6M', '1Y', 'ALL'];
    
    async function loadData() {
        try {
            loading = true;
            error = null;
            [portfolio, totalPerformance, transactions] = await Promise.all([
                fetchPortfolio(),
                fetchTotalPerformance(),
                fetchTransactions()
            ]);
            
            // Fetch stock info for all stocks in portfolio
            const stockInfoPromises = Object.keys(portfolio).map(ticker => 
                fetchStockInfo(ticker).then(info => [ticker, info])
            );
            const stockInfoResults = await Promise.all(stockInfoPromises);
            stockInfo = Object.fromEntries(stockInfoResults);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Failed to load data';
        } finally {
            loading = false;
        }
    }
    
    function calculateCurrentValue(investment: number): number {
        return investment * (1 + totalPerformance.performance / 100);
    }
    
    async function initChart() {
        if (chart) {
            chart.destroy();
        }
        
        const Chart = (await import('chart.js/auto')).default;
        
        // Create data points based on the performance
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = labels.map((_, i) => {
            const progress = i / (labels.length - 1);
            return initialInvestment * (1 + (totalPerformance.performance * progress) / 100);
        });
        
        chart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Portfolio Value',
                    data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return `$${value.toLocaleString()}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    async function toggleStock(ticker: string) {
        if (expandedStock === ticker) {
            expandedStock = null;
        } else {
            try {
                if (!stockInfo[ticker]) {
                    stockInfo[ticker] = await fetchStockInfo(ticker);
                }
                expandedStock = ticker;
            } catch (e) {
                error = e instanceof Error ? e.message : 'Failed to load stock info';
            }
        }
    }
    
    onMount(() => {
        loadData();
    });
    
    onDestroy(() => {
        if (chart) {
            chart.destroy();
        }
    });
    
    $: if (activeTab === 'portfolio' && chartCanvas && !loading) {
        initChart();
    }
</script>

<main>
    <div class="header">
        <div class="title-container">
            <h1>🚀 Mikey's <span class="vibe">VIBE</span><span class="etf">.ETF</span></h1>
        </div>
    </div>
    
    {#if error}
        <div class="error">
            {error}
            <button on:click={loadData}>Retry</button>
        </div>
    {:else if loading}
        <div class="loading">Loading...</div>
    {:else}
        <div class="tabs">
            <button 
                class:active={activeTab === 'portfolio'} 
                on:click={() => activeTab = 'portfolio'}
            >
                📊 Portfolio
            </button>
            <button 
                class:active={activeTab === 'insights'} 
                on:click={() => activeTab = 'insights'}
            >
                🔍 Insights
            </button>
            <button 
                class:active={activeTab === 'transactions'} 
                on:click={() => activeTab = 'transactions'}
            >
                📝 Transactions
            </button>
        </div>

        <div class="content">
            {#if activeTab === 'portfolio'}
                <div class="portfolio-section">
                    <div class="performance-section">
                        <div class="performance-summary">
                            <div class="performance-percentage {totalPerformance.performance >= 0 ? 'positive' : 'negative'}">
                                {totalPerformance.performance >= 0 ? '📈' : '📉'} {totalPerformance.performance.toFixed(2)}%
                            </div>
                            <div class="performance-title">
                                <span>Starting with ${initialInvestment.toLocaleString()}, you're now sitting on</span>
                                <span class="current-value">${calculateCurrentValue(initialInvestment).toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="timeframe-selector">
                            {#each timeframes as timeframe}
                                <button 
                                    class:active={selectedTimeframe === timeframe}
                                    on:click={() => selectedTimeframe = timeframe}
                                    class:coming-soon={timeframe !== 'ALL'}
                                >
                                    {timeframe}
                                </button>
                            {/each}
                        </div>
                        <div class="chart-container">
                            <canvas bind:this={chartCanvas}></canvas>
                        </div>
                    </div>

                    <div class="stocks-grid">
                        {#each Object.values(portfolio) as stock}
                            <div class="stock-card" class:positive={stock.performance >= 0} class:negative={stock.performance < 0}>
                                <div class="stock-header" on:click={() => toggleStock(stock.symbol)}>
                                    <div class="stock-info">
                                        <h3>{stock.symbol}</h3>
                                        <div class="stock-price">${stock.current_price.toFixed(2)}</div>
                                    </div>
                                    <div class="stock-stats">
                                        <span class="performance {stock.performance >= 0 ? 'positive' : 'negative'}">
                                            {stock.performance.toFixed(2)}%
                                        </span>
                                        <span class="percentage">{stock.percentage.toFixed(1)}% of portfolio</span>
                                    </div>
                                </div>
                                <div class="stock-description">
                                    <div class="stock-detail">
                                        <span class="description">{stockInfo[stock.symbol]?.description}</span>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {:else if activeTab === 'insights'}
                <div class="insights-section">
                    <div class="insights-grid">
                        <div class="insights-left">
                            <h3>Financial Mood Ring</h3>
                            <p>This portfolio operates like a financial mood ring, carefully balancing market opportunities with risk management. The strategy is all about catching those good vibes in the market while steering clear of the bad juju. It's like financial feng shui – keeping your portfolio aligned with good energy while avoiding the investments that give off sketchy vibes!</p>
                            
                            <div class="lookout-section">
                                <h3>Stocks on the Lookout</h3>
                                <div class="lookout-list">
                                    <span class="lookout-stock">$ARM</span>
                                    <span class="lookout-stock">$TTD</span>
                                    <span class="lookout-stock">$IONQ</span>
                                    <span class="lookout-stock">$CROX</span>
                                    <span class="lookout-stock">$RDDT</span>
                                </div>
                            </div>
                        </div>
                        <div class="insights-right">
                            <div class="vibe-section good">
                                <h3>Good Vibes Only 🟢</h3>
                                <p>The portfolio hunts for solid companies with healthy profits that got knocked down for reasons that don't actually hurt their business. Sweet spots are undervalued stocks with attractive P/E ratios and room to grow.</p>
                            </div>
                            <div class="vibe-section mid">
                                <h3>Mid Vibes (Proceed with Caution) 🟡</h3>
                                <p>When everyone and their grandmother is buying something, that's a red flag. Same goes for stocks already shooting to the moon or companies with questionable business practices.</p>
                            </div>
                            <div class="vibe-section bad">
                                <h3>Bad Vibes (Hard Pass) 🔴</h3>
                                <p>The portfolio stays far away from companies with erratic leadership or businesses that can't seem to make good decisions. No amount of FOMO can convince it to buy into these red flags.</p>
                            </div>
                        </div>
                    </div>
                </div>
            {:else if activeTab === 'transactions'}
                <div class="transactions-section">
                    <div class="transactions-header">
                        <h2>📝 Recent Transactions</h2>
                        <div class="transaction-count">{transactions.length} transactions</div>
                    </div>
                    <div class="transactions-list">
                        {#each transactions as transaction}
                            <div class="transaction-item">
                                <div class="transaction-ticker">{transaction.ticker}</div>
                                <div class="transaction-details">
                                    <span class="transaction-date">
                                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                    <span class="transaction-action {transaction.action}">
                                        {transaction.action.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</main>

<style>
    :global(body) {
        background: #f0f7ff;
        color: #1e293b;
    }

    main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .header {
        text-align: center;
        margin-bottom: 3rem;
    }

    h1 {
        margin: 0;
        font-size: 3.5rem;
        font-weight: 800;
        color: #1e40af;
        margin-bottom: 1rem;
        text-align: center;
        letter-spacing: -0.02em;
    }

    .vibe {
        color: #6366f1;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .etf {
        color: #1e40af;
        font-weight: 700;
        letter-spacing: 0.02em;
    }

    .error {
        background: #fee2e2;
        color: #dc2626;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .loading {
        text-align: center;
        padding: 2rem;
        color: #64748b;
    }

    .tabs {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        justify-content: center;
        border-bottom: none;
        padding-bottom: 0;
    }

    button {
        padding: 0.75rem 1.5rem;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 1rem;
        color: #64748b;
        border-radius: 8px;
        transition: all 0.2s;
        font-weight: 500;
    }

    button:hover {
        background: #f1f5f9;
        color: #1e40af;
    }

    button.active {
        background: #3b82f6;
        color: white;
    }

    button.coming-soon {
        opacity: 0.5;
        cursor: not-allowed;
    }

    button.coming-soon:hover {
        background: none;
        color: #64748b;
    }

    .content {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .portfolio-section {
        padding: 2rem;
    }

    .performance-section {
        margin-bottom: 2rem;
    }

    .performance-summary {
        text-align: center;
        margin-bottom: 2rem;
    }

    .performance-percentage {
        font-size: 2.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }

    .performance-title {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-size: 1.25rem;
        color: #475569;
    }

    .performance-title .current-value {
        font-size: 2rem;
        font-weight: 700;
        color: #1e40af;
    }

    .positive {
        color: #10b981;
    }

    .negative {
        color: #ef4444;
    }

    .timeframe-selector {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        justify-content: center;
    }

    .chart-container {
        height: 200px;
        margin-bottom: 1rem;
    }

    .stocks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
    }

    .stock-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        transition: all 0.3s ease;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .stock-card:hover {
        transform: translateY(-2px);
    }

    .stock-card.positive {
        border: 1px solid #10b981;
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
    }

    .stock-card.negative {
        border: 1px solid #ef4444;
        box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
    }

    .stock-card.positive:hover {
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
    }

    .stock-card.negative:hover {
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
    }

    .stock-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
        cursor: pointer;
    }

    .stock-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .stock-info h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1e40af;
    }

    .stock-price {
        font-size: 1rem;
        color: #475569;
    }

    .stock-stats {
        text-align: right;
    }

    .stock-stats .performance {
        display: block;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .stock-stats .percentage {
        font-size: 0.875rem;
        color: #64748b;
    }

    .stock-description {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
    }

    .stock-name {
        font-weight: 600;
        color: #1e40af;
        margin-bottom: 0.5rem;
    }

    .description {
        color: #475569;
        line-height: 1.5;
        font-size: 0.875rem;
    }

    .stock-detail {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .stock-detail .label {
        color: #64748b;
    }

    .stock-detail .value {
        font-weight: 600;
        color: #1e293b;
    }

    .coming-soon-overlay {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        background: #f8fafc;
    }

    .coming-soon-content {
        text-align: center;
        color: #64748b;
    }

    .coming-soon-content h2 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }

    .transactions-section {
        padding: 2rem;
    }

    .transactions-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .transactions-header h2 {
        font-size: 1.5rem;
        color: #1e40af;
        margin: 0;
    }

    .transaction-count {
        color: #64748b;
        font-size: 0.875rem;
    }

    .transactions-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .transaction-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: white;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        transition: all 0.2s;
    }

    .transaction-item:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .transaction-ticker {
        font-weight: 600;
        color: #1e40af;
        font-size: 1.125rem;
    }

    .transaction-details {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .transaction-date {
        color: #64748b;
        font-size: 0.875rem;
    }

    .transaction-action {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .transaction-action.buy {
        background: #dcfce7;
        color: #166534;
    }

    .transaction-action.sell {
        background: #fee2e2;
        color: #991b1b;
    }

    @media (max-width: 640px) {
        .stock-header {
            flex-direction: column;
            gap: 1rem;
        }

        .stock-stats {
            text-align: left;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .stock-stats .performance {
            font-size: 1.5rem;
        }

        .stock-stats .percentage {
            font-size: 1rem;
        }

        .stocks-grid {
            grid-template-columns: 1fr;
        }

        .transaction-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .transaction-details {
            width: 100%;
            justify-content: space-between;
        }
    }

    .insights-section {
        padding: 2rem;
    }

    .insights-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .insights-left {
        padding: 2rem;
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .insights-right {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .vibe-section {
        padding: 1.5rem;
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .vibe-section.good {
        border-left: 4px solid #10b981;
    }

    .vibe-section.mid {
        border-left: 4px solid #f59e0b;
    }

    .vibe-section.bad {
        border-left: 4px solid #ef4444;
    }

    @media (max-width: 1024px) {
        .insights-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 640px) {
        h1 {
            font-size: 2.5rem;
        }
    }

    .lookout-section {
        margin-top: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .lookout-section h3 {
        color: #1e40af;
        font-size: 1.25rem;
        margin-bottom: 1rem;
    }

    .lookout-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    .lookout-stock {
        padding: 0.5rem 1rem;
        background: #f1f5f9;
        border-radius: 6px;
        color: #1e40af;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .lookout-stock:hover {
        background: #e0e7ff;
        transform: translateY(-1px);
    }

    .title-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }

    .title-icon {
        width: 40px;
        height: 40px;
        object-fit: contain;
    }

    @media (max-width: 640px) {
        .title-icon {
            width: 32px;
            height: 32px;
        }
        h1 {
            font-size: 2.5rem;
        }
    }
</style>
