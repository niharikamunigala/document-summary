const express = require('express');
const { translateText } = require('../services/grokService');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { text, language } = req.body;

        if (!text || !language) {
            return res.status(400).json({ error: 'Missing "text" and/or "language" in request body.' });
        }

        const translatedText = await translateText(text, language);
        res.json({ translatedText });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Failed to translate' });
    }
});

module.exports = router;
