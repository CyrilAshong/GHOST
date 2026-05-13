// src/ai/openai.js
//
// We still use the OpenAI SDK package here — and that's intentional.
// DeepSeek's API is fully compatible with OpenAI's format, so the same
// SDK works. We just point it at DeepSeek's base URL instead.
// This is called API compatibility — DeepSeek did this deliberately
// to make migration easy for developers.

import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// We create the client almost identically to before.
// Two differences:
//   1. apiKey now reads DEEPSEEK_API_KEY from .env
//   2. baseURL points to DeepSeek's servers instead of OpenAI's
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

/**
 * Sends the conversation history to DeepSeek and returns Ghost's response.
 *
 * @param {Array} messages - Full conversation history
 * @returns {Promise<string>} - Ghost's response text
 */
export async function chat(messages) {
  try {
    const response = await client.chat.completions.create({
      // deepseek-chat is their general-purpose model — equivalent to gpt-4o-mini
      // deepseek-reasoner is their reasoning model — equivalent to o1
      // We start with deepseek-chat: fast, cheap, capable
      model: "deepseek-chat",
      messages: messages,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("DeepSeek API error:", error.message);
    return "I encountered an error. Please check your API key and connection.";
  }
}