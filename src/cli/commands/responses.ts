// src/cli/commands/responses.ts
// Phase 1: Response Processing Commands - validate-pre, validate-post, record-pre, record-post

import { Command } from "commander";
import {
  loadSpec,
  computeCommitId,
  recordEvent,
  PreResponseSchema,
  PostResponseSchema,
  logError
} from "../../core.js";
import { readFile as fsReadFile } from "fs/promises";
import {
  runPlugins,
  checksToPostChecks
} from "../../plugin.js";
import { CTDDError, ErrorCodes } from "../../errors.js";

export function setupResponseCommands(program: Command) {
  program
    .command("validate-pre")
    .description("Validate a Pre Self-Test JSON response")
    .argument("<file>", "JSON file containing pre-response")
    .action(async (file) => {
      try {
        const content = await fsReadFile(file, "utf-8");
        const data = JSON.parse(content);
        const result = PreResponseSchema.safeParse(data);

        if (result.success) {
          console.log("✅ Pre-response validation passed");
        } else {
          console.log("❌ Pre-response schema validation failed:");
          result.error.issues.forEach((issue, i) => {
            console.log(`  ${i + 1}. ${issue.path.join('.')}: ${issue.message}`);
          });
          process.exit(1);
        }
      } catch (e) {
        await logError(
          process.cwd(),
          new CTDDError(
            `Pre-response validation failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'validate-pre', file }
          ),
          'validate-pre'
        );
        console.error(`[E006] Pre-response validation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  program
    .command("validate-post")
    .description("Validate a Post-Test JSON response")
    .argument("<file>", "JSON file containing post-response")
    .action(async (file) => {
      try {
        const content = await fsReadFile(file, "utf-8");
        const data = JSON.parse(content);
        const result = PostResponseSchema.safeParse(data);

        if (result.success) {
          console.log("✅ Post-response validation passed");
        } else {
          console.log("❌ Post-response validation failed:");
          result.error.issues.forEach((issue, i) => {
            console.log(`  ${i + 1}. ${issue.path.join('.')}: ${issue.message}`);
          });
          process.exit(1);
        }
      } catch (e) {
        await logError(
          process.cwd(),
          new CTDDError(
            `Post-response validation failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'validate-post', file }
          ),
          'validate-post'
        );
        console.error(`[E007] Post-response validation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  program
    .command("record-pre")
    .description("Record a Pre Self-Test JSON response")
    .argument("<file>", "JSON file containing pre-response")
    .action(async (file) => {
      try {
        const content = await fsReadFile(file, "utf-8");
        const data = PreResponseSchema.parse(JSON.parse(content));
        const spec = await loadSpec(process.cwd());
        const commitId = computeCommitId(spec);

        if (data.commit_id !== commitId) {
          console.error(`❌ Commit mismatch. Expected ${commitId}, got ${data.commit_id}`);
          process.exit(1);
        }

        const state = await recordEvent(process.cwd(), "pre", data);
        console.log(`✅ Recorded pre-response with commit ID: ${state.commit_id}`);
      } catch (e) {
        await logError(
          process.cwd(),
          new CTDDError(
            `Pre-response recording failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'record-pre', file }
          ),
          'record-pre'
        );
        console.error(`[E008] Pre-response recording failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  program
    .command("record-post")
    .description("Record a Post-Test JSON response. Optionally run plugins and merge.")
    .argument("<file>", "JSON file containing post-response")
    .option("--with-checks", "Run plugin checks and merge into post_check")
    .action(async (file, opts) => {
      try {
        const content = await fsReadFile(file, "utf-8");
        const data = PostResponseSchema.parse(JSON.parse(content));
        const spec = await loadSpec(process.cwd());
        const commitId = computeCommitId(spec);

        if (data.commit_id !== commitId) {
          console.error(`❌ Commit mismatch. Expected ${commitId}, got ${data.commit_id}`);
          process.exit(1);
        }

        let finalData = data;
        if (opts.withChecks) {
          console.log("🔍 Running plugin checks...");
          const results = await runPlugins(process.cwd());
          const postChecks = checksToPostChecks(results);
          finalData = {
            ...data,
            post_check: [...data.post_check, ...postChecks]
          };
          console.log(`✅ Merged ${postChecks.length} plugin check(s)`);
        }

        const state = await recordEvent(process.cwd(), "post", finalData);
        console.log(`✅ Recorded post-response with commit ID: ${state.commit_id}`);
      } catch (e) {
        await logError(
          process.cwd(),
          new CTDDError(
            `Post-response recording failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'record-post', file, opts }
          ),
          'record-post'
        );
        console.error(`[E009] Post-response recording failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });
}