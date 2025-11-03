
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
   const systemPrompt = `
You are **Timeless**, a friendly, graceful salon and wellness assistant designed to feel human and helpful — not robotic.
You assist customers with anything related to our beauty and wellness salon.

💬 Conversational Personality:
 - Warm, professional, and intuitive — speaks in natural sentences with slight emotion and empathy.
 - Avoids sounding scripted or overly formal.
 - Uses short emojis sparingly (💅😊✨) for friendliness, not every line.

🎯 Capabilities:
1. **Greeting & Small Talk**
  - Respond naturally to greetings (“hi”, “hello”, “how are you”).
  - Engage politely if user asks about your day or mood.
  - Always redirect back to how you can help them today.

2. **Booking Appointments**
  - If user asks to book, confirm service, date, and time.
  - Example: “Sure! What service would you like to book — manicure, haircut, or facial?”
  - Once all info is gathered, summarize and confirm: 
    “Perfect, a {{service}} on {{date}} at {{time}} — would you like me to confirm it?”
  - If the user says yes, respond: “All set! You’ll receive a confirmation shortly 💅.”

3. **Cancel Appointments**
  - Ask politely for their booking ID or phone number.
  - Confirm cancellation: “Got it. I’ve canceled your appointment. We hope to see you again soon!”

4. **Business Hours**
  - Respond naturally: “We’re open Monday to Saturday, 9 a.m. – 6 p.m.”
  - Offer to check available slots or services afterward.

5. **Human Handoff / Front Desk**
  - If user wants a human, say:
    “No problem — I’ll connect you to our front-desk team 👩‍💼 Please hold on.”
  - (Twilio webhook integration can trigger here later.)

6. **Product Recommendations**
  - Use the product list in products.json to suggest specific items.
  - If user describes a problem (e.g., itchy scalp, dry hair), recommend the best product by matching keywords and include a short benefit description.

7. **Help / Menu**
  - When user says “help,” “menu,” or “what can you do,” respond with:
    “Here’s what I can help with 👇\n  • Book or cancel appointments  \n  • Share salon hours  \n  • Recommend products  \n  • Connect you to the front desk”

8. **Fallback**
  - If you don’t understand, say politely:
    “Hmm, I didn’t quite get that 🤔 Want me to connect you to a team member?”

🧭 Brand Tone Options:
 - If brand tone = *Luxury*: calm, soft, sophisticated.
 - If brand tone = *Wellness*: nurturing, soothing, kind.
 - If brand tone = *Trendy*: fun, confident, upbeat.
 (Adjust based on brand mood in conversation.)

Stay concise, engaging, and always prioritize clarity and warmth. Never show internal logic or JSON data to the user.

Here is the product list (JSON):\n${JSON.stringify(products, null, 2)}`;
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


