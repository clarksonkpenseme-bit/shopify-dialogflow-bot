import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

async function testShopifyAccess() {
    console.log('\n🔍 Testing Shopify API access...')
    console.log('Shop:', SHOPIFY_SHOP)
    console.log('Access Token (first 10 chars):', SHOPIFY_ACCESS_TOKEN?.substring(0, 10) + '...')

    try {
        // Test by getting shop information
        const url = `https://${SHOPIFY_SHOP}/admin/api/2024-01/shop.json`
        console.log('\n📡 Testing Shopify API:', url)

        const response = await fetch(url, {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        })

        console.log('\n📥 Response Status:', response.status)
        
        const data = await response.json()
        console.log('\n✨ Shop Info:', JSON.stringify(data, null, 2))

        if (response.ok) {
            console.log('\n✅ Successfully connected to Shopify API!')
            return true
        } else {
            console.log('\n❌ Error:', data)
            return false
        }

    } catch (error) {
        console.error('\n❌ Connection Error:', error)
        return false
    }
}

// Now test the webhook with Shopify integration
async function testWebhookWithShopify() {
    const WEBHOOK_URL = 'https://shopify-dialogflow-bot-1.onrender.com/webhook'
    
    // Sample Dialogflow request that triggers Shopify interaction
    const testRequest = {
        queryResult: {
            intent: {
                displayName: 'get.products'
            },
            parameters: {
                action: 'list_products'
            }
        }
    }

    console.log('\n🔍 Testing webhook with Shopify integration...')
    console.log('URL:', WEBHOOK_URL)
    console.log('Request:', JSON.stringify(testRequest, null, 2))

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testRequest)
        })

        console.log('\n📥 Webhook Response Status:', response.status)
        
        const data = await response.json()
        console.log('\n✨ Webhook Response:', JSON.stringify(data, null, 2))

    } catch (error) {
        console.error('\n❌ Webhook Error:', error)
    }
}

// Run the tests
console.log('🚀 Starting Shopify integration tests...\n')

testShopifyAccess()
    .then(success => {
        if (success) {
            return testWebhookWithShopify()
        }
    })
    .catch(error => console.error('❌ Test failed:', error))