/**
 * Minimal Node/Express backend for Apple Pay + Adyen sample
 * - Serves static files from /public
 * - POST /api/adyen/applepay/sessions -> requests an Apple session from Adyen (Adyen-managed cert)
 * - POST /api/adyen/payments -> forwards Apple Pay token to Adyen /payments (sandbox)
 *
 * NOTE: Do not commit your ADYEN_API_KEY or merchant certs to git.
 */
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const bodyParser = require('body-parser');

const ADYEN_API_KEY = process.env.ADYEN_API_KEY;
const ADYEN_MERCHANT_ACCOUNT = process.env.ADYEN_MERCHANT_ACCOUNT;
const ADYEN_CHECKOUT_BASE = process.env.ADYEN_CHECKOUT_BASE || 'https://checkout-test.adyen.com/v67';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const https = require('https');
const fs = require('fs');

const APPLE_PAY_MERCHANT_ID = "merchant.com.onebill.payment1";
const APPLE_PAY_KEY_PATH = "/etc/secrets/merchant_com_onebill_payment1_merchant_id.key";
const APPLE_PAY_CERT_PATH = "/etc/secrets/merchant_com_onebill_payment1_merchant_id.pem";

app.post('/api/applepay/validate-merchant', async (req, res) => {
  try {
    const { validationURL, domainName, displayName } = req.body;

    if (!validationURL) {
      return res.status(400).json({ error: 'validationURL is required' });
    }
    if (!validationURL.startsWith('https://apple-pay-gateway-cert.apple.com')) {
      throw new Error('Invalid Apple validation URL');
    }

    const payload = JSON.stringify({
      merchantIdentifier: APPLE_PAY_MERCHANT_ID,
      domainName,
      displayName: displayName || 'OneBill Store',
      initiative: 'web',
      initiativeContext: domainName
    });

    const cert = fs.readFileSync(APPLE_PAY_CERT_PATH, "utf8").replace(/^\uFEFF/, '');
    const key  = fs.readFileSync(APPLE_PAY_KEY_PATH, "utf8").replace(/^\uFEFF/, '');

    const agent = new https.Agent({
      cert,
      key
    });
    const requestOptions = {
      method: 'POST',
      hostname: 'apple-pay-gateway.apple.com',
      path: "/paymentservices/startSession",
      agent,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const appleReq = https.request(validationURL, requestOptions, appleRes => {
      let data = '';
      appleRes.on('data', chunk => (data += chunk));
      appleRes.on('end', () => {
        res.status(appleRes.statusCode).send(data);
      });
    });

    appleReq.write(payload);
    appleReq.end();
  } catch (err) {
    console.error(JSON.stringify(err));
    res.status(500).json({
      error: 'Internal error',
      message: err.message,
      stack: err.stack
    });
  }
});

// Send Apple Pay token to Adyen /payments (sandbox)
app.post('/api/adyen/payments', async (req, res) => {
  if (!ADYEN_API_KEY) return res.status(500).json({ error: 'ADYEN_API_KEY not configured' });
  const { paymentData, amount } = req.body || {};
  if (!paymentData) return res.status(400).json({ error: 'paymentData required' });

  // Adyen expects applePayToken as base64 encoded JSON
  const applePayTokenBase64 = Buffer.from(JSON.stringify(paymentData)).toString('base64');

  const payload = {
    amount: amount || { currency: 'EUR', value: 1000 },
    paymentMethod: { type: 'applepay' },
    applePayToken: applePayTokenBase64,
    reference: `ORDER-${Date.now()}`,
    merchantAccount: ADYEN_MERCHANT_ACCOUNT
  };

  try {
    const resp = await fetch(`${ADYEN_CHECKOUT_BASE}/payments`, {
      method: 'POST',
      headers: {
        'x-api-key': ADYEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const json = await resp.json();
    return res.json(json);
  } catch (err) {
    console.error('adyen payments error', err);
    return res.status(500).json({ error: 'internal' });
  }
});

// Serve SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
