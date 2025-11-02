import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP // e.g. your-shop.myshopify.com
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set. OpenAI calls will fail.')
}

// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// Main Dialogflow webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body

    // Dialogflow v2 webhook structure
    const intent = body?.queryResult?.intent?.displayName || 'unknown'
    const parameters = body?.queryResult?.parameters || {}

    console.log('Incoming intent:', intent)

    // Create a simple prompt for OpenAI based on the intent and parameters
    const userPrompt = `You are a helpful assistant for a Shopify store. The Dialogflow intent is: ${intent}. Parameters: ${JSON.stringify(
      parameters
    )}. Provide a concise reply and, if asked to interact with Shopify, return a JSON action block with an action and payload.`

    const aiResponse = await callOpenAI(userPrompt)

    // Try to parse an action from the assistant's content if present
    const assistantText = aiResponse?.trim() || 'Sorry, I could not generate a response.'

    // Simple pattern: assistant may return a JSON block like {"action":"create_order","payload":{...}}
    let shopifyResult = null
    try {
      const jsonMatch = assistantText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const possibleJson = JSON.parse(jsonMatch[0])
        if (possibleJson.action === 'create_order' && SHOPIFY_SHOP && SHOPIFY_ACCESS_TOKEN) {
          shopifyResult = await shopifyCreateOrder(possibleJson.payload)
        }
        if (possibleJson.action === 'get_product' && SHOPIFY_SHOP && SHOPIFY_ACCESS_TOKEN) {
          shopifyResult = await shopifyGetProduct(possibleJson.payload?.id)
        }
      }
    } catch (err) {
      // ignore parse errors; assistant likely returned plain text
      console.warn('No actionable JSON found in assistant text or parsing failed:', err.message)
    }

    // Build fulfillment response for Dialogflow
    const fulfillment = shopifyResult
      ? `${assistantText}\n\nShopify result: ${JSON.stringify(shopifyResult)}`
      : assistantText

    return res.json({ fulfillmentText: fulfillment })
  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(500).json({ fulfillmentText: 'Internal server error' })
  }
})

// OpenAI helper using fetch and the Chat Completions API
async function callOpenAI(prompt) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured')

  const payload = {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that speaks concisely.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.2
  }

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  })

  if (!resp.ok) {
    const txt = await resp.text()
    throw new Error(`OpenAI error ${resp.status}: ${txt}`)
  }

  const data = await resp.json()
  const content = data?.choices?.[0]?.message?.content
  return content
}

// Shopify helpers (basic examples using REST Admin API)
async function shopifyCreateOrder(orderPayload) {
  if (!SHOPIFY_SHOP || !SHOPIFY_ACCESS_TOKEN) throw new Error('Shopify not configured')

  const url = `https://${SHOPIFY_SHOP}/admin/api/2025-04/orders.json`
  const body = { order: orderPayload }

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
    },
    body: JSON.stringify(body)
  })

  if (!resp.ok) {
    const txt = await resp.text()
    throw new Error(`Shopify create order failed: ${resp.status} ${txt}`)
  }

  return resp.json()
}

async function shopifyGetProduct(id) {
  if (!SHOPIFY_SHOP || !SHOPIFY_ACCESS_TOKEN) throw new Error('Shopify not configured')
  if (!id) throw new Error('Product id required')

  const url = `https://${SHOPIFY_SHOP}/admin/api/2025-04/products/${id}.json`

  const resp = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
    }
  })

  if (!resp.ok) {
    const txt = await resp.text()
    throw new Error(`Shopify get product failed: ${resp.status} ${txt}`)
  }

  return resp.json()
}

app.listen(PORT, () => {
  console.log(`Dialogflow-OpenAI-Shopify webhook running on port ${PORT}`)
})

export default app
