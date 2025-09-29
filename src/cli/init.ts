// src/cli/init.ts
// Extracted init command logic from index.ts (Phase 1 bootstrap)

import { ensureProjectDirs, initProject, loadMarkdownTemplate, loadJsonTemplate } from "../core.js";

export async function executeInitCommand(opts: { full?: boolean; template?: string }) {
  try {
    const projectDir = process.cwd();

    if (opts.full) {
      console.log("🚀 Initializing complete CTDD project setup...");
      console.log("");

      // Create basic structure first
      await ensureProjectDirs(projectDir);
      const { commitId } = await initProject(projectDir, opts.template);

      // Create enhanced CLAUDE.md with bootstrap insights
      const { writeFile, mkdir } = await import("fs/promises");
      const { existsSync } = await import("fs");

      // Create contracts directory
      if (!existsSync("contracts")) {
        await mkdir("contracts", { recursive: true });
      }

      // Create docs directory
      if (!existsSync("docs")) {
        await mkdir("docs", { recursive: true });
      }

      // Generate CLAUDE.md with current best practices from template
      const claudeMdContent = await loadMarkdownTemplate('claude-md-template');
      await writeFile("CLAUDE.md", claudeMdContent, "utf-8");
      console.log("✅ Created CLAUDE.md with bootstrap insights");

      // Create session state template with dynamic values
      const templateVariables = {
        DATE: new Date().toISOString().split('T')[0],
        TIMESTAMP: new Date().toISOString()
      };
      const sessionStateTemplate = await loadJsonTemplate('session-state-template', templateVariables);

      await writeFile(".ctdd/session-state.json", JSON.stringify(sessionStateTemplate, null, 2), "utf-8");
      console.log("✅ Created session-state.json template");

      console.log("");
      console.log("🎯 CTDD project initialized successfully!");
      console.log("📚 Next steps:");
      console.log("  1. Review and customize CLAUDE.md");
      console.log("  2. Define your Focus Card in .ctdd/spec.json");
      console.log("  3. Start development with: ctdd status");
      console.log("");
      console.log("🔧 The full setup includes bootstrap methodology for maximum efficiency.");

      return { commitId };
    } else {
      // Standard init
      await ensureProjectDirs(projectDir);
      const { commitId } = await initProject(projectDir, opts.template);
      console.log(`✅ Project initialized with commit ID: ${commitId}`);
      return { commitId };
    }
  } catch (error) {
    throw error;
  }
}
