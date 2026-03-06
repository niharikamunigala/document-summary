const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Validate API key at startup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('\n✗ CRITICAL: GEMINI_API_KEY not found in .env file!');
    process.exit(1);
} else if (apiKey === 'your_api_key_here') {
    console.error('\n✗ CRITICAL: GEMINI_API_KEY still has placeholder value!');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
// Try to use gemini-2.0-flash first, fallback to available models
let model;
const availableModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
let selectedModel = availableModels[0];

try {
    model = genAI.getGenerativeModel({ model: selectedModel });
    console.log(`✓ Gemini API initialized with model: ${selectedModel}`);
} catch (error) {
    console.warn(`⚠ Failed to initialize with ${selectedModel}, trying other models...`);
    // This will be caught during actual API calls
}

// Store the model instance globally
global.geminiModel = model;
global.geminiGenAI = genAI;

/**
 * Summarizes the provided text using the Gemini model.
 */
async function summarizeDocument(text) {
    if (!text || text.trim().length === 0) {
        throw new Error('No text to summarize');
    }

    console.log('  Calling Gemini API...');

    try {
        const timestamp = new Date().toISOString();
        const prompt = `Summarize this legal document in simple English for non-lawyers. Focus on main points and what it means for people.\\n\\nDocument:\\n${text}\\n\\nTimestamp: ${timestamp}`;

        console.log('  API Key present:', !!apiKey);
        console.log('  Sending request...');

        const model = global.geminiModel || genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);

        if (!result || !result.response) {
            throw new Error('Empty API response');
        }

        const summary = result.response.text();
        
        if (!summary || summary.trim().length === 0) {
            throw new Error('API returned empty summary');
        }

        console.log(`  ✓ Summary Generated`);
        return summary;
    } catch (error) {
        console.error(`  ✗ API Response Error:`, error.message);
        const errorMsg = error.message || '';
        
        // Check for model not found
        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            throw new Error('Model not found - check API key and model availability');
        }
        
        // Check for API key issues
        if (errorMsg.includes('UNAUTHENTICATED') || errorMsg.includes('invalid')) {
            throw new Error('API authentication failed - check your API key');
        }
        
        throw new Error(`API Error: ${error.message}`);
    }
}

async function answerQuestion(documentContext, question) {
    try {
        const prompt = `Based on the following legal document context:\n\n${documentContext}\n\nAnswer the following question clearly and concisely: ${question}`;
        const model = global.geminiModel || genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        throw new Error('Failed to answer: ' + error.message);
    }
}

async function translateText(text, targetLang) {
    try {
        const languageName = targetLang === 'te' ? 'Telugu' : targetLang === 'hi' ? 'Hindi' : targetLang;
        const prompt = `Translate the following text into ${languageName}. Return only the translated text without extra formatting or explanation:\n\n${text}`;
        const model = global.geminiModel || genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        throw new Error('Failed to translate: ' + error.message);
    }
}

module.exports = {
    summarizeDocument,
    answerQuestion,
    translateText
};
