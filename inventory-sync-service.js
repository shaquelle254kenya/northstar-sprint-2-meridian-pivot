// inventory-sync-service.js
//
// FINAL deliverable — Assignment 2 (Meridian Pivot, Day 5).
// Replaces the deprecated poller (see /deprecated) with a webhook-push model,
// per the Day 4 non-negotiable pivot: polling was being killed in 48 hours.
//
// Reuses the signature-verification skill built solo in Assignment 1.

const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'demo-shared-secret';

let stockCache = {};

function isValidSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const givenBuf = Buffer.from(signatureHeader, 'utf8');
  if (expectedBuf.length !== givenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}

// Raw body needed for signature verification (see Assignment 1 journal, blocker #1)
app.use('/webhooks/inventory', express.raw({ type: 'application/json' }));
app.use(express.json());

// --- New: webhook receiver, replaces the 5-min poll loop ---
app.post('/webhooks/inventory', (req, res) => {
  const signature = req.get('X-Signature');
  const timestamp = Number(req.get('X-Timestamp'));
  const now = Date.now();

  if (!timestamp || Math.abs(now - timestamp) > 5 * 60 * 1000) {
    return res.status(401).json({ error: 'stale or missing timestamp' });
  }
  if (!isValidSignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'invalid signature' });
  }

  const { sku, quantity, updatedAt } = JSON.parse(req.body.toString('utf8'));
  stockCache[sku] = { quantity, updatedAt: updatedAt || Date.now() };
  console.log(`[webhook] stock updated: ${sku} -> ${quantity}`);
  res.status(200).json({ received: true });
});

// --- Unchanged: query endpoint keeps the exact same contract as the original spec ---
app.get('/stock/:sku', (req, res) => {
  const entry = stockCache[req.params.sku];
  if (!entry) return res.status(404).json({ error: 'unknown sku' });
  res.json({ sku: req.params.sku, ...entry });
});

app.get('/health', (req, res) =>
  res.json({ ok: true, model: 'webhook-push', cachedSkus: Object.keys(stockCache).length })
);

app.listen(PORT, () => console.log(`inventory-sync-service (webhook-push) listening on :${PORT}`));
