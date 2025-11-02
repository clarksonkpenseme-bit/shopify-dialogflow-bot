# Shopify + Dialogflow + OpenAI Webhook

[![Node.js CI](https://github.com/clarksonkpenseme-bit/shopify-dialogflow-bot/actions/workflows/nodejs.yml/badge.svg)](https://github.com/clarksonkpenseme-bit/shopify-dialogflow-bot/actions/workflows/nodejs.yml)

This repository is a minimal starter for a webhook that connects Dialogflow (fulfillment), OpenAI (GPT) and the Shopify Admin REST API.

## Features
- Express webhook endpoint for Dialogflow
- OpenAI Chat Completions integration using fetch
- Small helpers to call Shopify Admin REST API
- ES module style (Node.js `type: "module"`)
- Automated testing with Jest
- GitHub Actions CI pipeline

## Requirements
- Node.js 18+ (or any version with ESM and fetch support)
- A valid OpenAI API key
- A Shopify store and Admin API access token (private app or Admin API access)
- (Optional) ngrok for local webhook testing

## Setup

1. Clone the repo and install dependencies

```bash
npm install
```

2. Copy the environment example and fill in secrets

```bash
copy .env.example .env
# then edit .env in your editor and set the values
```

3. Run tests (optional but recommended)

```bash
npm test
```

4. Start development server

```bash
npm run dev
```

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
