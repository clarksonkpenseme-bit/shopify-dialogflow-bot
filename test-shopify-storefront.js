import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

async function testStorefrontAPI() {
    console.log('\n🛍️ Testing Shopify Storefront API...')
    console.log('Shop:', SHOPIFY_SHOP)
    console.log('Token type: Storefront API (shpss_)')

    try {
        // Storefront API uses GraphQL
        const query = `{
            shop {
                name
                primaryDomain {
                    url
                }
            }
        }`

        const response = await fetch(`https://${SHOPIFY_SHOP}/api/2024-01/graphql.json`, {
            method: 'POST',
            headers: {
                'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        })

        console.log('\n📥 Response Status:', response.status)
        const data = await response.json()
        console.log('\n✨ Response:', JSON.stringify(data, null, 2))

        if (response.ok) {
            console.log('\n✅ Storefront API connection successful!')
            return true
        } else {
            console.log('\n❌ Storefront API Error:', data)
            return false
        }

    } catch (error) {
        console.error('\n❌ Storefront API Error:', error)
        return false
    }
}

async function testStorefrontProducts() {
    console.log('\n📦 Testing Storefront Products API...')

    try {
        const query = `{
            products(first: 3) {
                edges {
                    node {
                        title
                        handle
                        priceRange {
                            minVariantPrice {
                                amount
                                currencyCode
                            }
                        }
                    }
                }
            }
        }`

        const response = await fetch(`https://${SHOPIFY_SHOP}/api/2024-01/graphql.json`, {
            method: 'POST',
            headers: {
                'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        })

        console.log('\n📥 Response Status:', response.status)
        const data = await response.json()
        console.log('\n✨ Products:', JSON.stringify(data, null, 2))

        if (response.ok && !data.errors) {
            console.log('\n✅ Successfully retrieved products!')
            return true
        } else {
            console.log('\n❌ Error retrieving products:', data.errors)
            return false
        }

    } catch (error) {
        console.error('\n❌ Error:', error)
        return false
    }
}

// Run the tests
console.log('🚀 Starting Shopify integration tests...\n')

testStorefrontAPI()
    .then(success => {
        if (success) {
            return testStorefrontProducts()
        }
    })
    .catch(error => console.error('❌ Test failed:', error))