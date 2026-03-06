const fetch = require('node-fetch');
require('dotenv').config();

const apiKey = process.env.GROK_API_KEY;
console.log('\n=== TESTING CHATBOT AI ASSISTANT ===\n');
console.log('API Key Status:', apiKey ? '✓ Present' : '✗ Missing');
if (apiKey) {
    console.log('API Key Format Check:', 
        apiKey.startsWith('gsk_') ? '✓ Correct format (gsk_)' : '✗ Wrong format'
    );
    console.log('API Key Length:', apiKey.length, 'chars');
    console.log('API Key Preview:', apiKey.substring(0, 20) + '...' + apiKey.substring(apiKey.length - 10));
}

async function testChatbotFlow() {
    console.log('\n' + '='.repeat(70));
    console.log('TEST 1: Verify Backend Connection');
    console.log('='.repeat(70) + '\n');

    try {
        const healthCheck = await fetch('http://localhost:5000/', {
            method: 'GET'
        });
        const data = await healthCheck.json();
        console.log('✅ Backend running:', data.message);
    } catch (error) {
        console.error('❌ Backend not responding:', error.message);
        console.log('\nMake sure backend server is running on port 5000!');
        return false;
    }

    console.log('\n' + '='.repeat(70));
    console.log('TEST 2: Direct Grok API Call (Question Answering)');
    console.log('='.repeat(70) + '\n');

    try {
        const documentContext = `
        Privacy Bill 2024

        Key Provisions:
        1. Companies must obtain explicit consent before collecting personal data
        2. Users have the right to data erasure
        3. Data breaches must be reported within 72 hours
        4. Fines up to 5% of revenue for non-compliance
        `;

        const question = "What is the maximum fine for non-compliance?";

        console.log('📄 Document Length:', documentContext.length);
        console.log('❓ Question:', question);
        console.log('\n📤 Calling Grok API directly...\n');

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'grok-2',
                messages: [{
                    role: 'user',
                    content: `Based on: ${documentContext}\n\nQ: ${question}`
                }],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Grok API Error:', response.status);
            console.error('Message:', data.error?.message || data);
            return false;
        }

        if (data.choices?.[0]?.message?.content) {
            console.log('✅ Grok API Working');
            console.log('\n📝 AI Response:\n');
            console.log(data.choices[0].message.content);
        }
    } catch (error) {
        console.error('❌ Grok API failed:', error.message);
        return false;
    }

    console.log('\n' + '='.repeat(70));
    console.log('TEST 3: Backend Chat Endpoint');
    console.log('='.repeat(70) + '\n');

    try {
        // First, set global context (simulate document upload)
        console.log('📤 Setting up document context...');
        
        // We can't directly set global vars, but we can test the endpoint
        console.log('⚠️  Note: Document must be uploaded first via /upload endpoint');
        console.log('   Then send question to /chat endpoint');
        
        // Try to send a chat request (will fail if no document uploaded)
        const chatResponse = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: "What is the maximum fine?"
            })
        });

        const chatData = await chatResponse.json();

        if (chatResponse.status === 400) {
            console.log('⚠️  Expected error (no document uploaded yet)');
            console.log('   Error:', chatData.error);
            console.log('   ✓ This is correct behavior');
        } else if (chatResponse.ok) {
            console.log('✅ Chat endpoint working');
            console.log('   Answer:', chatData.answer?.substring(0, 100) + '...');
        } else {
            console.error('❌ Chat endpoint error:', chatResponse.status);
            console.error('   Message:', chatData.error);
        }
    } catch (error) {
        console.error('❌ Backend request failed:', error.message);
    }

    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`
✓ Chatbot AI workflow:
  1. Upload document via POST /upload → extracts text via OCR
  2. Upload gets summary via Grok API
  3. Document text stored globally
  4. User sends question via POST /chat with { question: "..." }
  5. Grok API answers question based on document context
  6. Chat saved to database

⚠️  To test the full flow:
  1. Make sure Grok API key is VALID
  2. Upload a PDF or image via frontend
  3. Ask a question in the chat
  4. Check browser console for requests
  5. Check terminal for backend logs
    `);
}

testChatbotFlow().catch(console.error);
