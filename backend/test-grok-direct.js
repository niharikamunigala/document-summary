require('dotenv').config();

async function testGrokAPI() {
    console.log('\n🔧 Testing Grok API Connection...\n');
    
    const apiKey = process.env.GROK_API_KEY;
    
    if (!apiKey) {
        console.error('❌ GROK_API_KEY not found in .env');
        return;
    }
    
    console.log('✓ API Key found');
    console.log(`  Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}\n`);
    
    try {
        console.log('📤 Sending test request to Grok API...\n');
        
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'grok-2',
                messages: [
                    {
                        role: 'user',
                        content: 'Answer in one sentence: What is 2+2?'
                    }
                ],
                temperature: 0.7,
                max_tokens: 100
            })
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        console.log(`Response: ${JSON.stringify(data, null, 2)}\n`);
        
        if (response.ok && data.choices && data.choices[0]) {
            console.log('✅ Grok API is working!');
            console.log(`Answer: ${data.choices[0].message.content}`);
        } else {
            console.error('❌ Grok API error or unexpected response');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testGrokAPI();
