// src/tools/openApp.js
//
// Opens applications on Windows.
// Maps friendly names to their executable commands.
// Execution is delayed slightly so Ghost can speak first.

import { exec } from "child_process";

const APP_MAP = {
  // Browsers
  chrome: "start chrome",
  browser: "start chrome",

  // Development
  vscode: "code",
  "vs code": "code",
  "visual studio code": "code",

  // Communication
  telegram: `start "" "C:\\Users\\ashon\\AppData\\Roaming\\Telegram Desktop\\Telegram.exe"`,

  // Media
  spotify: `start "" "C:\\Users\\ashon\\AppData\\Roaming\\Spotify\\Spotify.exe"`,
  music: `start "" "C:\\Users\\ashon\\AppData\\Roaming\\Spotify\\Spotify.exe"`,

  // Microsoft Office
  word: "start winword",
  "ms word": "start winword",
  "microsoft word": "start winword",
  excel: "start excel",
  powerpoint: "start powerpnt",

  // Windows built-ins
  notepad: "start notepad",
  calculator: "start calc",
  explorer: "start explorer",
  "file explorer": "start explorer",
  terminal: "start cmd",
  cmd: "start cmd",
  paint: "start mspaint",
  settings: "start ms-settings:",
};

/**
 * Opens an application by name.
 * The app opens after a short delay so Ghost can speak first.
 *
 * @param {string} appName - The name of the app to open
 * @returns {Promise<string>} - Result message
 */
export function openApp(appName) {
  return new Promise((resolve) => {
    const normalized = appName.toLowerCase().trim();
    const command = APP_MAP[normalized];

    if (!command) {
      resolve(
        `I do not have ${appName} in my app list. You can add it to openApp.js.`
      );
      return;
    }

    // Resolve immediately with the message so Ghost can speak first
    // Then open the app after a short delay
    // 2000ms gives Ghost enough time to finish speaking before the app opens
    resolve(`Opening ${appName} now.`);

    setTimeout(() => {
      exec(command, (error) => {
        if (error) {
          console.error(`Failed to open ${appName}:`, error.message);
        }
      });
    }, 2000);
  });
}