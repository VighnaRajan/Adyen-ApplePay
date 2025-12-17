
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, CheckoutAPI } from '@adyen/api-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const client = new Client({
  apiKey: process.env.ADYEN_API_KEY,
  environment: 'TEST'
});

const checkout = new CheckoutAPI(client);

app.post('/api/sessions', async (req, res) => {
  try {
    const response = await checkout.sessions({
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
      amount: { currency: 'USD', value: 1000 },
      reference: 'render-applepay-node',
      returnUrl: process.env.BASE_URL,
      countryCode: 'US'
    });
    res.json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on ${port}`));
