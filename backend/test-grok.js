const fetch = require('node-fetch');
require('dotenv').config();

const apiKey = process.env.GROK_API_KEY;
console.log('Testing Grok API...');
console.log('API Key present:', !!apiKey);
console.log('API Key preview:', apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING');

async function testGrokAPI() {
    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'grok-2',
                messages: [{ role: 'user', content: 'Say hello' }],
                temperature: 0.7,
                max_tokens: 100
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('\n❌ API ERROR\n');
            console.error('Status:', response.status);
            console.error('Error:', data.error || data);
            return false;
        }

        if (data.error) {
            console.error('\n❌ API RETURNED ERROR\n');
            console.error('Error:', data.error);
            return false;
        }

        if (data.choices?.[0]?.message?.content) {
            console.log('\n✅ GROK API WORKING\n');
            console.log('Response:', data.choices[0].message.content);
            return true;
        } else {
            console.error('\n⚠️  UNEXPECTED RESPONSE\n');
            console.log('Response:', JSON.stringify(data, null, 2));
            return false;
        }
    } catch (error) {
        console.error('\n❌ REQUEST ERROR\n');
        console.error('Error:', error.message);
        return false;
    }
}

testGrokAPI();
