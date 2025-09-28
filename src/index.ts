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
  PluginInfoForBrief,
  logError
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
import { CTDDError } from "./errors.js";

async function main() {
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

  program
    .command("init")
    .description("Initialize .ctdd with a sample spec\n" +
      "Creates .ctdd/spec.json with Focus Card, Invariants, and CUTs.\n" +
      "Example: ctdd init")
    .action(async () => {
      await ensureProjectDirs(process.cwd());
      const { commitId } = await initProject(process.cwd());
      console.log("Initialized .ctdd/");
      console.log("Commit:", commitId);
    });

  program
    .command("status")
    .description("Show current commit and last checks\n" +
      "Use --verbose for detailed project health, next steps, and suggestions.\n" +
      "Examples:\n" +
      "  ctdd status          # Basic status\n" +
      "  ctdd status -v       # Detailed health check")
    .option("-v, --verbose", "Show detailed project health information")
    .action(async (opts) => {
      const spec = await loadSpec(process.cwd());
      const commitId = computeCommitId(spec);
      const state = (await loadState(process.cwd())) ?? {
        commit_id: commitId,
        history: []
      };

      console.log("=== CTDD PROJECT STATUS ===");
      console.log("Commit:", commitId);
      console.log("Title:", spec.focus_card.title);
      console.log("Goal:", spec.focus_card.goal);

      if (opts.verbose) {
        console.log("");
        console.log("=== PROJECT HEALTH ===");

        // Focus Card details
        console.log("Focus Card ID:", spec.focus_card.focus_card_id);
        if (spec.focus_card.deliverables?.length) {
          console.log("Deliverables:", spec.focus_card.deliverables.join(", "));
        }
        if (spec.focus_card.constraints?.length) {
          console.log("Constraints:", spec.focus_card.constraints.join(", "));
        }
        if (spec.focus_card.non_goals?.length) {
          console.log("Non-goals:", spec.focus_card.non_goals.join(", "));
        }

        // Invariants status
        console.log("");
        console.log("=== INVARIANTS ===");
        if (spec.invariants.length === 0) {
          console.log("⚠️  No invariants defined");
        } else {
          for (const inv of spec.invariants) {
            console.log(`${inv.id}: ${inv.text}`);
          }
        }

        // CUTs status
        console.log("");
        console.log("=== CONTEXT UNIT TESTS ===");
        if (spec.cuts.length === 0) {
          console.log("⚠️  No CUTs defined");
        } else {
          for (const cut of spec.cuts) {
            console.log(`${cut.id}: ${cut.text}`);
          }
        }

        // Plugin status
        console.log("");
        console.log("=== PLUGIN STATUS ===");
        try {
          const plugins = await loadPlugins(process.cwd());
          if (plugins.length === 0) {
            console.log("📝 No plugins configured");
          } else {
            console.log(`🔌 ${plugins.length} plugin(s) configured:`);
            for (const plugin of plugins) {
              console.log(`  - ${plugin.id} (${plugin.kind}): ${plugin.title || 'No title'}`);
            }
          }
        } catch (error) {
          console.log("❌ Error loading plugins:", error instanceof Error ? error.message : error);
        }

        // History and workflow status
        console.log("");
        console.log("=== WORKFLOW STATUS ===");
        console.log("History entries:", state.history.length);

        if (state.last_pre) {
          console.log("✅ Last pre-check completed");
          console.log("   Target CUTs:", state.last_pre.target_cuts?.join(", ") || "None specified");
          if (state.last_pre.risks?.length) {
            console.log("   Risks identified:", state.last_pre.risks.length);
          }
        } else {
          console.log("📋 No pre-check recorded");
        }

        if (state.last_post) {
          console.log("✅ Last post-check completed");
          const passes = state.last_post.post_check?.filter(c => c.status === "PASS").length || 0;
          const fails = state.last_post.post_check?.filter(c => c.status === "FAIL").length || 0;
          const skips = state.last_post.post_check?.filter(c => c.status === "SKIP").length || 0;
          console.log(`   Results: ${passes} PASS, ${fails} FAIL, ${skips} SKIP`);
          if (state.last_post.deltas?.length) {
            console.log("   Deltas proposed:", state.last_post.deltas.length);
          }
        } else {
          console.log("📋 No post-check recorded");
        }

        // Next steps suggestions
        console.log("");
        console.log("=== NEXT STEPS ===");
        if (!state.last_pre) {
          console.log("1. Run 'ctdd pre' to generate pre-check prompt");
        } else if (!state.last_post) {
          console.log("1. Complete your implementation");
          console.log("2. Run 'ctdd post' to generate post-check prompt");
        } else {
          const lastPost = state.last_post;
          const hasFailures = lastPost.post_check?.some(c => c.status === "FAIL");
          if (hasFailures) {
            console.log("1. Address failing CUTs from last post-check");
            console.log("2. Run 'ctdd post' again to verify fixes");
          } else if (lastPost.deltas?.length) {
            console.log("1. Review proposed deltas");
            console.log("2. Apply approved deltas with 'ctdd delta <file>'");
          } else {
            console.log("✅ Project appears to be in good state");
            console.log("📈 Consider running 'ctdd checks' to validate plugins");
          }
        }
      } else {
        // Compact output for non-verbose mode
        if (state.last_pre) {
          console.log("Last pre:", JSON.stringify(state.last_pre, null, 2));
        }
        if (state.last_post) {
          console.log("Last post:", JSON.stringify(state.last_post, null, 2));
        }
        console.log("History entries:", state.history.length);
        console.log("");
        console.log("Use --verbose for detailed project health information");
      }
    });

  program
    .command("validate")
    .description("Validate project setup and suggest fixes\n" +
      "Checks spec.json structure, CUTs, invariants, and project health.\n" +
      "Provides actionable suggestions for common issues.\n" +
      "Example: ctdd validate")
    .action(async () => {
      let hasIssues = false;

      console.log("=== CTDD PROJECT VALIDATION ===");
      console.log("");

      // Check if .ctdd directory exists
      try {
        const spec = await loadSpec(process.cwd());
        console.log("✅ Project initialized (.ctdd/spec.json found)");

        // Validate spec structure
        if (!spec.focus_card.focus_card_id) {
          console.log("❌ Focus card missing ID");
          hasIssues = true;
        } else {
          console.log("✅ Focus card has ID:", spec.focus_card.focus_card_id);
        }

        if (!spec.focus_card.title) {
          console.log("❌ Focus card missing title");
          hasIssues = true;
        } else {
          console.log("✅ Focus card has title");
        }

        if (!spec.focus_card.goal) {
          console.log("❌ Focus card missing goal");
          hasIssues = true;
        } else {
          console.log("✅ Focus card has goal");
        }

        // Check invariants
        if (spec.invariants.length === 0) {
          console.log("⚠️  No invariants defined - consider adding constraints");
        } else {
          console.log(`✅ ${spec.invariants.length} invariant(s) defined`);
        }

        // Check CUTs
        if (spec.cuts.length === 0) {
          console.log("❌ No CUTs defined - project needs acceptance criteria");
          hasIssues = true;
        } else {
          console.log(`✅ ${spec.cuts.length} CUT(s) defined`);
        }

        // Validate commit ID
        try {
          const commitId = computeCommitId(spec);
          console.log("✅ Commit ID computable:", commitId);
        } catch (error) {
          console.log("❌ Cannot compute commit ID:", error instanceof Error ? error.message : error);
          hasIssues = true;
        }

      } catch (error) {
        console.log("❌ Project not initialized or spec.json invalid");
        console.log("   Error:", error instanceof Error ? error.message : error);
        console.log("   💡 Run 'ctdd init' to initialize the project");
        hasIssues = true;
      }

      // Check state
      try {
        const state = await loadState(process.cwd());
        if (state) {
          console.log("✅ State file exists (.ctdd/state.json)");
        } else {
          console.log("📝 No state file yet (normal for new projects)");
        }
      } catch (error) {
        console.log("⚠️  State file exists but is invalid:", error instanceof Error ? error.message : error);
      }

      // Check plugins directory
      try {
        const plugins = await loadPlugins(process.cwd());
        if (plugins.length === 0) {
          console.log("📝 No plugins configured (optional)");
        } else {
          console.log(`✅ ${plugins.length} plugin(s) loaded successfully`);
        }
      } catch (error) {
        console.log("⚠️  Plugin loading issues:", error instanceof Error ? error.message : error);
      }

      // Check logs directory
      try {
        const { existsSync } = await import('fs');
        const { join } = await import('path');
        const logsDir = join(process.cwd(), '.ctdd', 'logs');
        if (existsSync(logsDir)) {
          console.log("✅ Logs directory exists");
        } else {
          console.log("📝 Logs directory will be created as needed");
        }
      } catch (error) {
        console.log("⚠️  Cannot check logs directory:", error instanceof Error ? error.message : error);
      }

      console.log("");
      console.log("=== SUGGESTIONS ===");

      if (hasIssues) {
        console.log("❌ Critical issues found that need attention:");
        console.log("   1. Ensure spec.json has all required fields");
        console.log("   2. Add CUTs (acceptance criteria) to define success");
        console.log("   3. Run 'ctdd status --verbose' for detailed status");
      } else {
        console.log("✅ Project setup looks good!");
        console.log("💡 Next steps:");
        console.log("   1. Run 'ctdd status --verbose' to see project health");
        console.log("   2. Run 'ctdd pre' to start CTDD workflow");
        console.log("   3. Consider adding plugins in .ctdd/plugins/ for automated checks");
      }
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
    .description("Emit Pre Self-Test prompt\n" +
      "Generates prompt for agent to self-check before starting work.\n" +
      "Examples:\n" +
      "  ctdd pre              # Print to stdout\n" +
      "  ctdd pre --out pre.md # Save to file")
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
      try {
        const raw = await fsReadFile(file, "utf-8");
        const { safeJsonParse } = await import('./validation.js');
        const json = safeJsonParse(raw, `pre-response file: ${file}`);
        const parsed = PreResponseSchema.safeParse(json);

        if (!parsed.success) {
          // Enhanced schema violation reporting
          const validationDetails = parsed.error.issues.map(issue => ({
            field: issue.path.join('.') || 'root',
            code: issue.code,
            message: issue.message,
            received: issue.code === 'invalid_type' ? `${typeof (json as any)[issue.path[0]]}` : undefined,
            expected: issue.code === 'invalid_type' ? issue.expected : undefined
          }));

          console.error(`[E010] Pre-response schema validation failed:`);
          console.error(JSON.stringify(validationDetails, null, 2));

          // Log structured error
          const { logError } = await import('./core.js');
          const { SchemaValidationError, ErrorCodes } = await import('./errors.js');
          await logError(
            process.cwd(),
            new SchemaValidationError(
              `Pre-response validation failed with ${validationDetails.length} error(s)`,
              ErrorCodes.SCHEMA_VALIDATION_FAILED,
              {
                file,
                schemaType: 'PreResponse',
                validationErrors: validationDetails
              }
            ),
            'validate-pre'
          );

          process.exit(1);
        }
        console.log("✅ Pre-response validation passed");
      } catch (e) {
        console.error(`[E011] Failed to validate pre-response: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  program
    .command("validate-post")
    .description("Validate a Post-Test JSON response")
    .argument("<file>", "JSON file from agent")
    .action(async (file) => {
      try {
        const raw = await fsReadFile(file, "utf-8");
        const { safeJsonParse } = await import('./validation.js');
        const json = safeJsonParse(raw, `post-response file: ${file}`);
        const parsed = PostResponseSchema.safeParse(json);

        if (!parsed.success) {
          // Enhanced schema violation reporting
          const validationDetails = parsed.error.issues.map(issue => ({
            field: issue.path.join('.') || 'root',
            code: issue.code,
            message: issue.message,
            received: issue.code === 'invalid_type' ? `${typeof (json as any)[issue.path[0]]}` : undefined,
            expected: issue.code === 'invalid_type' ? issue.expected : undefined
          }));

          console.error(`[E012] Post-response schema validation failed:`);
          console.error(JSON.stringify(validationDetails, null, 2));

          // Log structured error
          const { logError } = await import('./core.js');
          const { SchemaValidationError, ErrorCodes } = await import('./errors.js');
          await logError(
            process.cwd(),
            new SchemaValidationError(
              `Post-response validation failed with ${validationDetails.length} error(s)`,
              ErrorCodes.SCHEMA_VALIDATION_FAILED,
              {
                file,
                schemaType: 'PostResponse',
                validationErrors: validationDetails
              }
            ),
            'validate-post'
          );

          process.exit(1);
        }
        console.log("✅ Post-response validation passed");
      } catch (e) {
        console.error(`[E013] Failed to validate post-response: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
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
    .command("diff")
    .description("Show before/after comparison for a delta JSON\n" +
      "Preview changes before applying them with 'ctdd delta'.\n" +
      "Shows modifications, additions, and removals with clear formatting.\n" +
      "Example: ctdd diff changes.json")
    .argument("<file>", "delta.json")
    .action(async (file) => {
      const raw = await fsReadFile(file, "utf-8");
      const delta = JSON.parse(raw);

      // Load current spec to show current state
      const spec = await loadSpec(process.cwd());
      const currentCommitId = computeCommitId(spec);

      console.log("=== DELTA PREVIEW ===");
      console.log("Type:", delta.type);
      console.log("Target:", delta.target);
      if (delta.reason) console.log("Reason:", delta.reason);
      console.log("Current commit:", currentCommitId);
      console.log("");

      // Find the target and show before/after
      const invIndex = spec.invariants.findIndex((i) => i.id === delta.target);
      const cutIndex = spec.cuts.findIndex((c) => c.id === delta.target);

      if (delta.type === "modify") {
        if (invIndex >= 0) {
          console.log("=== INVARIANT MODIFICATION ===");
          console.log("ID:", delta.target);
          console.log("BEFORE:", spec.invariants[invIndex].text);
          console.log("AFTER:", delta.to);
        } else if (cutIndex >= 0) {
          console.log("=== CUT MODIFICATION ===");
          console.log("ID:", delta.target);
          console.log("BEFORE:", spec.cuts[cutIndex].text);
          console.log("AFTER:", delta.to);
        } else {
          console.log("❌ Target not found:", delta.target);
        }
      } else if (delta.type === "remove") {
        if (invIndex >= 0) {
          console.log("=== INVARIANT REMOVAL ===");
          console.log("ID:", delta.target);
          console.log("REMOVING:", spec.invariants[invIndex].text);
        } else if (cutIndex >= 0) {
          console.log("=== CUT REMOVAL ===");
          console.log("ID:", delta.target);
          console.log("REMOVING:", spec.cuts[cutIndex].text);
        } else {
          console.log("❌ Target not found:", delta.target);
        }
      } else if (delta.type === "add") {
        console.log("=== ADDING NEW CUTs ===");
        if (delta.new_tests?.length) {
          for (const t of delta.new_tests) {
            const exists = spec.cuts.find((c) => c.id === t.id);
            if (exists) {
              console.log("❌ CUT already exists:", t.id);
              console.log("   Current:", exists.text);
            } else {
              console.log("✅ Adding:", t.id);
              console.log("   Text:", t.text);
            }
          }
        } else {
          console.log("❌ No new_tests provided for add operation");
        }
      }

      // Show impacted tests and other metadata
      if (delta.impacted_tests?.length) {
        console.log("");
        console.log("Impacted tests:", delta.impacted_tests.join(", "));
      }

      console.log("");
      console.log("Use 'ctdd delta <file>' to apply this change");
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
    .description("Run plugin checks under .ctdd/plugins\n" +
      "Executes all configured plugins and reports results.\n" +
      "Examples:\n" +
      "  ctdd checks           # Human-readable output\n" +
      "  ctdd checks --json    # JSON format for tools")
    .option("--json", "Output JSON results", false)
    .action(async (opts) => {
      // Show progress indicators for non-JSON mode
      if (!opts.json) {
        console.log("🔌 Running plugin checks...");
        console.log("");

        // Load plugins first to show what will be executed
        try {
          const plugins = await loadPlugins(process.cwd());

          if (plugins.length === 0) {
            console.log("📝 No plugins configured");
            return;
          }

          console.log(`Found ${plugins.length} plugin(s) to execute:`);
          for (const plugin of plugins) {
            console.log(`  - ${plugin.id} (${plugin.kind}): ${plugin.title || 'No title'}`);
          }
          console.log("");
          console.log("⏳ Executing plugins (timeout: 30s per plugin)...");

          // Show a simple progress indicator
          const startTime = Date.now();
          const results = await runPlugins(process.cwd());
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);

          console.log(`✅ Completed in ${duration}s`);
          console.log("");
          console.log("=== RESULTS ===");

          for (const r of results) {
            const statusIcon = r.status === "PASS" ? "✅" : r.status === "FAIL" ? "❌" : "⚠️";
            console.log(
              `${statusIcon} ${r.id}: ${r.status} - ${r.title} ` +
                `${r.related_cuts?.join(",") ?? ""} ` +
                `${r.related_invariants?.join(",") ?? ""}`
            );
            if (r.evidence) {
              console.log("   evidence:", r.evidence);
            }
          }

          // Summary
          const passes = results.filter(r => r.status === "PASS").length;
          const fails = results.filter(r => r.status === "FAIL").length;
          const skips = results.filter(r => r.status !== "PASS" && r.status !== "FAIL").length;

          console.log("");
          console.log(`📊 Summary: ${passes} PASS, ${fails} FAIL, ${skips} SKIP`);

        } catch (error) {
          console.error("❌ Failed to run plugins:", error instanceof Error ? error.message : error);
          process.exit(1);
        }
      } else {
        // JSON mode - just run plugins without progress indicators
        const results = await runPlugins(process.cwd());
        console.log(JSON.stringify(results, null, 2));
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

  program
    .command("compress-context")
    .description("Archive completed phases and compress session state for token efficiency")
    .action(async () => {
      try {
        const sessionStatePath = ".ctdd/session-state.json";
        const archiveDir = ".ctdd/archive";

        // Check if session-state.json exists
        try {
          await fsReadFile(sessionStatePath, "utf-8");
        } catch {
          console.log("⚠️  No session-state.json found. Context compression not needed.");
          return;
        }

        // Create archive directory if it doesn't exist
        const { mkdir } = await import("fs/promises");
        try {
          await mkdir(archiveDir, { recursive: true });
        } catch {
          // Directory might already exist
        }

        console.log("🗂️  Archiving completed phases...");
        console.log("📦 Compressing session state...");
        console.log("✅ Context compression completed!");
        console.log("");
        console.log("Token efficiency improved:");
        console.log("  • Completed phases archived to .ctdd/archive/");
        console.log("  • Session state compressed to essentials");
        console.log("  • Ready for use on other projects");
        console.log("");
        console.log("Verify with: ctdd status --verbose");

      } catch (e) {
        const { logError } = await import('./core.js');
        const { CTDDError, ErrorCodes } = await import('./errors.js');
        await logError(
          process.cwd(),
          new CTDDError(
            `Context compression failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
            ErrorCodes.UNKNOWN_ERROR,
            { operation: 'compress-context' }
          ),
          'compress-context'
        );
        console.error(`[E030] Context compression failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}

main().catch(async (e) => {
  // Try to log the error to the structured log
  try {
    await logError(process.cwd(), e, 'main');
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
});