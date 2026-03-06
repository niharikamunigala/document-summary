const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

console.log('\n=== TESTING GEMINI API QUOTA STATUS ===\n');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function checkQuota() {
  try {
    console.log('Attempting to call Gemini API with gemini-2.0-flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const response = await model.generateContent('Say "OK" in one word.');
    console.log('✅ API working - Quota available');
    console.log('Response:', response.response.text());
    return true;
  } catch (error) {
    console.log('\n❌ Error encountered:\n');
    console.log('Status Code:', error.message.includes('429') ? '429 (Rate Limited)' : 'Other');
    console.log('Error Message:', error.message.substring(0, 300));
    
    if (error.message.includes('429') || error.message.includes('quota')) {
      console.log('\n⚠️  FREE TIER QUOTA EXCEEDED\n');
      console.log('Your Google Gemini API free tier quota has been used up.');
      console.log('\nTo continue using the service, you have two options:');
      console.log('1. ✅ UPGRADE TO PAID PLAN:');
      console.log('   - Go to: https://console.cloud.google.com/billing');
      console.log('   - Enable billing for your project');
      console.log('   - You will get $300 free credit for 3 months');
      console.log('   - After that: ~$0.075 per 1M input tokens\n');
      console.log('2. ⏳ WAIT FOR RESET:');
      console.log('   - Free tier quota resets every ~48 hours');
      console.log('   - Check back tomorrow\n');
      
      return false;
    }
    
    throw error;
  }
}

checkQuota();
