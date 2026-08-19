# Northstar Retail Co. — Sprint 2: The Meridian Pivot

Individual submission. Inventory sync service, originally spec'd as a poller,
pivoted to a webhook-push model on Day 4 per the client's non-negotiable instruction.

## Structure
- `assignment-1-webhook-verification/` — Day 1–2 solo prototype (unfamiliar tool: webhook signature verification) + Learning & Blocker Journal
- `deprecated/inventory-sync-original.js` — Day 3 original polling spec, kept for the audit trail, not run in production
- `inventory-sync-service.js` — Day 5 final deliverable, webhook-push model
- `mock-warehouse.js` — local stand-in for Northstar's warehouse API/webhook sender
- `scope-delta-analysis.md` — Assignment 2 required document
- `adaptability-index.md` — Assignment 3, confidential self-assessment

## Run it locally
npm install
node mock-warehouse.js          # terminal 1 — fake warehouse, port 4002
node inventory-sync-service.js  # terminal 2 — final service, port 4000
curl -X POST http://localhost:4002/simulate-change -H "Content-Type: application/json" -d '{"sku":"NR-STK-001","quantity":99}'
curl http://localhost:4000/stock/NR-STK-001
