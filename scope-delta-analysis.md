# Scope Delta Analysis — Polling → Webhook Push Pivot
Assignment 2, Day 5 — The Meridian Pivot

**Trigger:** Day 4, client announced the polling method would be killed in 48 hours. No extension, no negotiating back to the original spec.

## Dropped
- `setInterval` 5-minute poll loop (`pollWarehouse()` in the original service).
- Direct GET calls from our service to `/warehouse/stock` — the warehouse no longer accepts being polled.
- The "prime the cache on boot" poll-once call, since there's nothing to poll on boot anymore; cache now starts empty and fills as webhooks arrive.

## Modified
- Cache-update trigger changed from a timer tick to an inbound event: `pollWarehouse()` (pull) became `POST /webhooks/inventory` (push).
- Startup behavior changed: the service now starts with a cold cache and is correct only once the warehouse has pushed at least one update per SKU — documented as a known limitation below.

## Added
- Webhook signature verification middleware (HMAC-SHA256 + timing-safe compare), carried over from the Assignment 1 solo prototype.
- Replay protection via a 5-minute timestamp window (also from Assignment 1 — this turned out to be directly reusable, not just practice).
- `/health` endpoint reporting how many SKUs are currently cached, added so Northstar's team can sanity-check the cold-cache limitation without reading logs.

## Regression check
- `GET /stock/:sku` — contract unchanged (same path, same response shape `{ sku, quantity, updatedAt }`). Anything downstream reading from this endpoint (e.g. the Sprint 1 support chatbot's stock-availability lookup) needs no changes.
- Verified manually: a value pushed via `/webhooks/inventory` is immediately readable via `/stock/:sku` with the same shape the poller used to produce. Tested locally: `simulate-change` → webhook → `/stock/:sku` returns the new quantity, and an unsigned POST to `/webhooks/inventory` is correctly rejected with 401.

## Known limitation introduced by the pivot
- Cold-start gap: until the warehouse has pushed at least one webhook per SKU, `/stock/:sku` returns 404 instead of a (possibly stale) cached value. The polling model never had this gap because it fetched everything on boot. Flagging this as a backlog item rather than solving it under the 48-hour deadline.

## Reprioritized backlog (post-pivot)
1. **High** — Ask the warehouse team for a one-time full-catalog snapshot endpoint to solve the cold-start gap (was not needed under polling).
2. **High** — Add a dead-letter log for webhooks that fail signature verification, so a misconfigured secret on the warehouse side is visible immediately instead of silently dropping updates.
3. **Medium** — Add idempotency handling in case the warehouse retries a webhook delivery (currently a duplicate delivery just re-applies the same value, which is safe but wasteful).
4. **Low** — Move the shared webhook secret out of an environment variable and into a proper secrets manager before production traffic.
