import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

async function testOpenAIAccess() {
    console.log('\n🔍 Testing OpenAI API access...')
    console.log('Using API key type:', OPENAI_API_KEY.startsWith('sk-proj-') ? 'Project key (sk-proj-)' : 'Standard key (sk-)')

    try {
        // First try to list models - this is a simpler API call
        console.log('\n📡 Testing API access by listing models...')
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        })

        console.log('\n📥 Response Status:', response.status)
        console.log('Response Headers:', Object.fromEntries(response.headers))

        const data = await response.json()
        
        if (response.ok) {
            console.log('\n✅ Successfully connected to OpenAI API!')
            console.log('Available models:', data.data.map(model => model.id).slice(0, 5), '...')
        } else {
            console.log('\n❌ Error Response:', JSON.stringify(data, null, 2))
        }

    } catch (error) {
        console.error('\n❌ Connection Error:', error)
    }
}

// Run the test
console.log('OpenAI API Key (first 12 chars):', OPENAI_API_KEY.substring(0, 12) + '...')
testOpenAIAccess()