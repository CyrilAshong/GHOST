// src/tools/index.js
//
// Tool registry and intent classifier.
// Every message Ghost receives passes through here first.
// We check if the message is a command before sending it to the AI.

import { getTime } from "./getTime.js";
import { getBattery } from "./getBattery.js";
import { openApp } from "./openApp.js";
import { runCommand } from "./runCommand.js";
import { searchFiles } from "./searchFiles.js";

/**
 * Detects if a message is a tool command and runs the right tool.
 *
 * @param {string} message - The user's message
 * @returns {Promise<string|null>} - Tool result or null if no tool matched
 */
export async function detectAndRunTool(message) {
  // Normalize message for easier matching
  const msg = message.toLowerCase().trim();

  // ── TIME ──────────────────────────────────────────────
 if (
    msg.includes("what time") ||
    msg.includes("what's the time") ||
    msg.includes("current time") ||
    msg.includes("what date") ||
    msg.includes("what day") ||
    msg.includes("what is today") ||
    msg.includes("today's date") ||
    msg.includes("todays date") ||
    msg.includes("what is the date") ||
    msg.includes("current date") ||
    msg.includes("what year") ||
    msg.includes("what month")
  ) {
    return getTime();
  }

  // ── BATTERY ───────────────────────────────────────────
  if (
    msg.includes("battery") ||
    msg.includes("how much charge") ||
    msg.includes("charging")
  ) {
    return getBattery();
  }

  // ── OPEN APPS ─────────────────────────────────────────
  if (msg.startsWith("open ")) {
    const appName = message.slice(5).trim();
    return await openApp(appName);
  }

  if (msg.startsWith("launch ")) {
    const appName = message.slice(7).trim();
    return await openApp(appName);
  }

  if (msg.startsWith("start ")) {
    const appName = message.slice(6).trim();
    return await openApp(appName);
  }

  // ── RUN COMMAND ───────────────────────────────────────
  if (
    msg.startsWith("run ") ||
    msg.startsWith("execute ") ||
    msg.startsWith("terminal ")
  ) {
    const command = message.split(" ").slice(1).join(" ").trim();
    return await runCommand(command);
  }

  // ── SEARCH FILES ──────────────────────────────────────
  if (
    msg.startsWith("find file") ||
    msg.startsWith("search for") ||
    msg.startsWith("find ") ||
    msg.includes("where is the file")
  ) {
    // Extract the filename from the message
    const parts = message.split(" ");
    const keyword = parts[parts.length - 1];
    return await searchFiles(keyword);
  }

  // No tool matched — return null so Ghost sends it to DeepSeek instead
  return null;
}