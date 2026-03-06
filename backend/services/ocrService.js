const Tesseract = require('tesseract.js');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

/**
 * Extracts text from image/PDF files with comprehensive error handling
 */
async function extractText(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    try {
        // Validate file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const stats = fs.statSync(filePath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`  File size: ${fileSizeMB} MB`);

        if (ext === '.pdf') {
            console.log('  Processing PDF...');
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            const extractedText = data.text || '';
            if (!extractedText.trim()) {
                throw new Error('PDF contains no extractable text');
            }
            console.log(`  ✓ Extracted ${extractedText.length} characters from PDF`);
            return extractedText;
        } else if (['.jpg', '.jpeg', '.png', '.bmp', '.tiff'].includes(ext)) {
            console.log(`  Processing image (${ext})...`);
            const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
                logger: m => {
                    const pct = Math.round(m.progress * 100);
                    if (pct % 20 === 0 || pct === 100) {
                        console.log(`    OCR: ${pct}%`);
                    }
                }
            });
            if (!text || !text.trim()) {
                throw new Error('No text detected in image');
            }
            console.log(`  ✓ Extracted ${text.length} characters from image`);
            return text;
        } else {
            throw new Error(`Unsupported format: ${ext}. Use: PDF, JPG, PNG, BMP, TIFF`);
        }
    } catch (error) {
        console.error(`  ✗ OCR Error: ${error.message}`);
        throw new Error(`Text extraction: ${error.message}`);
    }
}

module.exports = {
    extractText
};
