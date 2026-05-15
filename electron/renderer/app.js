// electron/renderer/app.js
//
// The UI logic — handles user interactions and displays
// messages sent from the main process through the bridge.

// ── ELEMENT REFERENCES ─────────────────────────────────────────────
const chatWindow      = document.getElementById("chatWindow");
const messageInput    = document.getElementById("messageInput");
const sendBtn         = document.getElementById("sendBtn");
const micBtn          = document.getElementById("micBtn");
const statusDot       = document.getElementById("statusDot");
const statusText      = document.getElementById("statusText");
const thinkingIndicator = document.getElementById("thinkingIndicator");
const minimizeBtn     = document.getElementById("minimizeBtn");
const closeBtn        = document.getElementById("closeBtn");

// ── WINDOW CONTROLS ────────────────────────────────────────────────
// These use Electron's ipcRenderer through the bridge
// to control the window from the UI

minimizeBtn.addEventListener("click", () => {
  window.ghostBridge.sendMessage("__minimize__");
});

closeBtn.addEventListener("click", () => {
  window.ghostBridge.sendMessage("__close__");
});

// ── MESSAGE DISPLAY ────────────────────────────────────────────────

/**
 * Adds a message bubble to the chat window.
 *
 * @param {string} text   - The message text
 * @param {string} sender - "ghost" or "user"
 */
function addMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", `${sender}-message`);

  const label = document.createElement("div");
  label.classList.add("message-label");
  label.textContent = sender === "ghost" ? "Ghost" : "You";

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");
  bubble.textContent = text;

  messageDiv.appendChild(label);
  messageDiv.appendChild(bubble);
  chatWindow.appendChild(messageDiv);

  // Scroll to the bottom so latest message is always visible
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ── STATUS UPDATES ─────────────────────────────────────────────────

/**
 * Updates the status bar at the top of the window.
 *
 * @param {string} status  - "idle" | "listening" | "thinking" | "awake"
 * @param {string} message - The status text to display
 */
function setStatus(status, message) {
  statusDot.className = `status-dot ${status}`;
  statusText.textContent = message;
}

// ── THINKING INDICATOR ─────────────────────────────────────────────

function showThinking(visible) {
  if (visible) {
    thinkingIndicator.classList.add("visible");
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } else {
    thinkingIndicator.classList.remove("visible");
  }
}

// ── SEND MESSAGE ───────────────────────────────────────────────────

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  // Show user message in chat
  addMessage(text, "user");

  // Clear input
  messageInput.value = "";

  // Send to main process through the bridge
  window.ghostBridge.sendMessage(text);

  // Update status
  setStatus("thinking", "Ghost is thinking...");
}

// ── EVENT LISTENERS ────────────────────────────────────────────────

// Send on button click
sendBtn.addEventListener("click", sendMessage);

// Send on Enter key
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Microphone button
micBtn.addEventListener("click", () => {
  micBtn.classList.add("active");
  setStatus("listening", "Listening...");
  window.ghostBridge.startListening();
});

// ── BRIDGE EVENT LISTENERS ─────────────────────────────────────────
// These listen for messages sent from the main process

// Ghost responded
window.ghostBridge.onGhostResponse((data) => {
  addMessage(data.message, "ghost");
  setStatus("idle", "Say Hey Ghost to activate");
});

// Ghost is thinking or done thinking
window.ghostBridge.onGhostThinking((data) => {
  showThinking(data.thinking);
  if (data.thinking) {
    setStatus("thinking", "Ghost is thinking...");
  }
});

// Status update from main process
window.ghostBridge.onStatusUpdate((data) => {
  setStatus(data.status, data.message);

  // If Ghost finished listening, reset mic button
  if (data.status === "idle" || data.status === "awake") {
    micBtn.classList.remove("active");
  }
});

// Voice input transcribed — show it as a user message
window.ghostBridge.onVoiceInput((data) => {
  addMessage(data.message, "user");
});

// Ghost woke up via wake word
window.ghostBridge.onGhostAwake(() => {
  setStatus("awake", "Ghost is listening...");
});