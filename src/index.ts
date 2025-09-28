// src/index.ts
import { Command } from "commander";
import {
  ensureProjectDirs,
  initProject,
  loadSpec,
  loadState,
  computeCommitId,
  renderPrePrompt,
  renderPostPrompt,
  renderAgentBrief,
  renderAgentBriefJson,
  recordEvent,
  applyDeltaObject,
  PreResponseSchema,
  PostResponseSchema,
  PluginInfoForBrief
} from "./core.js";
import {
  runPlugins,
  checksToPostChecks,
  PluginResult,
  loadPlugins
} from "./plugin.js";
import {
  readFile as fsReadFile,
  writeFile as fsWriteFile
} from "fs/promises";
import { startServer } from "./server.js";

async function main() {
  const program = new Command();
  program.name("ctdd").description("Context TDD sidecar").version("0.2.0");

  program
    .command("init")
    .description("Initialize .ctdd with a sample spec")
    .action(async () => {
      await ensureProjectDirs(process.cwd());
      const { commitId } = await initProject(process.cwd());
      console.log("Initialized .ctdd/");
      console.log("Commit:", commitId);
    });

  program
    .command("status")
    .description("Show current commit and last checks")
    .action(async () => {
      const spec = await loadSpec(process.cwd());
      const commitId = computeCommitId(spec);
      const state = (await loadState(process.cwd())) ?? {
        commit_id: commitId,
        history: []
      };
      console.log("Commit:", commitId);
      console.log("Title:", spec.focus_card.title);
      console.log("Goal:", spec.focus_card.goal);
      if (state.last_pre) {
        console.log("Last pre:", JSON.stringify(state.last_pre, null, 2));
      }
      if (state.last_post) {
        console.log("Last post:", JSON.stringify(state.last_post, null, 2));
      }
      console.log("History entries:", state.history.length);
    });

  program
    .command("hash")
    .description("Compute current commit_id")
    .action(async () => {
      const spec = await loadSpec(process.cwd());
      const commitId = computeCommitId(spec);
      console.log(commitId);
    });

  program
    .command("pre")
    .description("Emit Pre Self-Test prompt")
    .option("--out <file>", "Write prompt to file")
    .action(async (opts) => {
      const spec = await loadSpec(process.cwd());
      const commitId = computeCommitId(spec);
      const prompt = renderPrePrompt(spec, commitId);
      if (opts.out) {
        await fsWriteFile(opts.out, prompt, "utf-8");
      } else {
        console.log(prompt);
      }
    });

  program
    .command("post")
    .description("Emit Post-Test prompt")
    .option("--artifact <file>", "Optional artifact summary file")
    .option("--out <file>", "Write prompt to file")
    .action(async (opts) => {
      const spec = await loadSpec(process.cwd());
      const commitId = computeCommitId(spec);
      let hint: string | undefined;
      if (opts.artifact) {
        hint = await fsReadFile(opts.artifact, "utf-8");
      }
      const prompt = renderPostPrompt(spec, commitId, hint);
      if (opts.out) {
        await fsWriteFile(opts.out, prompt, "utf-8");
      } else {
        console.log(prompt);
      }
    });

  program
    .command("validate-pre")
    .description("Validate a Pre Self-Test JSON response")
    .argument("<file>", "JSON file from agent")
    .action(async (file) => {
      const raw = await fsReadFile(file, "utf-8");
      const parsed = PreResponseSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        console.error(parsed.error.format());
        process.exit(1);
      }
      console.log("OK");
    });

  program
    .command("validate-post")
    .description("Validate a Post-Test JSON response")
    .argument("<file>", "JSON file from agent")
    .action(async (file) => {
      const raw = await fsReadFile(file, "utf-8");
      const parsed = PostResponseSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        console.error(parsed.error.format());
        process.exit(1);
      }
      console.log("OK");
    });

  program
    .command("record-pre")
    .description("Record a Pre Self-Test JSON response")
    .argument("<file>", "JSON file from agent")
    .action(async (file) => {
      const raw = await fsReadFile(file, "utf-8");
      const data = PreResponseSchema.parse(JSON.parse(raw));
      const state = await recordEvent(process.cwd(), "pre", data);
      console.log("Recorded. Commit:", state.commit_id);
    });

  program
    .command("record-post")
    .description(
      "Record a Post-Test JSON response. Optionally run plugins and merge."
    )
    .argument("<file>", "JSON file from agent")
    .option("--with-checks", "Run plugins and merge results", false)
    .action(async (file, opts) => {
      const raw = await fsReadFile(file, "utf-8");
      const data = PostResponseSchema.parse(JSON.parse(raw));
      let merged = data;
      if (opts.with_checks) {
        const results: PluginResult[] = await runPlugins(process.cwd());
        const postChecks = checksToPostChecks(results);
        merged = {
          ...data,
          post_check: [...data.post_check, ...postChecks]
        };
      }
      const state = await recordEvent(process.cwd(), "post", merged);
      console.log("Recorded. Commit:", state.commit_id);
    });

  program
    .command("delta")
    .description("Apply a delta JSON and bump commit")
    .argument("<file>", "delta.json")
    .action(async (file) => {
      const raw = await fsReadFile(file, "utf-8");
      const delta = JSON.parse(raw);
      const { newCommitId } = await applyDeltaObject(process.cwd(), delta);
      console.log("Applied delta. New commit:", newCommitId);
    });

  program
    .command("checks")
    .description("Run plugin checks under .ctdd/plugins")
    .option("--json", "Output JSON results", false)
    .action(async (opts) => {
      const results = await runPlugins(process.cwd());
      if (opts.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        for (const r of results) {
          console.log(
            `${r.id}: ${r.status} - ${r.title} ` +
              `${r.related_cuts?.join(",") ?? ""} ` +
              `${r.related_invariants?.join(",") ?? ""}`
          );
          if (r.evidence) {
            console.log("  evidence:", r.evidence);
          }
        }
      }
    });

  program
    .command("serve")
    .description("Start the CTDD HTTP server")
    .option("-p, --port <port>", "Port", "4848")
    .action(async (opts) => {
      const port = parseInt(String(opts.port), 10) || 4848;
      await startServer({ root: process.cwd(), port });
    });

  program
    .command("brief")
    .description("Emit AGENT_BRIEF.md from current spec and plugins")
    .option("--out <file>", "Write markdown to file")
    .option("--no-plugins", "Exclude plugin summaries from the brief")
    .action(async (opts) => {
      const spec = await loadSpec(process.cwd());
      const commitId = computeCommitId(spec);
      let pluginsInfo: PluginInfoForBrief[] | undefined;
      const includePlugins = opts.plugins !== false;
      if (includePlugins) {
        const defs = await loadPlugins(process.cwd());
        pluginsInfo = defs.map((d: any) => {
          const base = {
            id: d.id as string,
            kind: d.kind as string,
            title: d.title as string | undefined,
            report_as: d.report_as as string | undefined,
            relatedCuts: d.relatedCuts as string[] | undefined,
            relatedInvariants: d.relatedInvariants as string[] | undefined
          };
          if (d.kind === "grep") {
            return {
              ...base,
              file: d.file,
              pattern: d.pattern,
              flags: d.flags,
              must_exist: d.must_exist
            };
          }
          if (d.kind === "file_exists") {
            return { ...base, file: d.file, should_exist: d.should_exist };
          }
          return base;
        });
      }
      const md = renderAgentBrief(spec, commitId, pluginsInfo);
      if (opts.out) await fsWriteFile(opts.out, md, "utf-8");
      else console.log(md);
    });

  program
    .command("brief-json")
    .description("Emit AGENT_BRIEF.json from current spec and plugins")
    .option("--out <file>", "Write JSON to file")
    .option("--no-plugins", "Exclude plugin summaries", false)
    .action(async (opts) => {
      const spec = await loadSpec(process.cwd());
      const commitId = computeCommitId(spec);
      let pluginsInfo: PluginInfoForBrief[] | undefined;
      const includePlugins = opts.plugins !== false;
      if (includePlugins) {
        const defs = await loadPlugins(process.cwd());
        pluginsInfo = defs.map((d: any) => {
          const base = {
            id: d.id as string,
            kind: d.kind as string,
            title: d.title as string | undefined,
            report_as: d.report_as as string | undefined,
            relatedCuts: d.relatedCuts as string[] | undefined,
            relatedInvariants: d.relatedInvariants as string[] | undefined
          };
          if (d.kind === "grep") {
            return {
              ...base,
              file: d.file,
              pattern: d.pattern,
              flags: d.flags,
              must_exist: d.must_exist
            };
          }
          if (d.kind === "file_exists") {
            return { ...base, file: d.file, should_exist: d.should_exist };
          }
          return base;
        });
      }
      const json = renderAgentBriefJson(spec, commitId, pluginsInfo);
      const out = JSON.stringify(json, null, 2);
      if (opts.out) await fsWriteFile(opts.out, out, "utf-8");
      else console.log(out);
    });

  await program.parseAsync(process.argv);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});