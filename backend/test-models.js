const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

const models = [
  "gemini-pro",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-pro-vision",
  "gemini-1.5-pro-vision-0409",
];

async function testModel(modelName) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const response = await model.generateContent(
      "Say 'API is working' in one sentence."
    );

    console.log(`✅ ${modelName} - WORKING`);
    return true;
  } catch (error) {
    console.log(
      `❌ ${modelName} - FAILED: ${error.message.split("\n")[0]}`
    );
    return false;
  }
}

async function testAllModels() {
  console.log("Testing available models...\n");

  for (const model of models) {
    await testModel(model);
  }
}

testAllModels();
