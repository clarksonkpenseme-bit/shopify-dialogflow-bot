import fetch from 'node-fetch'

const WEBHOOK_URL = 'https://shopify-dialogflow-bot-1.onrender.com/webhook'
const payload = {
  queryResult: {
    intent: { displayName: 'test.intent' },
    parameters: { param1: 'test_value' }
  }
}

async function run() {
  try {
    const resp = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    console.log('Status:', resp.status)
    const text = await resp.text()
    console.log('Body:', text)
  } catch (err) {
    console.error('Error:', err)
  }
}

run()
