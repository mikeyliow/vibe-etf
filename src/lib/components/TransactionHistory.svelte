<script lang="ts">
    import { mockTransactions } from '../mockData';
</script>

<div class="transaction-history">
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            {#each mockTransactions as transaction}
                <tr>
                    <td>{transaction.date}</td>
                    <td class={transaction.type === 'BUY' ? 'buy' : 'sell'}>{transaction.type}</td>
                    <td>{transaction.symbol}</td>
                    <td>{transaction.shares}</td>
                    <td>${transaction.price.toFixed(2)}</td>
                    <td>${transaction.total.toLocaleString()}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .transaction-history {
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

    .buy {
        color: #28a745;
        font-weight: 600;
    }

    .sell {
        color: #dc3545;
        font-weight: 600;
    }
</style> 