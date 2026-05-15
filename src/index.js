// src/index.js
//
// Entry point for Ghost.
// npm start        → text mode
// npm run voice    → voice mode
// npm run wake     → wake word mode

import { startTextMode, startVoiceMode, startWakeMode } from "./ghost.js";

const mode = process.argv[2];

if (mode === "--voice") {
  startVoiceMode();
} else if (mode === "--wake") {
  startWakeMode();
} else {
  startTextMode();
}