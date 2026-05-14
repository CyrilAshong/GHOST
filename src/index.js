// src/index.js
//
// Entry point for Ghost.
// npm start       → text mode
// npm run voice   → voice mode

import { startTextMode, startVoiceMode } from "./ghost.js";

const mode = process.argv[2];

if (mode === "--voice") {
  startVoiceMode();
} else {
  startTextMode();
}