// src/chat/conversation.js

/**
 * Creates and manages a conversation session.
 *
 * This is a factory function — it returns an object with methods
 * rather than using a class. Both approaches are valid; this one
 * is simpler to reason about for now.
 *
 * @param {string} systemPrompt - Instructions that define Ghost's personality
 *   and behavior. This is sent as the first "system" message to OpenAI.
 */
export function createConversation(systemPrompt) {
  // This array holds the entire conversation history.
  // It starts with the system prompt, which sets Ghost's personality.
  // The system role is special — it's instructions for the AI, not part
  // of the human conversation.
  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  return {
    /**
     * Adds a message to the conversation history.
     *
     * @param {string} role - "user" or "assistant"
     * @param {string} content - The message text
     */
    addMessage(role, content) {
      messages.push({ role, content });
    },

    /**
     * Returns the full conversation history.
     * We pass this to OpenAI with every API call.
     *
     * @returns {Array} - The messages array
     */
    getMessages() {
      // We return a copy with [...messages] so nothing outside
      // this module can accidentally mutate the conversation history.
      return [...messages];
    },

    /**
     * Clears the conversation history, keeping only the system prompt.
     * Useful if the user wants to start a fresh conversation.
     */
    clear() {
      // Keep only the first element (the system prompt) and remove the rest.
      messages.splice(1);
      console.log("Conversation cleared.");
    },
  };
}