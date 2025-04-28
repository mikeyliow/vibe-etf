<script lang="ts">
    import { mockStocks } from '../mockData';
</script>

<div class="stock-list">
    <table>
        <thead>
            <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Shares</th>
                <th>Avg Price</th>
                <th>Current Price</th>
                <th>Total Value</th>
                <th>Daily Change</th>
            </tr>
        </thead>
        <tbody>
            {#each mockStocks as stock}
                <tr>
                    <td>{stock.symbol}</td>
                    <td>{stock.name}</td>
                    <td>{stock.shares}</td>
                    <td>${stock.avgPrice.toFixed(2)}</td>
                    <td>${stock.currentPrice.toFixed(2)}</td>
                    <td>${stock.totalValue.toLocaleString()}</td>
                    <td class={stock.dailyChange >= 0 ? 'positive' : 'negative'}>
                        ${stock.dailyChange.toFixed(2)} ({stock.dailyChangePercent.toFixed(2)}%)
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .stock-list {
        padding: 1rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
    }

    th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #eee;
    }

    th {
        background: #f8f9fa;
        font-weight: 600;
        color: #666;
    }

    tr:last-child td {
        border-bottom: none;
    }

    .positive {
        color: #28a745;
    }

    .negative {
        color: #dc3545;
    }
</style> 