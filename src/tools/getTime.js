// src/tools/getTime.js
//
// Returns the current time and date.
// No external dependencies needed — JavaScript handles this natively.

/**
 * Returns the current time and date as a readable string.
 * @returns {string}
 */
export function getTime() {
  const now = new Date();

  // Format the date nicely
  const date = now.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format the time nicely
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return `It is ${time} on ${date}.`;
}