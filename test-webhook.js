import fetch from 'node-fetch'

const WEBHOOK_URL = 'http://localhost:4018/webhook'

// Sample Dialogflow v2 request
const testRequest = {
    queryResult: {
        intent: {
            displayName: 'test.intent'
        },
        parameters: {
            param1: 'test_value'
        }
    }
}

async function testWebhook() {
    console.log('🔍 Testing Dialogflow webhook...')
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

        console.log('\n📥 Response Status:', response.status)
        
        const data = await response.json()
        console.log('\n✨ Webhook Response:', JSON.stringify(data, null, 2))

        if (data.fulfillmentText) {
            console.log('\n✅ Fulfillment text:', data.fulfillmentText)
        }

    } catch (error) {
        console.error('\n❌ Error:', error)
    }
}

// Run the test
testWebhook()