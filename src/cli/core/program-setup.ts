// src/cli/core/program-setup.ts
// Phase 1: Commander Program Setup and Description

import { Command } from "commander";

export function createProgram(): Command {
  const program = new Command();

  program.name("ctdd")
    .description(`Context Test-Driven Development (CTDD) CLI

A lightweight framework for guiding LLM agents through iterative development
using compact, ID-referenced specifications and validation checks.

Common workflows:
  1. Initialize: ctdd init
  2. Validate setup: ctdd validate
  3. Check status: ctdd status --verbose
  4. Start iteration: ctdd pre
  5. Complete work, then: ctdd post
  6. Apply changes: ctdd delta changes.json
  7. Run validation: ctdd checks

For more help: ctdd help <command>`)
    .version("0.2.0");

  return program;
}