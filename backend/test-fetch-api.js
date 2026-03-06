require("dotenv").config();
const fetch = require("node-fetch");

const apiKey = process.env.GEMINI_API_KEY;
const testText = "Say 'API working' in one sentence.";

async function testGeminiAPI() {
  console.log("Testing Gemini API with different endpoints...\n");

  // Test 1: Using v1 endpoint instead of v1beta
  try {
    console.log("🔍 Testing v1 endpoint...");
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: testText }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ v1 endpoint works!");
      console.log("Response:", data);
    } else {
      console.log(
        `❌ v1 endpoint failed (${response.status}): ${data.error?.message}`
      );
    }
  } catch (error) {
    console.log(`❌ v1 endpoint error: ${error.message}`);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 2: Check if gemini-2.0-flash is available
  try {
    console.log("🔍 Testing gemini-2.0-flash...");
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: testText }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ gemini-2.0-flash works!");
      console.log("Response:", data);
    } else {
      console.log(
        `❌ gemini-2.0-flash failed (${response.status}): ${data.error?.message}`
      );
    }
  } catch (error) {
    console.log(`❌ gemini-2.0-flash error: ${error.message}`);
  }
}

testGeminiAPI();
