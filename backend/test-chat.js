const fetch = require('node-fetch');
require('dotenv').config();

const apiKey = process.env.GROK_API_KEY;
console.log('Testing AI Legal Assistant Workflow\n');
console.log('API Key present:', !!apiKey);
console.log('API Key preview:', apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING');

async function testChatAssistant() {
    try {
        // Simulate having a document loaded
        const documentContext = `
        Data Privacy Bill 2024
        
        Section 1: Definitions
        - Personal Data: Any information relating to an identified or identifiable natural person
        - Processing: Any operation performed on personal data
        - Data Controller: Determines purpose and means of processing
        
        Section 2: Consent Requirements
        - Explicit informed consent required before collecting personal data
        - Users must be informed of data use purposes
        - Consent must be freely given and specific
        
        Section 3: User Rights
        - Right to access personal data
        - Right to rectification of inaccurate data
        - Right to erasure ('right to be forgotten')
        - Right to data portability
        - Right to object to automated decision making
        
        Section 4: Data Breach Notification
        - Must notify affected individuals within 72 hours
        - Must report to supervisory authority
        - Must document all breaches
        
        Section 5: Penalties
        - Administrative fines up to 4% of global annual revenue
        - Criminal penalties for intentional violations
        - Additional penalties for data breaches
        `;

        const question = "What are the user rights mentioned in this data privacy bill?";

        console.log('\n' + '='.repeat(60));
        console.log('Testing Question:', question);
        console.log('Document Context Length:', documentContext.length);
        console.log('='.repeat(60) + '\n');

        const prompt = `Based on the following legal document context:\n\n${documentContext}\n\nAnswer the following question clearly and concisely: ${question}`;

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'grok-2',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 500
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
            console.log('✅ AI LEGAL ASSISTANT WORKING\n');
            console.log('Question:', question);
            console.log('\nAI Response:\n');
            console.log(data.choices[0].message.content);
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

testChatAssistant().then(success => {
    if (success) {
        console.log('\n' + '='.repeat(60));
        console.log('✅ AI LEGAL ASSISTANT IS WORKING');
        console.log('='.repeat(60));
    } else {
        console.log('\n' + '='.repeat(60));
        console.log('❌ AI LEGAL ASSISTANT ERROR');
        console.log('Please check:');
        console.log('1. Grok API key in .env is valid');
        console.log('2. Backend server is running');
        console.log('3. Document has been uploaded before asking questions');
        console.log('='.repeat(60));
    }
});
