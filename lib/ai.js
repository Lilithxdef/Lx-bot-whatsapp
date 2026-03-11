// lib/ai.js
const gpt4free = require("gpt4free");

async function chatAI(prompt, context = []) {
  try {
    const fullPrompt = context.map(c => c.content).join("\n") + "\n" + prompt;

    // jangan pakai 'new', langsung panggil fungsi
    const client = gpt4free.ChatGPT(); // versi terbaru

    const response = await client.sendMessage(fullPrompt);
    return response.text || "🤖 LX-AI Error!";
  } catch (err) {
    console.error("AI Error:", err);
    return "🤖 LX-AI Error!";
  }
}

module.exports = { chatAI };
