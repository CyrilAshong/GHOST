// src/voice/stt.js
//
// Speech-to-Text module.
// Calls listen.py as a child process and reads the transcribed text.

import { spawn } from "child_process";
import path from "path";

/**
 * Records audio and transcribes it using Google Speech Recognition.
 *
 * @returns {Promise<string|null>} - Transcribed text or null on failure
 */
export function listenAndTranscribe() {
  return new Promise((resolve, reject) => {
    console.log("\n🎙️  Preparing microphone...");

    const scriptPath = path.join(process.cwd(), "scripts", "listen.py");

    const pythonProcess = spawn("python", [scriptPath]);

    let result = null;

    // Read stdout line by line and react to signals
    pythonProcess.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");

      lines.forEach((line) => {
        line = line.trim();
        if (!line) return;

        if (line === "RECORDING") {
          console.log("🔴 Listening... Speak now!");
        }

        else if (line === "DONE") {
          console.log("✅ Got it.");
        }

        else if (line === "TRANSCRIBING") {
          console.log("🔄 Transcribing...");
        }

        else if (line.startsWith("RESULT:")) {
          result = line.slice("RESULT:".length).trim();
        }
      });
    });

    pythonProcess.stderr.on("data", (data) => {
      const message = data.toString().trim();
      if (message) console.error("STT error:", message);
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        if (result) {
          console.log(`📝 You said: "${result}"`);
          resolve(result);
        } else {
          console.log("⚠️  Nothing detected. Please try again.");
          resolve(null);
        }
      } else {
        reject(new Error(`listen.py exited with code ${code}`));
      }
    });

    pythonProcess.on("error", (err) => {
      reject(new Error(`Failed to start STT: ${err.message}`));
    });
  });
}