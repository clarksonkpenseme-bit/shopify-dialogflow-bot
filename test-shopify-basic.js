import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

async function testBasicAccess() {
    console.log('\n🔍 Testing basic Shopify access...')
    console.log('Shop URL:', `https://${SHOPIFY_SHOP}`)
    console.log('Access Token type:', SHOPIFY_ACCESS_TOKEN?.startsWith('shpss_') ? 'Storefront API' : 'Unknown')

    try {
        // Try to access the /meta.json endpoint which is publicly accessible
        console.log('\n📡 Testing shop availability...')
        const response = await fetch(`https://${SHOPIFY_SHOP}/meta.json`)
        
        console.log('Response status:', response.status)
        const data = await response.json()
        console.log('Shop meta data:', data)

        if (response.ok) {
            console.log('\n✅ Shop is accessible!')
        }

        // Now test the Storefront API directly
        console.log('\n📡 Testing Storefront API access...')
        const storefrontResponse = await fetch(`https://${SHOPIFY_SHOP}/api/unstable/graphql.json`, {
            method: 'POST',
            headers: {
                'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `{
                    shop {
                        name
                    }
                }`
            })
        })

        console.log('Storefront API response status:', storefrontResponse.status)
        const storefrontData = await storefrontResponse.json()
        console.log('Storefront API response:', JSON.stringify(storefrontData, null, 2))

    } catch (error) {
        console.error('❌ Error:', error)
    }
}

// Run test
testBasicAccess()