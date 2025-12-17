
# Adyen + Apple Pay (Web Drop-in) – Render Ready

## Prerequisites
- Adyen account
- Apple Pay enabled in Adyen using Adyen-provided Apple Pay certificate
- Apple Pay domain verified in Adyen
- Node.js 18+

## Environment Variables (Render)
- ADYEN_API_KEY
- ADYEN_MERCHANT_ACCOUNT
- ADYEN_ENVIRONMENT=test|live
- PORT=3000

## Notes
- Replace `clientKey` in `public/index.html`
- Use HTTPS in production (Render provides this automatically)
- Apple Pay will only appear on supported devices/browsers

## Run locally
```
npm install
npm start
```
