
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const { Client, Config, CheckoutAPI } = require('@adyen/api-library');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

const config = new Config();
config.apiKey = process.env.ADYEN_API_KEY;
const client = new Client({ config });
client.setEnvironment(process.env.ADYEN_ENVIRONMENT === 'LIVE' ? 'LIVE' : 'TEST');
const checkout = new CheckoutAPI(client);

function validateHmac(notificationRequestItem, hmacKey) {
  const dataToSign = [
    notificationRequestItem.pspReference,
    notificationRequestItem.originalReference || "",
    notificationRequestItem.merchantAccountCode,
    notificationRequestItem.merchantReference,
    notificationRequestItem.amount.value,
    notificationRequestItem.amount.currency,
    notificationRequestItem.eventCode,
    notificationRequestItem.success
  ].join(":");

  const hmac = crypto.createHmac("sha256", Buffer.from(hmacKey, "hex"))
    .update(dataToSign)
    .digest("base64");

  return (
    hmac === notificationRequestItem.additionalData["hmacSignature"]
  );
}

app.get("/config", (req, res) => {
  res.json({ clientKey: process.env.ADYEN_CLIENT_KEY });
});

app.post('/api/adyen/payments', async (req, res) => {
  try {
    const frontendPayload = req.body;
    let applePayToken = 
      frontendPayload?.paymentMethod?.applePayToken ||
      frontendPayload?.applePayToken ||
      frontendPayload;

    const paymentsRequest = {
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
      amount: { currency: 'USD', value: 1000 },
      reference: 'ORDER-' + Date.now(),
      paymentMethod: {
        type: 'applepay',
        applePayToken: applePayToken
      },
      returnUrl: process.env.RETURN_URL
    };

    const response = await checkout.payments(paymentsRequest);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/adyen/notifications', (req, res) => {
  console.log("Webhook received");

  try {
    const hmacKey = process.env.ADYEN_HMAC_KEY;
    const item = req.body.notificationItems?.[0]?.NotificationRequestItem;
    if (!validateHmac(item, hmacKey)) {
      console.log("Invalid HMAC");
      return res.status(401).send("Invalid HMAC");
    }
  } catch (e) {
    console.log(e);
  }

  res.send('[accepted]');
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
