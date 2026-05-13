// src/index.js

// readline is built into Node.js — no install needed.
// It lets us read input from the terminal, one line at a time.
import readline from "readline";

// We import our own modules using relative paths.
import { chat } from "./ai/openai.js";
import { createConversation } from "./chat/conversation.js";

// This is Ghost's personality and behavioral instructions.
// The system prompt is one of the most powerful tools in AI engineering —
// it defines WHO the AI is before any user message is sent.
const GHOST_SYSTEM_PROMPT = `
You are Ghost, a smart and efficient desktop AI assistant.
You are helpful, direct, and slightly witty — like a brilliant friend who happens to know everything.
You keep responses concise unless the user asks for detail.
You remember the context of this conversation and refer back to earlier points when relevant.
When you don't know something, you say so clearly instead of making things up.
`;

// Initialize the conversation manager with Ghost's system prompt.
// This creates our message history and gives Ghost its personality.
const conversation = createConversation(GHOST_SYSTEM_PROMPT);

// Set up the readline interface.
// process.stdin = keyboard input (what you type)
// process.stdout = terminal output (what gets printed)
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// A small utility to print text with a blank line after it.
// Clean output matters — even in a terminal app.
function print(text) {
  console.log(text);
  console.log();
}

/**
 * The main conversation loop.
 * This function runs recursively — after each response, it calls itself
 * to wait for the next user input.
 */
function promptUser() {
  // rl.question() prints a prompt and waits for the user to type something
  // and press Enter. The callback receives whatever they typed.
  rl.question("You: ", async (input) => {
    // .trim() removes whitespace from both ends of the string.
    const userMessage = input.trim();

    // If the user types nothing and just hits Enter, ask again.
    if (!userMessage) {
      promptUser();
      return;
    }

    // Special commands — these let the user control Ghost
    // without those commands being sent to the AI.
    if (userMessage.toLowerCase() === "exit" || userMessage.toLowerCase() === "quit") {
      print("Ghost: Goodbye. Shutting down.");
      rl.close();
      process.exit(0);
    }

    if (userMessage.toLowerCase() === "clear") {
      conversation.clear();
      promptUser();
      return;
    }

    // Add the user's message to the conversation history.
    conversation.addMessage("user", userMessage);

    // Show a thinking indicator — AI calls take a moment.
    process.stdout.write("Ghost: thinking...");

    // Call OpenAI with the full conversation history.
    // We await this because it's asynchronous — it takes time.
    const response = await chat(conversation.getMessages());

    // Clear the "thinking..." text and print Ghost's response.
    // \r moves the cursor to the start of the line.
    // The spaces overwrite the "thinking..." text.
    process.stdout.write("\r" + " ".repeat(20) + "\r");
    print(`Ghost: ${response}`);

    // Add Ghost's response to the conversation history
    // so future messages have full context.
    conversation.addMessage("assistant", response);

    // Loop — wait for the next message.
    promptUser();
  });
}

// --- STARTUP ---

print(""); // blank line for clean output
print("Ghost is online. Type your message below.");
print('Type "exit" to quit. Type "clear" to start a new conversation.');
print("─".repeat(50));

// Begin the conversation loop.
promptUser();