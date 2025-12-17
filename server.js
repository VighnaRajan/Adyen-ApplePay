
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const ADYEN_API_KEY = "AQExhmfxJoPMahdHw0m/n3Q5qf3VZ4VID5pGVFZZwGy8n3ROlODmr0IK7OpPHkNslr/xIBDBXVsNvuR83LVYjEgiTGAH-3EJO2ZjQfvY4N+q8jvOVcZZSzL6enWyMLIsoevlTNGo=-i1iYa2r_Y69~BCYJe@)";
const ADYEN_MERCHANT_ACCOUNT = "OnebillSoftwareECOM";
const ADYEN_ENVIRONMENT = "test";
const PORT = "3000";

const ADYEN_CHECKOUT_URL =
  ADYEN_ENVIRONMENT === "LIVE"
    ? "https://checkout-live.adyen.com/v71"
    : "https://checkout-test.adyen.com/v71";

app.get("/api/paymentMethods", async (req, res) => {
  const response = await fetch(`${ADYEN_CHECKOUT_URL}/paymentMethods`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": ADYEN_API_KEY
    },
    body: JSON.stringify({
      merchantAccount: ADYEN_MERCHANT_ACCOUNT
    })
  });

  res.json(await response.json());
});

app.post("/api/payments", async (req, res) => {
  const response = await fetch(`${ADYEN_CHECKOUT_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": ADYEN_API_KEY
    },
    body: JSON.stringify({
      merchantAccount: ADYEN_MERCHANT_ACCOUNT,
      amount: { currency: "USD", value: 1000 },
      reference: "APPLEPAY_WEB_TEST",
      returnUrl: "https://example.com",
      ...req.body
    })
  });

  res.json(await response.json());
});

app.post("/api/payments/details", async (req, res) => {
  const response = await fetch(`${ADYEN_CHECKOUT_URL}/payments/details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": ADYEN_API_KEY
    },
    body: JSON.stringify(req.body)
  });

  res.json(await response.json());
});

const port = PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
