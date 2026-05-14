// src/tools/runCommand.js
//
// Runs a terminal command and returns the output.
// This is powerful — Ghost can execute anything on your system.

import { exec } from "child_process";

// Commands that are too dangerous to allow
// We block these to prevent accidental damage
const BLOCKED_COMMANDS = [
  "rm -rf",
  "format",
  "del /f",
  "rd /s",
  "shutdown",
  "taskkill",
  "reg delete",
];

/**
 * Runs a terminal command and returns its output.
 * @param {string} command - The command to run
 * @returns {Promise<string>} - The command output
 */
export function runCommand(command) {
  return new Promise((resolve) => {
    // Safety check — block dangerous commands
    const isDangerous = BLOCKED_COMMANDS.some((blocked) =>
      command.toLowerCase().includes(blocked)
    );

    if (isDangerous) {
      resolve(
        "I am not running that command. It is potentially destructive and I actually like your files."
      );
      return;
    }

    // Run the command
    exec(command, { encoding: "utf8" }, (error, stdout, stderr) => {
      if (error) {
        resolve(`Command failed: ${error.message}`);
        return;
      }

      const output = stdout.trim() || stderr.trim();
      resolve(output || "Command ran successfully with no output.");
    });
  });
}