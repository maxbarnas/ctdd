// src/cli/commands/server-docs.ts
// Phase 1: Server & Documentation Commands - serve, brief, brief-json

import { Command } from "commander";
import {
  loadSpec,
  computeCommitId,
  renderAgentBrief,
  renderAgentBriefJson,
  logError
} from "../../core.js";
import { writeFile as fsWriteFile } from "fs/promises";
import { startServer } from "../../server.js";
import { loadPlugins, PluginResult } from "../../plugin.js";
import { CTDDError, ErrorCodes } from "../../errors.js";

export function setupServerDocsCommands(program: Command) {
  program
    .command("serve")
    .description("Start the CTDD HTTP server")
    .option("--port <number>", "Port number", "4848")
    .action(async (opts) => {
      try {
        const port = parseInt(opts.port, 10);
        await startServer({ root: process.cwd(), port });
      } catch (e) {
        await logError(
          process.cwd(),
          new CTDDError(
            `Server startup failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'serve', port: opts.port }
          ),
          'serve'
        );
        console.error(`[E013] Server startup failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  program
    .command("brief")
    .description("Emit AGENT_BRIEF.md from current spec and plugins")
    .option("--out <file>", "Output file path")
    .option("--no-plugins", "Exclude plugin information")
    .action(async (opts) => {
      try {
        const spec = await loadSpec(process.cwd());
        const commitId = computeCommitId(spec);

        let pluginsInfo: any[] | undefined;
        if (opts.plugins !== false) {
          try {
            const defs = await loadPlugins(process.cwd());
            pluginsInfo = defs.map((d: any) => {
              const base: any = {
                id: d.id,
                kind: d.kind,
                title: d.title,
                report_as: d.report_as,
                relatedCuts: d.relatedCuts,
                relatedInvariants: d.relatedInvariants
              };
              return { ...base, ...d };
            });
          } catch {
            // Plugins not available, continue without them
            pluginsInfo = undefined;
          }
        }

        const brief = renderAgentBrief(spec, commitId, pluginsInfo);

        if (opts.out) {
          await fsWriteFile(opts.out, brief, "utf-8");
          console.log(`Agent brief saved to ${opts.out}`);
        } else {
          console.log(brief);
        }
      } catch (e) {
        await logError(
          process.cwd(),
          new CTDDError(
            `Brief generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'brief', opts }
          ),
          'brief'
        );
        console.error(`[E014] Brief generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  program
    .command("brief-json")
    .description("Emit AGENT_BRIEF.json from current spec and plugins")
    .option("--out <file>", "Output file path")
    .option("--no-plugins", "Exclude plugin information")
    .action(async (opts) => {
      try {
        const spec = await loadSpec(process.cwd());
        const commitId = computeCommitId(spec);

        let pluginsInfo: any[] | undefined;
        if (opts.plugins !== false) {
          try {
            const defs = await loadPlugins(process.cwd());
            pluginsInfo = defs.map((d: any) => {
              const base: any = {
                id: d.id,
                kind: d.kind,
                title: d.title,
                report_as: d.report_as,
                relatedCuts: d.relatedCuts,
                relatedInvariants: d.relatedInvariants
              };
              return { ...base, ...d };
            });
          } catch {
            // Plugins not available, continue without them
            pluginsInfo = undefined;
          }
        }

        const brief = renderAgentBriefJson(spec, commitId, pluginsInfo);

        if (opts.out) {
          await fsWriteFile(opts.out, JSON.stringify(brief, null, 2), "utf-8");
          console.log(`Agent brief JSON saved to ${opts.out}`);
        } else {
          console.log(JSON.stringify(brief, null, 2));
        }
      } catch (e) {
        await logError(
          process.cwd(),
          new CTDDError(
            `Brief JSON generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'brief-json', opts }
          ),
          'brief-json'
        );
        console.error(`[E015] Brief JSON generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });
}