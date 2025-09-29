// src/cli/commands/prompts.ts
// Phase 1: Prompt Commands - pre, post

import { Command } from "commander";
import {
  loadSpec,
  computeCommitId,
  renderPrePrompt,
  renderPostPrompt,
  logError
} from "../../core.js";
import { writeFile as fsWriteFile, readFile as fsReadFile } from "fs/promises";
import { CTDDError, ErrorCodes } from "../../errors.js";

export function setupPromptCommands(program: Command) {
  program
    .command("pre")
    .description("Emit Pre Self-Test prompt\n" +
      "Generates prompt for agent to self-check before starting work.\n" +
      "Examples:\n" +
      "  ctdd pre              # Print to stdout\n" +
      "  ctdd pre --out pre.md # Save to file")
    .option("--out <file>", "Output file path")
    .action(async (opts) => {
      try {
        const spec = await loadSpec(process.cwd());
        const commitId = computeCommitId(spec);
        const prompt = renderPrePrompt(spec, commitId);

        if (opts.out) {
          await fsWriteFile(opts.out, prompt, "utf-8");
        } else {
          console.log(prompt);
        }
      } catch (e) {
        await logError(
          process.cwd(),
          new CTDDError(
            `Pre-prompt generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'pre', opts }
          ),
          'pre'
        );
        console.error(`[E004] Pre-prompt generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  program
    .command("post")
    .description("Emit Post-Test prompt")
    .option("--artifact <file>", "Include artifact file in prompt")
    .option("--out <file>", "Output file path")
    .action(async (opts) => {
      try {
        const spec = await loadSpec(process.cwd());
        const commitId = computeCommitId(spec);

        // Read artifact file content if provided
        let artifactContent: string | undefined;
        if (opts.artifact) {
          try {
            artifactContent = await fsReadFile(opts.artifact, "utf-8");
          } catch (e) {
            throw new Error(`Failed to read artifact file: ${opts.artifact}`);
          }
        }

        const prompt = renderPostPrompt(spec, commitId, artifactContent);

        if (opts.out) {
          await fsWriteFile(opts.out, prompt, "utf-8");
        } else {
          console.log(prompt);
        }
      } catch (e) {
        await logError(
          process.cwd(),
          new CTDDError(
            `Post-prompt generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'post', opts }
          ),
          'post'
        );
        console.error(`[E005] Post-prompt generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });
}