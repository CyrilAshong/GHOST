// src/tools/getBattery.js
//
// Returns the current battery level on Windows.
// Uses a PowerShell command to query the battery status.
// PowerShell is built into Windows — no installation needed.

import { execSync } from "child_process";

/**
 * Returns the current battery level and charging status.
 * @returns {string}
 */
export function getBattery() {
  try {
    // Run a PowerShell command to get battery info
    // execSync runs a command and returns the output as a string
    // This queries Windows Management Instrumentation (WMI)
    // which knows everything about your hardware
    const output = execSync(
      `powershell -command "Get-WmiObject Win32_Battery | Select-Object -ExpandProperty EstimatedChargeRemaining"`,
      { encoding: "utf8" }
    ).trim();

    // Get charging status
    const status = execSync(
      `powershell -command "Get-WmiObject Win32_Battery | Select-Object -ExpandProperty BatteryStatus"`,
      { encoding: "utf8" }
    ).trim();

    // BatteryStatus 2 means the battery is charging
    const isCharging = status === "2";
    const level = parseInt(output);

    if (isNaN(level)) {
      return "I could not read the battery level. You may be on a desktop machine.";
    }

    return `Battery is at ${level}% and is ${isCharging ? "currently charging" : "not charging"}.`;

  } catch (error) {
    return "I was unable to retrieve battery information on this machine.";
  }
}