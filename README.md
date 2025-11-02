# Shopify + Dialogflow + OpenAI Webhook

This repository is a minimal starter for a webhook that connects Dialogflow (fulfillment), OpenAI (GPT) and the Shopify Admin REST API.

Features
- Express webhook endpoint for Dialogflow
- OpenAI Chat Completions integration using fetch
- Small helpers to call Shopify Admin REST API
- ES module style (Node.js `type: "module"`)

Requirements
- Node.js 18+ (or any version with ESM and fetch support). This scaffold uses `node-fetch`.
- A valid OpenAI API key
- A Shopify store and Admin API access token (private app or Admin API access)
- (Optional) ngrok for local webhook testing

Setup

1. Clone the repo and install dependencies

npm install

2. Copy the environment example and fill in secrets

copy .env.example .env
Edit `.env` and set the values for your environment.

3. Run locally (development)

npm run dev

4. Expose to the internet using ngrok (for Dialogflow webhook URL)

ngrok http 3000

Point your Dialogflow fulfillment webhook to the ngrok HTTPS URL + /webhook, for example:

https://abcd1234.ngrok.io/webhook

Dialogflow fulfillment
- The endpoint expects Dialogflow v2 webhook format and returns a JSON object with `fulfillmentText`.
- The webhook will send the Dialogflow intent and parameters to OpenAI to generate a helpful reply.
- If the assistant returns a JSON action block (for example `{ "action": "create_order", "payload": {...} }` ), the webhook will
  attempt to call Shopify to perform that action and append the result to the fulfillment text.

Scripts
- `npm start` — Runs the app (production)
- `npm run dev` — Runs with `nodemon` for development

Notes and best practices
- Never commit real secrets. Use `.env` and `.gitignore` (this repo ignores `.env`).
- Use secure storage for production credentials (AWS Secrets Manager, Azure Key Vault, etc.).
- Limit the permissions of your Shopify access token to only the scopes you need.

Troubleshooting
- If OpenAI calls fail, check `OPENAI_API_KEY` in `.env` and ensure network access.
- If Shopify calls fail, verify `SHOPIFY_SHOP` and `SHOPIFY_ACCESS_TOKEN` and API versioning.
