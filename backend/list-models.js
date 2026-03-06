const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY not found in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log("Fetching available models...\n");
    const models = await genAI.listModels();
    
    console.log("Available Models:");
    console.log("=".repeat(50));
    
    models.forEach((model) => {
      console.log(`\n📌 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Input Token Limit: ${model.inputTokenLimit}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(", ")}`);
    });
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ Models fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching models:", error.message);
  }
}

listModels();
