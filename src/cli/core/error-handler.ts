// src/cli/core/error-handler.ts
// Phase 1: Global Error Handling

import { logError } from "../../core.js";
import { CTDDError } from "../../errors.js";

export async function handleGlobalError(e: unknown): Promise<void> {
  // Try to log the error to the structured log
  try {
    const error = e instanceof Error ? e : new Error(String(e));
    await logError(process.cwd(), error, 'main');
  } catch (logErr) {
    // If logging fails, just continue to console output
    console.error('Failed to log error:', logErr);
  }

  // Display user-friendly error message
  if (e instanceof CTDDError) {
    console.error(e.toString());
  } else {
    console.error('Unexpected error:', e);
  }

  process.exit(1);
}