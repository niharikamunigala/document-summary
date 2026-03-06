require('dotenv').config();

// Validate API key at startup
const apiKey = process.env.GROK_API_KEY;
if (!apiKey) {
    console.error('\n✗ CRITICAL: GROK_API_KEY not found in .env file!');
    process.exit(1);
} else if (apiKey === 'your_api_key_here') {
    console.error('\n✗ CRITICAL: GROK_API_KEY still has placeholder value!');
    process.exit(1);
}

console.log('✓ Grok API initialized');

/**
 * Summarizes the provided text using the Grok API.
 */
async function summarizeDocument(text) {
    if (!text || text.trim().length === 0) {
        throw new Error('No text to summarize');
    }

    console.log('  Calling Grok API...');

    try {
        const timestamp = new Date().toISOString();
        const prompt = `Summarize this legal/legislative document in simple English for non-lawyers. Focus on main points and what it means for people. Keep it concise.\n\nDocument:\n${text}\n\nTimestamp: ${timestamp}`;

        console.log('  API Key present:', !!apiKey);
        console.log('  Sending request to Grok API...');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
            
            console.error(`  ✗ API Error ${response.status}: ${errorMsg}`);
            
            if (response.status === 401 || response.status === 403) {
                throw new Error(`Authentication failed: Invalid or expired API key. Error: ${errorMsg}`);
            } else if (response.status === 400) {
                throw new Error(`Bad request: ${errorMsg}`);
            } else if (response.status === 429) {
                throw new Error(`Rate limit exceeded: ${errorMsg}`);
            } else {
                throw new Error(`API error (${response.status}): ${errorMsg}`);
            }
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('  ✗ Invalid API response format:', JSON.stringify(data).substring(0, 200));
            throw new Error('Invalid response format from Grok API');
        }

        const summary = data.choices[0].message.content;
        
        if (!summary || summary.trim().length === 0) {
            throw new Error('Grok API returned empty summary');
        }

        console.log(`  ✓ Summary Generated (${summary.length} chars)`);
        return summary;
    } catch (error) {
        console.error(`  ✗ Summarization Error:`, error.message);
        throw error;
    }
}

async function answerQuestion(documentContext, question) {
    try {
        console.log('  Calling Grok API for Q&A...');
        console.log('  Question:', question.substring(0, 100) + (question.length > 100 ? '...' : ''));
        console.log('  Context length:', documentContext.length);
        
        const prompt = `Based on the following legal document context:\n\n${documentContext}\n\nAnswer the following question clearly and concisely: ${question}`;
        
        console.log('  Sending request to Grok API...');
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
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
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
            
            console.error(`  ✗ API Error ${response.status}: ${errorMsg}`);
            
            if (response.status === 401 || response.status === 403) {
                throw new Error(`Authentication failed: Invalid API key. Error: ${errorMsg}`);
            } else if (response.status === 400) {
                throw new Error(`Bad request: ${errorMsg}`);
            } else if (response.status === 429) {
                throw new Error(`Rate limit exceeded: ${errorMsg}`);
            } else {
                throw new Error(`API error (${response.status}): ${errorMsg}`);
            }
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('  ✗ Invalid API response:', JSON.stringify(data).substring(0, 200));
            throw new Error('Invalid response format from Grok API');
        }

        const answer = data.choices[0].message.content;
        
        if (!answer || answer.trim().length === 0) {
            throw new Error('Grok API returned empty answer');
        }

        console.log(`  ✓ Answer Generated (${answer.length} chars)`);
        return answer;
    } catch (error) {
        console.error(`  ✗ Q&A Error:`, error.message);
        throw error;
    }
}

async function translateText(text, targetLang) {
    try {
        const languageName = targetLang === 'te' ? 'Telugu' : targetLang === 'hi' ? 'Hindi' : targetLang;
        console.log('  Translating to:', languageName);
        
        const prompt = `Translate the following text into ${languageName}. Return only the translated text without extra formatting or explanation:\n\n${text}`;
        
        console.log('  Sending request to Grok API...');
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
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
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
            
            console.error(`  ✗ API Error ${response.status}: ${errorMsg}`);
            
            if (response.status === 401 || response.status === 403) {
                throw new Error(`Authentication failed: Invalid API key`);
            } else if (response.status === 400) {
                throw new Error(`Bad request: ${errorMsg}`);
            } else if (response.status === 429) {
                throw new Error(`Rate limit exceeded`);
            } else {
                throw new Error(`API error (${response.status})`);
            }
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from Grok API');
        }

        const translation = data.choices[0].message.content;
        
        if (!translation || translation.trim().length === 0) {
            throw new Error('Grok API returned empty translation');
        }

        console.log(`  ✓ Translation Generated`);
        return translation;
    } catch (error) {
        console.error(`  ✗ Translation Error:`, error.message);
        throw error;
    }
}

module.exports = {
    summarizeDocument,
    answerQuestion,
    translateText
};
