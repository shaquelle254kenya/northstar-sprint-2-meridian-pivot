const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

const PORT = process.env.MOCK_WAREHOUSE_PORT || 4002;

let stock = [
  { sku: 'NR-STK-001', quantity: 42 },
  { sku: 'NR-STK-002', quantity: 0 },
  { sku: 'NR-STK-003', quantity: 17 },
];

app.get('/warehouse/stock', (req, res) => res.json(stock));

app.post('/simulate-change', async (req, res) => {
  const { sku, quantity } = req.body;
  const item = stock.find((s) => s.sku === sku);
  if (item) item.quantity = quantity; else stock.push({ sku, quantity });

  const body = JSON.stringify({ sku, quantity, updatedAt: Date.now() });
  const secret = process.env.WEBHOOK_SECRET || 'demo-shared-secret';
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  await fetch('http://localhost:4000/webhooks/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Signature': signature, 'X-Timestamp': String(Date.now()) },
    body,
  });

  res.json({ pushed: true, sku, quantity });
});

app.listen(PORT, () => console.log(`mock-warehouse listening on :${PORT}`));
