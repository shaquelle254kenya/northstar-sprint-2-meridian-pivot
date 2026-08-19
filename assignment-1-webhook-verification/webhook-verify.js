const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'demo-shared-secret';

app.use(express.raw({ type: 'application/json' }));

function isValidSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const givenBuf = Buffer.from(signatureHeader, 'utf8');
  if (expectedBuf.length !== givenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}

app.post('/webhook', (req, res) => {
  const signature = req.get('X-Signature');
  const timestamp = Number(req.get('X-Timestamp'));
  const now = Date.now();

  if (!timestamp || Math.abs(now - timestamp) > 5 * 60 * 1000) {
    return res.status(401).json({ error: 'stale or missing timestamp' });
  }
  if (!isValidSignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'invalid signature' });
  }

  const payload = JSON.parse(req.body.toString('utf8'));
  console.log('[webhook] verified payload:', payload);
  res.status(200).json({ received: true });
});

app.listen(PORT, () => console.log(`webhook-verify listening on :${PORT}`));
