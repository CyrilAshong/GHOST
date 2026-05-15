// electron/main.js
//
// The main process — this is what Electron runs first.
// It creates the desktop window and manages Ghost's core logic.
// It communicates with the UI through IPC messages.

import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { chat } from "../src/ai/openai.js";
import { createConversation } from "../src/chat/conversation.js";
import { speak } from "../src/voice/tts.js";
import { listenAndTranscribe } from "../src/voice/stt.js";
import { detectAndRunTool } from "../src/tools/index.js";
import { startWakeWordListener } from "../src/voice/wakeWord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── GHOST SYSTEM PROMPT ────────────────────────────────────────────

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

// ── GLOBALS ────────────────────────────────────────────────────────

let mainWindow;
const conversation = createConversation(GHOST_SYSTEM_PROMPT);

// ── WINDOW CREATION ────────────────────────────────────────────────

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    x: width - 440,
    y: height - 700,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

// ── APP LIFECYCLE ──────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow();
  startWakeModeInBackground();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ── CORE MESSAGE HANDLER ───────────────────────────────────────────

async function handleMessage(userMessage, shouldSpeak = true) {
  // Tell the UI Ghost is thinking
  mainWindow.webContents.send("ghost-thinking", { thinking: true });

  const toolResult = await detectAndRunTool(userMessage);

  if (toolResult) {
    mainWindow.webContents.send("ghost-response", {
      message: toolResult,
      type: "tool",
    });

    mainWindow.webContents.send("ghost-thinking", { thinking: false });

    if (shouldSpeak) await speak(toolResult);

    conversation.addMessage("user", userMessage);
    conversation.addMessage("assistant", toolResult);

  } else {
    conversation.addMessage("user", userMessage);

    const response = await chat(conversation.getMessages());

    mainWindow.webContents.send("ghost-response", {
      message: response,
      type: "ai",
    });

    mainWindow.webContents.send("ghost-thinking", { thinking: false });

    if (shouldSpeak) await speak(response);

    conversation.addMessage("assistant", response);
  }
}

// ── IPC HANDLERS ───────────────────────────────────────────────────

// User sent a text message or window control command
ipcMain.on("user-message", async (_, message) => {
  if (message === "__minimize__") {
    mainWindow.minimize();
    return;
  }
  if (message === "__close__") {
    app.quit();
    return;
  }
  if (!message.trim()) return;
  await handleMessage(message, false);
});

// User clicked the microphone button
ipcMain.on("start-listening", async () => {
  try {
    mainWindow.webContents.send("status-update", {
      status: "listening",
      message: "Listening...",
    });

    const userMessage = await listenAndTranscribe();

    if (!userMessage) {
      mainWindow.webContents.send("status-update", {
        status: "idle",
        message: "Ready",
      });
      return;
    }

    mainWindow.webContents.send("voice-input", { message: userMessage });
    await handleMessage(userMessage, true);

    mainWindow.webContents.send("status-update", {
      status: "idle",
      message: "Ready",
    });

  } catch (error) {
    console.error("Voice input error:", error.message);
    mainWindow.webContents.send("status-update", {
      status: "idle",
      message: "Ready",
    });
  }
});

// ── WAKE WORD MODE ─────────────────────────────────────────────────

function startWakeModeInBackground() {
  startWakeWordListener(
    async () => {
      mainWindow.webContents.send("ghost-awake", {});
      mainWindow.webContents.send("status-update", {
        status: "awake",
        message: "Ghost is listening...",
      });
      await speak("Yeah, what's up.");
    },

    async (command) => {
      mainWindow.webContents.send("voice-input", { message: command });
      await handleMessage(command, true);
      mainWindow.webContents.send("status-update", {
        status: "awake",
        message: "Ghost is listening...",
      });
    },

    async () => {
      mainWindow.webContents.send("status-update", {
        status: "idle",
        message: "Say Hey Ghost to activate",
      });
      await speak("Alright, catch you later.");
      conversation.clear();
    },

    async () => {}
  );
}