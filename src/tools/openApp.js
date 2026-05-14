// src/tools/openApp.js
//
// Opens applications on Windows.
// Maps friendly names to their executable commands.

import { exec } from "child_process";

// Map of friendly app names to their Windows commands.
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
 * @param {string} appName - The name of the app to open
 * @returns {Promise<string>} - Result message
 */
export function openApp(appName) {
  return new Promise((resolve) => {
    // Normalize the app name to lowercase for matching
    const normalized = appName.toLowerCase().trim();

    // Find the command for this app
    const command = APP_MAP[normalized];

    if (!command) {
      resolve(
        `I do not have ${appName} in my app list. You can add it to openApp.js.`
      );
      return;
    }

    // Execute the command to open the app
    exec(command, (error) => {
      if (error) {
        resolve(`I tried to open ${appName} but something went wrong. Make sure it is installed.`);
      } else {
        resolve(`Opening ${appName} now.`);
      }
    });
  });
}