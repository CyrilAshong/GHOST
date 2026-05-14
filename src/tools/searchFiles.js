// src/tools/searchFiles.js
//
// Searches for files on your Windows computer by name.
// Uses the built-in Windows 'where' and 'dir' commands.

import { exec } from "child_process";

/**
 * Searches for files matching a name pattern.
 * @param {string} filename - The filename or pattern to search for
 * @param {string} location - Where to search (defaults to C:\Users\ashon)
 * @returns {Promise<string>} - Search results
 */
export function searchFiles(filename, location = "C:\\Users\\ashon") {
  return new Promise((resolve) => {
    // Use Windows dir command to search recursively
    // /s means search subdirectories
    // /b means bare format — just filenames, no extra info
    const command = `dir "${location}\\*${filename}*" /s /b 2>nul`;

    exec(command, { encoding: "utf8" }, (error, stdout) => {
      const results = stdout.trim();

      if (!results) {
        resolve(`I could not find any files matching "${filename}" in ${location}.`);
        return;
      }

      // Split results into lines and take the first 5
      const files = results.split("\n").slice(0, 5);
      const count = results.split("\n").length;

      let response = `I found ${count} file${count !== 1 ? "s" : ""} matching "${filename}". Here are the first results: `;
      response += files.join(", ");

      resolve(response);
    });
  });
}