import dotenv from 'dotenv'
import fetch from 'node-fetch'

// Load environment variables
dotenv.config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Simple test function
async function testOpenAI() {
    console.log('🚀 Starting OpenAI API test...')
    console.log('API Key format check:', OPENAI_API_KEY?.startsWith('sk-') ? '✅ Starts with sk-' : '❌ Wrong prefix')
    console.log('API Key length:', OPENAI_API_KEY?.length, 'characters')

    try {
        // First try a simple models list request
        console.log('\n📡 Testing API key with models endpoint...')
        const modelsResponse = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        })
        
        if (!modelsResponse.ok) {
            const error = await modelsResponse.text()
            console.error('❌ Models API Error:', error)
            throw new Error(`Models API Error: ${error}`)
        }

        console.log('✅ Models API access successful')

        // Now try the chat completion
        console.log('\n📡 Testing chat completion...')
        const payload = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Say hello!' }
            ],
            max_tokens: 150,
            temperature: 0.7,
            stream: false
        }

        console.log('📡 Sending request to OpenAI API...')
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload)
        })

        console.log('📥 Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers))

        const data = await response.json()
        console.log('\n✨ OpenAI API Response:', JSON.stringify(data, null, 2))

        if (data.error) {
            throw new Error(`OpenAI API Error: ${data.error.message}`)
        }

        const content = data.choices?.[0]?.message?.content
        console.log('\n🎉 Final response:', content)
        return content

    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    }
}

// Run the test
testOpenAI()
    .then(() => console.log('✅ Test completed successfully'))
    .catch(error => {
        console.error('❌ Test failed:', error)
        process.exit(1)
    })