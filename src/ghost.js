// src/ghost.js
//
// Ghost's core engine.
// Manages both text mode and voice mode.

import readline from "readline";
import { chat } from "./ai/openai.js";
import { createConversation } from "./chat/conversation.js";
import { speak } from "./voice/tts.js";
import { listenAndTranscribe } from "./voice/stt.js";

const GHOST_SYSTEM_PROMPT = `
You are Ghost, a smart and efficient desktop AI assistant.
You are helpful, direct, and slightly witty.
Keep responses concise — they will be spoken aloud.
Speak in natural sentences only. No bullet points or markdown.
When you don't know something, say so clearly.
`;

/**
 * Text mode — original Phase 1 terminal interface
 */
export async function startTextMode() {
  const conversation = createConversation(GHOST_SYSTEM_PROMPT);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function print(text) {
    console.log(text);
    console.log();
  }

  function promptUser() {
    rl.question("You: ", async (input) => {
      const userMessage = input.trim();
      if (!userMessage) { promptUser(); return; }

      if (["exit", "quit"].includes(userMessage.toLowerCase())) {
        print("Ghost: Goodbye.");
        rl.close();
        process.exit(0);
      }

      if (userMessage.toLowerCase() === "clear") {
        conversation.clear();
        promptUser();
        return;
      }

      conversation.addMessage("user", userMessage);
      process.stdout.write("Ghost: thinking...");
      const response = await chat(conversation.getMessages());
      process.stdout.write("\r" + " ".repeat(20) + "\r");
      print(`Ghost: ${response}`);
      conversation.addMessage("assistant", response);
      promptUser();
    });
  }

  print("Ghost [Text Mode] — type your message. 'exit' to quit.");
  print("─".repeat(50));
  promptUser();
}

/**
 * Voice mode — speak to Ghost and hear it respond
 */
export async function startVoiceMode() {
  const conversation = createConversation(GHOST_SYSTEM_PROMPT);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\nGhost [Voice Mode] — Press Enter to speak. Type 'exit' to quit.");
  console.log("─".repeat(50));

  const waitForInput = () => {
    rl.question("\nPress Enter to speak (or type 'exit'): ", async (input) => {

      if (input.trim().toLowerCase() === "exit") {
        await speak("Goodbye.");
        rl.close();
        process.exit(0);
      }

      try {
        // Step 1: Listen and transcribe
        const userMessage = await listenAndTranscribe();

        if (!userMessage) {
          console.log("Ghost: I didn't catch that. Try again.");
          waitForInput();
          return;
        }

        // Step 2: Get AI response
        conversation.addMessage("user", userMessage);
        process.stdout.write("\nGhost: thinking...\n");
        const response = await chat(conversation.getMessages());

        // Step 3: Print and speak the response
        console.log(`\nGhost: ${response}\n`);
        await speak(response);

        // Step 4: Save to conversation history
        conversation.addMessage("assistant", response);

      } catch (error) {
        console.error("Error:", error.message);
      }

      waitForInput();
    });
  };

  waitForInput();
}