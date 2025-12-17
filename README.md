
# Adyen Apple Pay Drop‑in (Adyen Certificate) – Render Ready

This project uses **Adyen's Apple Pay certificate** (NOT your own Apple cert).

## Environment Variables (Render)
- ADYEN_API_KEY
- ADYEN_MERCHANT_ACCOUNT
- BASE_URL (https://your-render-app.onrender.com)

## Deploy on Render
- Build Command: mvn clean package
- Start Command: java -jar target/adyen-applepay-0.0.1-SNAPSHOT.jar

## Apple Pay Notes
- Apple Pay appears automatically on Safari when eligible.
- Domain must be registered in Adyen Customer Area.
- Uses Adyen-hosted merchant validation internally.
