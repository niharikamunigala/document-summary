const express = require('express');
const { answerQuestion } = require('../services/grokService');
const { getModels } = require('../models/index');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Missing "question" in request body.' });
        }

        const documentContext = global.latestExtractedText;
        if (!documentContext || documentContext.trim().length === 0) {
            return res.status(400).json({ error: 'No document has been uploaded yet or text could not be extracted.' });
        }

        console.log('\n✓ Chat Question:', question);
        
        try {
            const answer = await answerQuestion(documentContext, question);
            
            // Save to chat history if document ID is available
            if (global.latestDocumentId) {
                try {
                    const { ChatHistory } = getModels();
                    const chatRecord = await ChatHistory.create({
                        documentId: global.latestDocumentId,
                        question: question,
                        answer: answer
                    });
                    console.log('  ✓ Chat history saved');
                } catch (dbError) {
                    console.warn('  ⚠ Failed to save chat history:', dbError.message);
                    // Don't fail the request if database save fails
                }
            }

            res.json({ answer });
        } catch (grokError) {
            console.error('❌ Grok API failed:', grokError.message);
            
            // Provide more specific error messages
            let errorMsg = grokError.message;
            if (grokError.message.includes('Incorrect API key')) {
                errorMsg = '🔑 Invalid Grok API Key: Get a valid key from https://console.x.ai and update it in backend/.env';
            } else if (grokError.message.includes('401') || grokError.message.includes('403')) {
                errorMsg = '🔑 API Authentication Error: Please check your Grok API key in backend/.env';
            } else if (grokError.message.includes('429')) {
                errorMsg = '⏱️ API Rate Limit: Too many requests to Grok API, please wait and try again';
            } else if (grokError.message.includes('Invalid response')) {
                errorMsg = '⚠️ Unexpected response from Grok API';
            }
            
            res.status(500).json({ error: errorMsg });
        }
    } catch (error) {
        console.error('❌ Chat route error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

module.exports = router;
