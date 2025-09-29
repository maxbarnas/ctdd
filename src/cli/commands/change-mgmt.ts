// src/cli/commands/change-mgmt.ts
// Phase 1: Change Management Commands - diff, delta, checks

import { Command } from "commander";
import {
  loadSpec,
  computeCommitId,
  applyDeltaObject,
  logError
} from "../../core.js";
import { readFile as fsReadFile } from "fs/promises";
import { runPlugins } from "../../plugin.js";
import { CTDDError, ErrorCodes } from "../../errors.js";

export function setupChangeManagementCommands(program: Command) {
  program
    .command("diff")
    .description("Show before/after comparison for a delta JSON\n" +
      "Preview changes before applying them with 'ctdd delta'.\n" +
      "Shows modifications, additions, and removals\n" +
      "with clear formatting.\n" +
      "Example: ctdd diff changes.json")
    .argument("<file>", "Delta JSON file to preview")
    .action(async (file) => {
      try {
        const content = await fsReadFile(file, "utf-8");
        const delta = JSON.parse(content);

        console.log("🔍 CTDD Delta Preview");
        console.log("=".repeat(50));
        console.log(`Delta file: ${file}`);

        // Show what would change
        if (delta.focus_card) {
          console.log("\n📋 Focus Card Changes:");
          if (delta.focus_card.goal) console.log(`  🎯 Goal: ${delta.focus_card.goal}`);
          if (delta.focus_card.deliverables) {
            console.log("  📦 Deliverables:");
            delta.focus_card.deliverables.forEach((d: string, i: number) => {
              console.log(`    ${i + 1}. ${d}`);
            });
          }
        }

        if (delta.invariants) {
          console.log("\n🔒 Invariant Changes:");
          if (delta.invariants.add) {
            console.log("  ➕ Adding:");
            delta.invariants.add.forEach((inv: any) => {
              console.log(`    ${inv.id}: ${inv.text}`);
            });
          }
          if (delta.invariants.modify) {
            console.log("  ✏️ Modifying:");
            delta.invariants.modify.forEach((inv: any) => {
              console.log(`    ${inv.id}: ${inv.text}`);
            });
          }
        }

        if (delta.cuts) {
          console.log("\n🎯 CUT Changes:");
          if (delta.cuts.add) {
            console.log("  ➕ Adding:");
            delta.cuts.add.forEach((cut: any) => {
              console.log(`    ${cut.id}: ${cut.text}`);
            });
          }
          if (delta.cuts.modify) {
            console.log("  ✏️ Modifying:");
            delta.cuts.modify.forEach((cut: any) => {
              console.log(`    ${cut.id}: ${cut.text}`);
            });
          }
        }

        console.log("\n💡 To apply these changes, run: ctdd delta " + file);
      } catch (e) {
        await logError(
          process.cwd(),
          new CTDDError(
            `Delta preview failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'diff', file }
          ),
          'diff'
        );
        console.error(`[E010] Delta preview failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  program
    .command("delta")
    .description("Apply a delta JSON and bump commit")
    .argument("<file>", "Delta JSON file to apply")
    .action(async (file) => {
      try {
        const content = await fsReadFile(file, "utf-8");
        const delta = JSON.parse(content);
        const { newCommitId } = await applyDeltaObject(process.cwd(), delta);
        console.log(`✅ Applied delta successfully. New commit: ${newCommitId}`);
      } catch (e) {
        await logError(
          process.cwd(),
          new CTDDError(
            `Delta application failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'delta', file }
          ),
          'delta'
        );
        console.error(`[E011] Delta application failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  program
    .command("checks")
    .description("Run plugin checks under .ctdd/plugins\n" +
      "Executes all configured plugins and reports results.\n" +
      "Examples:\n" +
      "  ctdd checks           # Human-readable output\n" +
      "  ctdd checks --json    # JSON format for tools")
    .option("--json", "Output results in JSON format")
    .action(async (opts) => {
      try {
        const results = await runPlugins(process.cwd());

        if (opts.json) {
          console.log(JSON.stringify({ checks: results }, null, 2));
        } else {
          console.log("🔍 Running CTDD plugin checks...");
          console.log("=".repeat(50));
          console.log("🔍 CTDD Plugin Check Results");
          console.log("=".repeat(50));

          if (results.length === 0) {
            console.log("ℹ️  No plugin checks configured");
            return;
          }

          results.forEach((result) => {
            const status = result.status === "PASS" ? "✅" : "❌";
            console.log(`${status} ${result.id}: ${result.title || "No title"}`);

            if (result.evidence) {
              console.log(`   Evidence: ${result.evidence}`);
            }

            if (result.status === "FAIL") {
              console.log(`   Status: Failed validation`);
            }
            console.log();
          });

          const passCount = results.filter(r => r.status === "PASS").length;
          const failCount = results.filter(r => r.status === "FAIL").length;

          console.log("=".repeat(50));
          console.log(`📊 Summary: ${passCount} passed, ${failCount} failed`);

          if (failCount > 0) {
            process.exit(1);
          }
        }
      } catch (e) {
        await logError(
          process.cwd(),
          new CTDDError(
            `Plugin checks failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'checks' }
          ),
          'checks'
        );
        console.error(`[E012] Plugin checks failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });
}