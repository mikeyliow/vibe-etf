<script lang="ts">
    import { portfolioStats } from '../mockData';
</script>

<div class="stats-container">
    <div class="stat-card">
        <h3>Total Portfolio Value</h3>
        <p class="value">${portfolioStats.totalValue.toLocaleString()}</p>
    </div>
    <div class="stat-card">
        <h3>Daily Change</h3>
        <p class="value {portfolioStats.dailyChange >= 0 ? 'positive' : 'negative'}">
            ${portfolioStats.dailyChange.toFixed(2)} (${portfolioStats.dailyChangePercent.toFixed(2)}%)
        </p>
    </div>
    <div class="stat-card">
        <h3>Monthly Change</h3>
        <p class="value {portfolioStats.monthlyChange >= 0 ? 'positive' : 'negative'}">
            ${portfolioStats.monthlyChange.toFixed(2)} (${portfolioStats.monthlyChangePercent.toFixed(2)}%)
        </p>
    </div>
    <div class="stat-card">
        <h3>Yearly Change</h3>
        <p class="value {portfolioStats.yearlyChange >= 0 ? 'positive' : 'negative'}">
            ${portfolioStats.yearlyChange.toFixed(2)} (${portfolioStats.yearlyChangePercent.toFixed(2)}%)
        </p>
    </div>
</div>

<style>
    .stats-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        padding: 1rem;
    }

    .stat-card {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    h3 {
        margin: 0;
        font-size: 1rem;
        color: #666;
    }

    .value {
        margin: 0.5rem 0 0;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .positive {
        color: #28a745;
    }

    .negative {
        color: #dc3545;
    }
</style> 