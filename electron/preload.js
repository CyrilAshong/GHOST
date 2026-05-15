// electron/preload.js
//
// The preload script runs in a special context that has access
// to both the browser environment and Node.js.
// It creates a safe bridge called "ghostBridge" that the UI
// can use to communicate with the main process.
//
// Think of it as a security guard — the UI cannot access
// Node.js directly, it must go through this bridge.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ghostBridge", {
  // ── SENDING MESSAGES ───────────────────────────────────────────
  // UI calls this to send a text message to Ghost
  sendMessage: (message) => ipcRenderer.send("user-message", message),

  // UI calls this to trigger voice input
  startListening: () => ipcRenderer.send("start-listening"),

  // UI calls this to start wake word mode
  startWakeMode: () => ipcRenderer.send("start-wake-mode"),

  // ── RECEIVING MESSAGES ─────────────────────────────────────────
  // UI calls this to listen for Ghost's responses
  onGhostResponse: (callback) =>
    ipcRenderer.on("ghost-response", (_, data) => callback(data)),

  // UI calls this to know when Ghost is thinking
  onGhostThinking: (callback) =>
    ipcRenderer.on("ghost-thinking", (_, data) => callback(data)),

  // UI calls this to receive status updates
  onStatusUpdate: (callback) =>
    ipcRenderer.on("status-update", (_, data) => callback(data)),

  // UI calls this to receive transcribed voice input
  onVoiceInput: (callback) =>
    ipcRenderer.on("voice-input", (_, data) => callback(data)),

  // UI calls this to know when Ghost wakes up
  onGhostAwake: (callback) =>
    ipcRenderer.on("ghost-awake", (_, data) => callback(data)),
});