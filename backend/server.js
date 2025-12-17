const express = require('express');
const path = require('path');
const { Client, CheckoutAPI } = require('@adyen/api-library');

const app = express();
app.use(express.json());

// Adyen client
const client = new Client({ apiKey: process.env.ADYEN_API_KEY, environment: 'TEST' });
const checkout = new CheckoutAPI(client);

// Sessions endpoint
app.post('/api/sessions', async (req, res) => {
  try {
    const response = await checkout.sessions({
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
      amount: { currency: 'USD', value: 1000 },
      reference: 'render-applepay-demo',
      returnUrl: process.env.BASE_URL,
      countryCode: 'US'
    });
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
