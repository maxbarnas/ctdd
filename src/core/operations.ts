// src/core/operations.ts
// Phase 1 File Splitting Operations (AT005-AT009)
// Adapted from validated phase0-demo.cjs patterns

import { readFileSync, readdirSync, writeFileSync, statSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join, dirname, relative, sep } from 'path';
import { spawn } from 'child_process';

interface OversizedFile {
  path: string;
  lines: number;
  limit: number;
  ratio: number;
  type: 'source' | 'test';
}

interface SplitResult {
  files: Array<{
    path: string;
    description: string;
    content?: string;
  }>;
  timeMs: number;
}

interface VerificationResult {
  testsPass: boolean;
  buildSuccess: boolean;
  importsValid: boolean;
  details: string[];
}

export async function analyzeSloc(projectRoot: string): Promise<OversizedFile[]> {
  const oversized: OversizedFile[] = [];

  function scanDirectory(dir: string): void {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', '.git', '.ctdd'].includes(entry.name)) {
          scanDirectory(fullPath);
        }
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        const content = readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n').length;
        const isTest = fullPath.includes('test') || entry.name.includes('.test.');
        const limit = isTest ? 200 : 100;

        if (lines > limit) {
          oversized.push({
            path: relative(projectRoot, fullPath).replace(/\\/g, '/'),
            lines,
            limit,
            ratio: lines / limit,
            type: isTest ? 'test' : 'source'
          });
        }
      }
    }
  }

  scanDirectory(projectRoot);
  oversized.sort((a, b) => b.ratio - a.ratio);

  // Display results
  if (oversized.length === 0) {
    console.log('✅ All files are within SLOC limits!');
  } else {
    console.log(`Found ${oversized.length} file(s) exceeding limits:\n`);

    const sourceFiles = oversized.filter(f => f.type === 'source');
    const testFiles = oversized.filter(f => f.type === 'test');

    if (sourceFiles.length > 0) {
      console.log('Source files exceeding 100 SLOC:');
      for (const file of sourceFiles) {
        const marker = file.ratio > 10 ? '🔴' : file.ratio > 5 ? '🟡' : '🟠';
        console.log(`  ${marker} ${file.path}: ${file.lines} lines (${file.ratio.toFixed(1)}x over limit)`);
      }
      console.log();
    }

    if (testFiles.length > 0) {
      console.log('Test files exceeding 200 SLOC:');
      for (const file of testFiles) {
        const marker = file.ratio > 2 ? '🔴' : '🟡';
        console.log(`  ${marker} ${file.path}: ${file.lines} lines (${file.ratio.toFixed(1)}x over limit)`);
      }
    }
  }

  return oversized;
}

export async function splitFile(filePath: string, options: { auto?: boolean; dryRun?: boolean }): Promise<SplitResult> {
  const startTime = Date.now();

  console.log(`🔍 Analyzing ${filePath}...`);

  // Get split suggestions based on file type
  const suggestions = getSplitSuggestions(filePath);

  if (options.dryRun) {
    return {
      files: suggestions.map(s => ({ path: s.path, description: s.description })),
      timeMs: Date.now() - startTime
    };
  }

  if (!options.auto) {
    console.log('\n📋 Suggested split plan:');
    suggestions.forEach(s => {
      console.log(`  📦 ${s.path} - ${s.description}`);
    });
    console.log('\nUse --auto to execute this plan');
    return {
      files: suggestions.map(s => ({ path: s.path, description: s.description })),
      timeMs: Date.now() - startTime
    };
  }

  // Execute the split for src/index.ts
  if (filePath.includes('index.ts')) {
    return await splitIndexFile(filePath, suggestions);
  }

  throw new Error(`Auto-split not yet implemented for ${filePath}. Use phase0-demo.cjs patterns for implementation.`);
}

function getSplitSuggestions(filePath: string) {
  if (filePath.includes('index.ts')) {
    return [
      { path: 'src/cli/init.ts', description: 'Init command logic' },
      { path: 'src/cli/status.ts', description: 'Status and validation commands' },
      { path: 'src/cli/prompts.ts', description: 'Pre/post prompt commands' },
      { path: 'src/cli/responses.ts', description: 'Response validation' },
      { path: 'src/cli/checks.ts', description: 'Plugin check commands' },
      { path: 'src/cli/utilities.ts', description: 'Utility commands' },
      { path: 'src/cli/briefing.ts', description: 'Brief generation commands' },
      { path: 'src/cli/project.ts', description: 'Project management commands' },
      { path: 'src/cli/server.ts', description: 'Server command' },
      { path: 'src/cli/delta.ts', description: 'Delta application command' }
    ];
  } else if (filePath.includes('core.ts')) {
    return [
      { path: 'src/core/constants.ts', description: 'Core constants' },
      { path: 'src/core/state.ts', description: 'State management' },
      { path: 'src/schemas/spec.ts', description: 'Zod schemas' },
      { path: 'src/io/files.ts', description: 'File operations' }
    ];
  } else {
    return [
      { path: 'src/modules/extracted.ts', description: 'Extracted functionality' }
    ];
  }
}

async function splitIndexFile(filePath: string, suggestions: Array<{ path: string; description: string }>): Promise<SplitResult> {
  console.log('\n🚧 Starting index.ts split implementation...');

  // Read the current index.ts content
  const content = readFileSync(filePath, 'utf-8');

  // Create CLI directory
  await mkdir('src/cli', { recursive: true });

  // For Phase 1, we'll create a simplified split focusing on the init command
  // This is the bootstrap approach - get value quickly, then iterate

  const initCommandExtraction = extractInitCommand(content);

  // Write the extracted init command
  writeFileSync('src/cli/init.ts', initCommandExtraction.content);
  console.log('✅ Created src/cli/init.ts');

  // Create a simplified barrel export
  const barrelContent = `// Auto-generated barrel export for CLI modules
export * from './init.js';
// Additional exports will be added as more modules are split
`;
  writeFileSync('src/cli/index.ts', barrelContent);
  console.log('✅ Created src/cli/index.ts (barrel export)');

  return {
    files: [
      { path: 'src/cli/init.ts', description: 'Init command logic', content: initCommandExtraction.content },
      { path: 'src/cli/index.ts', description: 'Barrel export for CLI modules', content: barrelContent }
    ],
    timeMs: Date.now() - Date.now()
  };
}

function extractInitCommand(content: string): { content: string; imports: string[] } {
  // This is a simplified extraction for the bootstrap phase
  // In a full implementation, this would use AST parsing

  const initCommandContent = `// src/cli/init.ts
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
      console.log(\`✅ Project initialized with commit ID: \${commitId}\`);
      return { commitId };
    }
  } catch (error) {
    throw error;
  }
}
`;

  return {
    content: initCommandContent,
    imports: ['ensureProjectDirs', 'initProject', 'loadMarkdownTemplate', 'loadJsonTemplate']
  };
}

export async function verifySplits(options: { final?: boolean }): Promise<VerificationResult> {
  console.log('🔍 Running verification checks...');

  const results: VerificationResult = {
    testsPass: false,
    buildSuccess: false,
    importsValid: false,
    details: []
  };

  // Check if build succeeds
  try {
    console.log('  🏗️  Checking build...');
    const buildResult = await runCommand('npm', ['run', 'build']);
    results.buildSuccess = buildResult.success;
    if (buildResult.success) {
      results.details.push('✅ Build successful');
    } else {
      results.details.push(`❌ Build failed: ${buildResult.error}`);
    }
  } catch (e) {
    results.details.push(`❌ Build check failed: ${e}`);
  }

  // Check if tests pass
  try {
    console.log('  📊 Running tests...');
    const testResult = await runCommand('npm', ['test']);
    results.testsPass = testResult.success;
    if (testResult.success) {
      results.details.push('✅ All tests passing');
    } else {
      results.details.push(`❌ Tests failed: ${testResult.error}`);
    }
  } catch (e) {
    results.details.push(`❌ Test check failed: ${e}`);
  }

  // Basic import validation (simplified for Phase 1)
  results.importsValid = results.buildSuccess; // If build succeeds, imports are valid

  if (results.importsValid) {
    results.details.push('✅ Import structure valid');
  }

  return results;
}

async function runCommand(command: string, args: string[]): Promise<{ success: boolean; output: string; error?: string }> {
  return new Promise((resolve) => {
    const process = spawn(command, args, { stdio: 'pipe', shell: true });
    let output = '';
    let error = '';

    process.stdout?.on('data', (data) => {
      output += data.toString();
    });

    process.stderr?.on('data', (data) => {
      error += data.toString();
    });

    process.on('close', (code) => {
      resolve({
        success: code === 0,
        output,
        error: code !== 0 ? error : undefined
      });
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      process.kill();
      resolve({
        success: false,
        output,
        error: 'Command timed out'
      });
    }, 60000);
  });
}