require('dotenv').config();

async function validateAndFixAPI() {
    console.log('\n🔍 Legislative Document Summarizer - API Validation Tool\n');
    console.log('═'.repeat(60));
    
    const apiKey = process.env.GROK_API_KEY;
    
    // Step 1: Check if API key exists
    console.log('\n✓ Step 1: Check if API key exists');
    if (!apiKey) {
        console.log('   ❌ GROK_API_KEY not found in .env file\n');
        showFixInstructions();
        return;
    }
    console.log('   ✅ API Key found\n');
    
    // Step 2: Validate API key format
    console.log('✓ Step 2: Validate API key format');
    console.log(`   Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
    console.log(`   Length: ${apiKey.length} characters`);
    
    if (!apiKey.startsWith('gsk_')) {
        console.log('   ⚠️  Key format warning: Should start with "gsk_"\n');
    } else {
        console.log('   ✅ Key format looks correct\n');
    }
    
    // Step 3: Test API connection
    console.log('✓ Step 3: Testing Grok API connection...\n');
    
    try {
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
                        content: 'Test: Say "API Connection Successful" if you can read this. Keep response under 10 words.'
                    }
                ],
                temperature: 0.7,
                max_tokens: 50
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.log(`   📡 API Response: ${response.status}`);
            console.log(`   ❌ Error: ${data.error?.message || data.error || 'Unknown error'}\n`);
            
            if (data.error?.message?.includes('Incorrect API key')) {
                console.log('   ⚠️  The API key is INVALID\n');
                showFixInstructions();
                return;
            }
        } else if (data.choices?.[0]?.message?.content) {
            console.log(`   ✅ API Response: ${data.choices[0].message.content}\n`);
            console.log('═'.repeat(60));
            console.log('\n✅ SUCCESS! Your Grok API Key is working correctly!\n');
            console.log('The chatbot and document summarization should now work.\n');
            return;
        }
        
    } catch (error) {
        console.log(`   ❌ Connection failed: ${error.message}\n`);
    }
    
    showFixInstructions();
}

function showFixInstructions() {
    console.log('═'.repeat(60));
    console.log('\n📋 HOW TO FIX:\n');
    console.log('1. Go to: https://console.x.ai');
    console.log('2. Sign in with your xAI account');
    console.log('3. Click on "API Keys" or "Create API Key"');
    console.log('4. Copy the full API key (should start with "gsk_")\n');
    console.log('5. Open: backend/.env');
    console.log('6. Replace:');
    console.log('   GROK_API_KEY=your_api_key_here\n');
    console.log('7. With your actual key:');
    console.log('   GROK_API_KEY=gsk_YOUR_FULL_KEY_HERE\n');
    console.log('8. Save the file and restart the server\n');
    console.log('═'.repeat(60) + '\n');
}

validateAndFixAPI();
