// src/voice/tts.js
//
// Text-to-Speech module.
// Calls speak.py as a child process to speak text out loud.

import { spawn } from "child_process";
import path from "path";

/**
 * Speaks the given text out loud using pyttsx3.
 *
 * @param {string} text - The text Ghost should speak
 * @returns {Promise<void>} - Resolves when Ghost finishes speaking
 */
export function speak(text) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "scripts", "speak.py");

    const pythonProcess = spawn("python", [scriptPath, text]);

    pythonProcess.stderr.on("data", (data) => {
      console.error("TTS error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`TTS process exited with code ${code}`));
      }
    });

    pythonProcess.on("error", (err) => {
      reject(new Error(`Failed to start TTS: ${err.message}`));
    });
  });
}