const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing Gemini API Key...');
console.log('Key:', apiKey ? '✓ Present' : '✗ Missing');
console.log('Key Format:', apiKey ? (apiKey.startsWith('AIza') ? '✓ Correct (AIza...)' : '✗ Wrong format') : 'N/A');

if (apiKey) {
    console.log('\nTesting API connection...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    model.generateContent('Say hello')
        .then(result => {
            console.log('✓ API Connection SUCCESS');
            console.log('Response:', result.response.text().substring(0, 50));
        })
        .catch(err => {
            console.error('✗ API Connection FAILED');
            console.error('Error:', err.message);
            console.error('Status:', err.status);
        });
} else {
    console.error('✗ No API key provided');
}
