// src/voice/wakeWord.js
//
// Manages the wake word detection process.
// Ghost stays awake after activation and listens naturally.

import { spawn } from "child_process";
import path from "path";

/**
 * Starts the wake word listener.
 *
 * @param {function} onDetected  - Called when wake word is heard
 * @param {function} onCommand   - Called with each spoken command
 * @param {function} onSleeping  - Called when Ghost goes back to sleep
 * @param {function} onPrompt    - Not used — kept for compatibility
 */
export function startWakeWordListener(onDetected, onCommand, onSleeping, onPrompt) {
  const scriptPath = path.join(process.cwd(), "scripts", "wake.py");

  console.log("👻 Ghost is listening for wake word...\n");

  const pythonProcess = spawn("python", [scriptPath]);

  // Sends READY signal to Python so it knows Ghost finished speaking
  // and is ready to listen for the next command
  const sendReady = () => {
    pythonProcess.stdin.write("READY\n");
  };

  pythonProcess.stdout.on("data", async (data) => {
    const lines = data.toString().split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed === "LISTENING") {
        // Silently waiting for wake word
      }

      else if (trimmed === "DETECTED") {
        // Wake word detected — chime is playing
        console.log("\n✅ Wake word detected!");
      }

      else if (trimmed === "AWAKE") {
        // Ghost is now awake — speak the greeting
        await onDetected();
        // Signal Python we are done speaking
        sendReady();
      }

      else if (trimmed === "WAITING") {
        // Ghost is waiting for next command — silent
      }

      else if (trimmed.startsWith("COMMAND:")) {
        const command = trimmed.slice("COMMAND:".length).trim();
        if (command) {
          await onCommand(command);
          // Signal Python we finished responding
          sendReady();
        }
      }

      else if (trimmed === "SLEEPING") {
        await onSleeping();
        console.log("\n👻 Ghost is listening for wake word...\n");
      }
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    const message = data.toString().trim();
    if (message.includes("ERROR")) {
      console.error("Wake word error:", message);
    }
  });

  pythonProcess.on("error", (err) => {
    console.error("Failed to start wake word listener:", err.message);
  });

  return pythonProcess;
}