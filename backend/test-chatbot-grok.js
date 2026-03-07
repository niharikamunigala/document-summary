// Direct chatbot test by simulating document context
async function testChatbot() {
    try {
        console.log('\n📋 Testing Chatbot Q&A with Grok API...\n');
        
        // Sample document that would normally come from upload
        const sampleDocument = `LEGISLATIVE DOCUMENT: CLIMATE CHANGE ACTION ACT 2024

Section 1: Purpose
This Act establishes a framework for reducing greenhouse gas emissions and promoting clean energy adoption across the nation. The primary goal is to achieve net-zero emissions by 2050.

Section 2: Renewable Energy Requirements
All utilities must source at least 50% of electricity from renewable sources by 2030, increasing to 80% by 2040.

Section 3: Carbon Tax
A carbon tax of $50 per metric ton of CO2 will be implemented starting in 2025, with annual increases of $15 per ton.

Section 4: Incentives
The government will provide tax credits for electric vehicle purchases and home energy efficiency upgrades.

Section 5: Enforcement
Violations of this act will result in fines up to $1,000,000 and potential criminal penalties for willful violations.`;
        
        console.log('✓ Sample document created');
        console.log(`  Content length: ${sampleDocument.length} characters\n`);
        
        // Test chat endpoint with simulated context
        console.log('📤 Testing chatbot questions...\n');
        
        const questions = [
            'What is the main purpose of this act?',
            'What renewable energy requirements are mentioned?',
            'What is the carbon tax amount?',
            'What are the penalties for violations?'
        ];
        
        let successCount = 0;
        let failureCount = 0;
        
        for (const question of questions) {
            console.log(`❓ Question: "${question}"`);
            
            try {
                const response = await fetch('http://localhost:5000/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: question })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    console.log(`   ❌ Error (${response.status}): ${data.error}`);
                    failureCount++;
                } else if (data.answer) {
                    console.log(`   ✅ Answer: ${data.answer.substring(0, 160)}...`);
                    successCount++;
                } else {
                    console.log(`   ❌ No answer received`);
                    failureCount++;
                }
            } catch (error) {
                console.log(`   ❌ Request failed: ${error.message}`);
                failureCount++;
            }
            console.log('');
        }
        
        console.log(`\n📊 Test Results:`);
        console.log(`   ✅ Successful: ${successCount}/${questions.length}`);
        console.log(`   ❌ Failed: ${failureCount}/${questions.length}`);
        
        if (successCount === 0) {
            console.log('\n⚠️  Chatbot is not working. Check:');
            console.log('   1. Is the backend server running on port 5000?');
            console.log('   2. Is the Grok API key valid in .env file?');
            console.log('   3. Check the server console for detailed error messages');
        }
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testChatbot();
