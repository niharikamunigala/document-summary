const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractText } = require('../services/ocrService');
const { summarizeDocument } = require('../services/grokService');
const { getModels } = require('../models/index');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.bmp', '.tiff'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
            return cb(new Error(`File type not allowed. Supported types: ${allowed.join(', ')}`));
        }
        cb(null, true);
    }
});

// Error handler for multer
router.post('/', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
            }
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ error: 'No file uploaded. Please upload a PDF, JPG, or PNG document.' });
        }

        const filePath = req.file.path;
        console.log('\n=== UPLOAD ROUTE START ===');
        console.log('File:', req.file.originalname);
        console.log('Size:', req.file.size, 'bytes');
        console.log('Path:', filePath);

        // 1. Extract text using OCR or PDF parser
        let extractedText = '';
        try {
            console.log('\nStep 1: Extracting text...');
            extractedText = await extractText(filePath);
            console.log('Text extracted successfully');
            console.log('Extracted text length:', extractedText.length);
            console.log('First 200 chars:', extractedText.substring(0, 200));
        } catch (ocrError) {
            console.error('OCR Error:', ocrError.message);
            return res.status(500).json({ error: `Text extraction failed: ${ocrError.message}` });
        }

        // guard against empty extraction
        if (!extractedText || extractedText.trim().length === 0) {
            console.warn('No text extracted from file');
            return res.status(400).json({ error: 'No text could be extracted from the uploaded file. Please check the file format or try a different document.' });
        }

        // 2. Save the extracted text globally so the Chatbot API can use it as context.
        global.latestExtractedText = extractedText;
        console.log('\nStep 2: Text saved to global context');

        // 3. Summarize with Grok API
        try {
            console.log('\nStep 3: Calling Grok API for summarization...');
            const summary = await summarizeDocument(extractedText);
            console.log('Summary generated successfully');
            console.log('Summary length:', summary.length);

            // 4. Save document to database
            console.log('\nStep 4: Saving to database...');
            const ext = path.extname(req.file.originalname).toLowerCase();
            const fileType = ext === '.pdf' ? 'pdf' : 'image';
            
            try {
                const { Document } = getModels();
                const document = await Document.create({
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    fileSize: req.file.size,
                    fileType: fileType,
                    filePath: filePath,
                    extractedText: extractedText,
                    summary: summary
                });

                global.latestDocumentId = document.id;
                console.log('  ✓ Saved (ID:', document.id, ')');
            } catch (dbErr) {
                console.warn('  ⚠ DB save skipped:', dbErr.message);
            }

            console.log('\n✓ COMPLETE\n');
            res.json({ summary, documentId: global.latestDocumentId });
        } catch (grokError) {
            console.error('✗ Grok API Error:', grokError.message);
            
            // Check if it's an API key issue
            const isKeyError = grokError.message.includes('Incorrect API key') || 
                              grokError.message.includes('Invalid API key') ||
                              grokError.message.includes('401') ||
                              grokError.message.includes('403');
            
            // FALLBACK: If Grok fails, use extracted text as summary
            console.log('\n⚠️  Fallback: Using extracted text as summary...');
            if (isKeyError) {
                console.log('📝 Note: Grok API key appears to be invalid');
                console.log('📋 Get a valid key from: https://console.x.ai');
            }
            
            // Still try to save to database
            try {
                const ext = path.extname(req.file.originalname).toLowerCase();
                const fileType = ext === '.pdf' ? 'pdf' : 'image';
                
                const { Document } = getModels();
                const document = await Document.create({
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    fileSize: req.file.size,
                    fileType: fileType,
                    filePath: filePath,
                    extractedText: extractedText,
                    summary: extractedText
                });

                global.latestDocumentId = document.id;
                console.log('  ✓ Saved (ID:', document.id, ')');
            } catch (dbErr) {
                console.warn('  ⚠ DB save skipped:', dbErr.message);
            }

            // Return extracted text as summary instead of failing
            console.log('\n✓ FALLBACK COMPLETE - File processed with OCR\n');
            res.json({ 
                summary: extractedText,
                documentId: global.latestDocumentId,
                fallback: true,
                fallbackReason: isKeyError ? 'Invalid Grok API Key' : 'Grok API Error',
                message: isKeyError ? 'Update GROK_API_KEY in backend/.env with a valid key from https://console.x.ai' : 'Summarization failed, showing extracted text instead',
                grokError: grokError.message
            });
        }
    } catch (error) {
        console.error('✗ Upload Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
