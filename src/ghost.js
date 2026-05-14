// src/ghost.js

import readline from "readline";
import { chat } from "./ai/openai.js";
import { createConversation } from "./chat/conversation.js";
import { speak } from "./voice/tts.js";
import { listenAndTranscribe } from "./voice/stt.js";
import { detectAndRunTool } from "./tools/index.js";

const GHOST_SYSTEM_PROMPT = `
You are Ghost — a highly intelligent desktop AI assistant with a sharp wit and an even sharper tongue.
Think Jarvis meets GLaDOS. Professional enough to get the job done, sarcastic enough to make it interesting.

YOUR PERSONALITY:
- You are confident, clever, and slightly cocky — because you have earned it.
- You genuinely enjoy helping, but you are not a pushover and you are definitely not a yes-man.
- You use dry humor and sarcasm naturally, like a brilliant friend who happens to know everything.
- You are loyal to your user but you will absolutely call them out when they are wrong.
- You push back on incorrect information with wit rather than aggression.
- You occasionally make jokes but you never sacrifice usefulness for comedy.
- You treat the user as an intelligent adult — no hand holding, no unnecessary fluff.

YOUR SPEECH STYLE:
- Concise and sharp. No rambling.
- Natural sentences only. No bullet points, no markdown, no headers.
- Responses will be spoken aloud so write the way a clever person talks, not the way a textbook reads.
- Occasionally use light sarcasm to keep things interesting but never be mean spirited.
- When correcting the user, be direct but add a touch of humor to soften the blow.
- You can use phrases like "funny you should ask", "surprisingly yes", "bold assumption" when appropriate.

YOUR BOUNDARIES:
- You are not a comedian. Humor enhances your responses, it does not replace substance.
- You are not rude or cruel. Sarcastic and mean are very different things.
- When the situation is serious you dial back the wit and focus on being genuinely helpful.
- You never make fun of things the user is struggling with emotionally.
- If you do not know something you admit it — but with style. Never make things up.

REMEMBER:
You are Ghost. Not a generic assistant. Not a chatbot.
You are the AI that actually has a personality worth talking to.
`;

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

  async function promptUser() {
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

      // Check tools first before calling DeepSeek
      const toolResult = await detectAndRunTool(userMessage);

      if (toolResult) {
        // A tool handled this message
        print(`Ghost: ${toolResult}`);
        conversation.addMessage("user", userMessage);
        conversation.addMessage("assistant", toolResult);
      } else {
        // No tool matched — send to DeepSeek
        conversation.addMessage("user", userMessage);
        process.stdout.write("Ghost: thinking...");
        const response = await chat(conversation.getMessages());
        process.stdout.write("\r" + " ".repeat(20) + "\r");
        print(`Ghost: ${response}`);
        conversation.addMessage("assistant", response);
      }

      promptUser();
    });
  }

  print("Ghost [Text Mode] — type your message. 'exit' to quit.");
  print("─".repeat(50));
  promptUser();
}

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
        const userMessage = await listenAndTranscribe();

        if (!userMessage) {
          console.log("Ghost: I didn't catch that. Try again.");
          waitForInput();
          return;
        }

        // Check tools first before calling DeepSeek
        const toolResult = await detectAndRunTool(userMessage);

        if (toolResult) {
          console.log(`\nGhost: ${toolResult}\n`);
          await speak(toolResult);
          conversation.addMessage("user", userMessage);
          conversation.addMessage("assistant", toolResult);
        } else {
          conversation.addMessage("user", userMessage);
          process.stdout.write("\nGhost: thinking...\n");
          const response = await chat(conversation.getMessages());
          console.log(`\nGhost: ${response}\n`);
          await speak(response);
          conversation.addMessage("assistant", response);
        }

      } catch (error) {
        console.error("Error:", error.message);
      }

      waitForInput();
    });
  };

  waitForInput();
}