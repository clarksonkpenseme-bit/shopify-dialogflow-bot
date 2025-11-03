
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Load products.json at startup
const productsPath = path.resolve(process.cwd(), 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// --- POST /chat route ---
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const systemPrompt = `You are a helpful assistant for a hair care store. ONLY use the following product list to answer questions. If a product is not in the list, say you don't have it. Here is the product list (JSON):\n${JSON.stringify(products, null, 2)}`;
    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.2
    };
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    console.log('📥 Received response from OpenAI API:', {
      status: response.status,
      statusText: response.statusText
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error Response:', errorText);
      throw new Error(`OpenAI error ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    res.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


