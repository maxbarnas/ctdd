// src/cli/index.ts
// Phase 1: CLI Main Entry Point - Enhanced Extract+Integrate Integration

import { createProgram } from "./core/program-setup.js";
import { handleGlobalError } from "./core/error-handler.js";
import { setupCoreWorkflowCommands } from "./commands/core-workflow.js";
import { setupPromptCommands } from "./commands/prompts.js";
import { setupResponseCommands } from "./commands/responses.js";
import { setupChangeManagementCommands } from "./commands/change-mgmt.js";
import { setupServerDocsCommands } from "./commands/server-docs.js";
import { setupProjectAnalysisCommands } from "./commands/project-analysis.js";
import { setupFileOperationsCommands } from "./commands/file-operations.js";
import { setupUtilityCommands } from "./commands/utilities.js";
import { setupSessionCommands } from "./commands/session.js";
import { setupTestIntelligenceCommands } from "./commands/test-intelligence.js";

export async function runCLI(): Promise<void> {
  try {
    const program = createProgram();

    // Setup all command modules
    setupCoreWorkflowCommands(program);
    setupPromptCommands(program);
    setupResponseCommands(program);
    setupChangeManagementCommands(program);
    setupServerDocsCommands(program);
    setupProjectAnalysisCommands(program);
    setupFileOperationsCommands(program);
    setupUtilityCommands(program);
    setupSessionCommands(program);
    setupTestIntelligenceCommands(program);

    await program.parseAsync(process.argv);
  } catch (e) {
    await handleGlobalError(e);
  }
}