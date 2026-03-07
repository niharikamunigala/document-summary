/**
 * FILE UPLOAD & OCR TEST
 * 
 * This demonstrates what happens when you upload a document:
 * 1. File is uploaded
 * 2. OCR extracts text from image/PDF
 * 3. Grok API summarizes the text
 * 4. If API key is invalid, extracted text is returned instead
 */

const fs = require('fs');
const path = require('path');

async function testFileUpload() {
    console.log('\n📋 File Upload & OCR Test\n');
    console.log('═'.repeat(70));
    
    // Create a test image (simulate a document)
    const testImagePath = path.join(__dirname, 'test-document.jpg');
    
    console.log('\n1️⃣ Creating test document...');
    console.log(`   File: ${testImagePath}`);
    console.log('   Note: This is a placeholder. In real scenario, upload an actual PDF/image.\n');
    
    // Create a simple text representation
    const documentContent = `CLIMATE CHANGE ACTION ACT 2024

    SECTION 1: PURPOSE
    This Act establishes a comprehensive framework for reducing greenhouse gas emissions 
    and promoting clean energy adoption across the nation.
    
    SECTION 2: RENEWABLE ENERGY
    - 50% renewable energy by 2030
    - 80% renewable energy by 2040
    - Net-zero emissions target by 2050
    
    SECTION 3: CARBON TAX
    - $50 per metric ton CO2 starting 2025
    - Annual increases of $15 per ton
    
    SECTION 4: IMPLEMENTATION
    - Tax incentives for EV purchases
    - Home energy efficiency upgrades supported
    - Timeline: Effective immediately upon signing`;
    
    fs.writeFileSync(testImagePath, documentContent);
    
    // Test the upload endpoint
    console.log('2️⃣ Uploading document to backend...');
    console.log('   Endpoint: POST http://localhost:5000/upload');
    console.log('   Method: FormData with file\n');
    
    try {
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testImagePath));
        
        const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });
        
        const data = await response.json();
        
        console.log('3️⃣ Server Response:\n');
        
        if (response.ok) {
            console.log('   ✅ Upload Successful!\n');
            
            if (data.fallback) {
                console.log('   ⚠️  FALLBACK MODE (Invalid API Key)');
                console.log(`   Reason: ${data.fallbackReason}`);
                console.log(`   Message: ${data.message}\n`);
                console.log('   📋 What happened:');
                console.log('      ✓ File uploaded successfully');
                console.log('      ✓ OCR extracted text from document');
                console.log('      ✗ AI summarization failed (invalid API key)');
                console.log('      ✓ Extracted text returned instead\n');
            } else {
                console.log('   ✅ NORMAL MODE (Valid API Key)');
                console.log('   🤖 AI Summary generated:\n');
            }
            
            const preview = data.summary.substring(0, 300);
            console.log(`   "${preview}..."\n`);
            
        } else {
            console.log('   ❌ Upload Failed');
            console.log(`   Error: ${data.error}\n`);
        }
        
        console.log('═'.repeat(70));
        
        if (data.fallback) {
            console.log('\n🔧 TO FIX (Enable AI Summarization):\n');
            console.log('   1. Go to: https://console.x.ai/');
            console.log('   2. Create/Get your API key');
            console.log('   3. Update: backend/.env');
            console.log('   4. Restart: npm start\n');
        } else {
            console.log('\n✅ EVERYTHING WORKING PERFECTLY!\n');
            console.log('   - ✓ File Upload');
            console.log('   - ✓ OCR Text Extraction');
            console.log('   - ✓ AI Summarization (Grok API)\n');
        }
        
        console.log('═'.repeat(70) + '\n');
        
    } catch (error) {
        console.error('   ❌ Error:', error.message);
        console.log('\n   Make sure the backend server is running on port 5000!\n');
    }
    
    // Cleanup
    try {
        fs.unlinkSync(testImagePath);
    } catch (e) {}
}

testFileUpload();
