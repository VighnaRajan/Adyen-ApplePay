
# Adyen + Apple Pay Web Drop-in (SDK v6)

## Features
- Adyen Web SDK v6
- Apple Pay rendering validation
- Recurring token (Card-on-File) support
- Render.com ready

## Environment Variables
- ADYEN_API_KEY
- ADYEN_MERCHANT_ACCOUNT
- ADYEN_ENVIRONMENT=test|LIVE
- PORT=3000

## Notes
- Replace clientKey in index.html
- Apple Pay must be enabled & domain verified in Adyen
- HTTPS is mandatory (Render provides it)

## Run
npm install
npm start
