// deprecated/inventory-sync-original.js
//
// DEPRECATED as of Day 4 (Meridian Pivot) — polling was killed by the client
// with no extension. Kept here for the audit trail / Scope Delta Analysis,
// NOT imported by the running service. See scope-delta-analysis.md.
//
// Original Day 3 spec: poll a warehouse API every 5 minutes, cache stock,
// expose a query endpoint.

const express = require('express');

const app = express();
const PORT = process.env.PORT || 4001;
const WAREHOUSE_API = process.env.WAREHOUSE_API || 'http://localhost:4002/warehouse/stock';
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes, per original spec

let stockCache = {};

async function pollWarehouse() {
  try {
    const res = await fetch(WAREHOUSE_API);
    const data = await res.json(); // [{ sku, quantity }, ...]
    data.forEach((item) => {
      stockCache[item.sku] = { quantity: item.quantity, updatedAt: Date.now() };
    });
    console.log(`[poller] refreshed ${data.length} SKUs at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[poller] warehouse poll failed:', err.message);
  }
}

app.get('/stock/:sku', (req, res) => {
  const entry = stockCache[req.params.sku];
  if (!entry) return res.status(404).json({ error: 'unknown sku' });
  res.json({ sku: req.params.sku, ...entry });
});

setInterval(pollWarehouse, POLL_INTERVAL_MS);
pollWarehouse(); // prime the cache on boot

app.listen(PORT, () => console.log(`inventory-sync-original (polling) listening on :${PORT}`));
