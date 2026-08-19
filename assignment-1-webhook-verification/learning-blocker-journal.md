# Learning & Blocker Journal — Webhook Signature Verification
Assignment 1, Days 1-2 (solo, no help allowed) — The Meridian Pivot

**Assigned tool:** Webhook signature verification (HMAC-SHA256)
**Time-box:** 4 hours
**Actual time spent:** 4h 40m

## Entries

**Day 1, 09:10** — Started from zero. Knew HMAC was "a hash with a secret" but had never implemented signature verification. Read public webhook-security documentation (no account needed) to understand the general pattern: sender signs the raw request body with a shared secret, receiver recomputes and compares.

**Day 1, 09:45** — First blocker: Express's default `express.json()` middleware parses the body into an object *before* my handler sees it, but HMAC has to be computed over the exact raw bytes the sender signed. Recomputing from `JSON.stringify(req.body)` gave a different hash than expected because key order isn't guaranteed to round-trip identically.
- Fix: switched to `express.raw({ type: 'application/json' })` so I keep the raw Buffer, verify the signature against it, and only `JSON.parse` afterwards.

**Day 1, 11:20** — Second blocker: was comparing signatures with `===`, which works but is a timing side-channel (an attacker can measure how long comparison takes to guess the correct signature byte by byte). Looked this up after seeing "timing-safe" mentioned in an unrelated security article.
- Fix: used Node's built-in `crypto.timingSafeEqual`, which requires both buffers to be the same length — added a length check first so it doesn't throw on mismatched lengths.

**Day 1, 14:00** — Got basic verification working end-to-end against a manual curl request with a correctly signed payload. Confirmed a tampered payload (changed one character) correctly gets rejected.

**Day 2, 09:30** — Added replay protection after realizing signature verification alone doesn't stop someone replaying an old, validly-signed request. Added a timestamp header and reject anything older than 5 minutes. This wasn't part of the original assignment scope but felt necessary for anything resembling a real webhook receiver — flagged in case it's out of scope for grading.

**Day 2, 10:15** — Wrote `send-test-webhook.js` so I could test signing and verification without a real external sender. Confirmed valid signature → 200, invalid signature → 401, stale timestamp → 401.

## Time-box vs. actual
- Time-boxed: 4 hours
- Actual: 4h 40m
- Overrun mostly came from the raw-body parsing blocker (about 35 min of trial and error before finding `express.raw`).

## What I'd do differently
Would start by reading about the raw-body requirement first, since re-deriving why the naive JSON approach failed cost the most time.
