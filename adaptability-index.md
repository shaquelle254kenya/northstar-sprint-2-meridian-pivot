# Adaptability Index (Confidential) — Self-Assessment
Assignment 3, Day 5 — The Meridian Pivot
Submitted by: Collins Onyango — Individual submission

This sprint had no fixed team, so this is a self-assessment against the same five criteria the rubric asks peers to rate. If a cohort peer-review pass happens later, those ratings replace or sit alongside this one — this is not a substitute for that.

| Criterion | Self-rating (1-5) | Note |
|---|---|---|
| Composure under the pivot | 4 | Day 4 meant discarding a working poller with no extension. Didn't try to negotiate scope back; moved straight to identifying what could be reused (the Assignment 1 verification code) rather than starting over from zero. |
| Communication | 4 | Documented the Day 4 decision points in the Scope Delta Analysis as they happened rather than reconstructing them afterward. |
| Flexibility | 5 | The original poller was fully working before the pivot; rebuilding around a push model instead of patching the old one was the harder but more honest choice. |
| Contribution | 4 | Shipped both the original-spec version and the pivoted version, plus the reusable verification middleware. |
| Rehire | 4 | Would want to close the cold-start gap before calling this production-ready — noted honestly in the backlog rather than hidden. |

**What actually cost time in the pivot:** getting the raw-body handling right so the webhook route could verify signatures while the rest of the app still used normal JSON parsing (`express.raw` scoped only to `/webhooks/inventory`, `express.json` everywhere else) — this wasn't obvious on the first attempt and cost roughly 30 minutes.
