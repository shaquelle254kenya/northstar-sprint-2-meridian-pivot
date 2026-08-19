const crypto = require('crypto');

const SECRET = process.env.WEBHOOK_SECRET || 'demo-shared-secret';
const body = JSON.stringify({ sku: 'NR-STK-001', quantity: 42 });
const signature = crypto.createHmac('sha256', SECRET).update(body).digest('hex');
const timestamp = Date.now();

fetch('http://localhost:4000/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Signature': signature,
    'X-Timestamp': String(timestamp),
  },
  body,
}).then(async (r) => console.log(r.status, await r.json()));
