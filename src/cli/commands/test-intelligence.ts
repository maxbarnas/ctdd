// src/cli/commands/test-intelligence.ts
// Phase 2: Evidence-Based Testing Intelligence Tools

import { Command } from "commander";
import { readFile, readdir, stat } from "fs/promises";
import { join, extname } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface CodeMetrics {
  file: string;
  lines: number;
  functions: number;
  complexity: number;
  errorHandling: number;
  testCoverage: number;
  riskScore: number;
}

interface RiskAssessment {
  totalFiles: number;
  highRiskFiles: CodeMetrics[];
  mediumRiskFiles: CodeMetrics[];
  lowRiskFiles: CodeMetrics[];
  recommendations: string[];
  summary: {
    avgComplexity: number;
    totalErrorHandling: number;
    testCoverageGaps: number;
    priorityAreas: string[];
  };
}

interface CommandBehavior {
  command: string;
  subcommand?: string;
  successOutput: string[];
  errorOutput: string[];
  executionTime: number;
  returnCode: number;
}

async function analyzeFileComplexity(filePath: string): Promise<CodeMetrics> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Basic complexity analysis
    const functions = (content.match(/(?:function|async function|=>\s*{|\w+\s*\([^)]*\)\s*{)/g) || []).length;
    const ifStatements = (content.match(/\bif\s*\(/g) || []).length;
    const loops = (content.match(/\b(for|while|do)\s*\(/g) || []).length;
    const switches = (content.match(/\bswitch\s*\(/g) || []).length;
    const tryCatch = (content.match(/\b(try|catch)\s*{/g) || []).length;
    const errorHandling = (content.match(/throw\s+new\s+\w*Error|\.catch\(|catch\s*\(/g) || []).length;

    // Nesting depth approximation
    const nestingDepth = Math.max(...lines.map(line => {
      const leading = line.match(/^[\s\t]*/)?.[0] || '';
      return leading.length;
    }));

    // Complexity score (simplified cyclomatic complexity)
    const complexity = 1 + ifStatements + loops + switches + (nestingDepth / 4);

    // Risk scoring
    let riskScore = 0;
    riskScore += lines.length > 500 ? (lines.length / 100) : 0; // Size factor
    riskScore += complexity > 20 ? complexity * 2 : complexity; // Complexity factor
    riskScore += errorHandling < (functions * 0.3) ? 20 : 0; // Poor error handling
    riskScore += tryCatch < (functions * 0.2) ? 15 : -5; // Lack of try-catch

    return {
      file: filePath,
      lines: lines.length,
      functions,
      complexity,
      errorHandling: errorHandling + tryCatch,
      testCoverage: 0, // To be populated by test coverage analysis
      riskScore
    };
  } catch (error) {
    return {
      file: filePath,
      lines: 0,
      functions: 0,
      complexity: 0,
      errorHandling: 0,
      testCoverage: 0,
      riskScore: 100 // High risk for unreadable files
    };
  }
}

async function findTypeScriptFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function traverse(currentDir: string) {
    try {
      const items = await readdir(currentDir);

      for (const item of items) {
        const fullPath = join(currentDir, item);
        const stats = await stat(fullPath);

        if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          await traverse(fullPath);
        } else if (stats.isFile() && extname(item) === '.ts') {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  await traverse(dir);
  return files;
}

async function analyzeTestCoverage(): Promise<Map<string, number>> {
  const coverage = new Map<string, number>();

  try {
    // Try to get test coverage data
    const { stdout } = await execAsync('npm run test:coverage --silent 2>/dev/null || echo "no-coverage"');

    if (stdout.includes('no-coverage')) {
      return coverage; // No coverage data available
    }

    // Parse coverage output (simplified)
    const lines = stdout.split('\n');
    for (const line of lines) {
      const match = line.match(/^(\S+)\s+(\d+(?:\.\d+)?)/);
      if (match) {
        coverage.set(match[1], parseFloat(match[2]));
      }
    }
  } catch (error) {
    // Coverage analysis failed, return empty map
  }

  return coverage;
}

async function assessProjectRisk(projectDir: string): Promise<RiskAssessment> {
  console.log('🔍 Analyzing project risk factors...');

  const sourceFiles = await findTypeScriptFiles(join(projectDir, 'src'));
  const testCoverage = await analyzeTestCoverage();

  const metrics: CodeMetrics[] = [];

  for (const file of sourceFiles) {
    const metric = await analyzeFileComplexity(file);
    const relativePath = file.replace(projectDir, '').replace(/\\/g, '/');
    metric.testCoverage = testCoverage.get(relativePath) || 0;
    metrics.push(metric);
  }

  // Categorize by risk
  const highRiskFiles = metrics.filter(m => m.riskScore > 50).sort((a, b) => b.riskScore - a.riskScore);
  const mediumRiskFiles = metrics.filter(m => m.riskScore > 20 && m.riskScore <= 50).sort((a, b) => b.riskScore - a.riskScore);
  const lowRiskFiles = metrics.filter(m => m.riskScore <= 20).sort((a, b) => b.riskScore - a.riskScore);

  // Generate recommendations
  const recommendations: string[] = [];

  if (highRiskFiles.length > 0) {
    recommendations.push(`Focus testing on ${highRiskFiles.length} high-risk files (score >50)`);
    recommendations.push(`Priority: ${highRiskFiles.slice(0, 3).map(f => f.file.split('/').pop()).join(', ')}`);
  }

  const lowErrorHandling = metrics.filter(m => m.errorHandling < m.functions * 0.3).length;
  if (lowErrorHandling > 0) {
    recommendations.push(`${lowErrorHandling} files have insufficient error handling`);
  }

  const lowTestCoverage = metrics.filter(m => m.testCoverage < 50).length;
  if (lowTestCoverage > 0) {
    recommendations.push(`${lowTestCoverage} files have low test coverage (<50%)`);
  }

  const avgComplexity = metrics.reduce((sum, m) => sum + m.complexity, 0) / metrics.length;
  const totalErrorHandling = metrics.reduce((sum, m) => sum + m.errorHandling, 0);
  const testCoverageGaps = metrics.filter(m => m.testCoverage < 70).length;

  return {
    totalFiles: metrics.length,
    highRiskFiles,
    mediumRiskFiles,
    lowRiskFiles,
    recommendations,
    summary: {
      avgComplexity: Math.round(avgComplexity * 10) / 10,
      totalErrorHandling,
      testCoverageGaps,
      priorityAreas: highRiskFiles.slice(0, 5).map(f => f.file.split('/').pop() || f.file)
    }
  };
}

async function analyzeCommandBehavior(projectDir: string): Promise<CommandBehavior[]> {
  console.log('🧪 Analyzing command behavior patterns...');

  const behaviors: CommandBehavior[] = [];
  const cliPath = join(projectDir, 'dist', 'index.js');

  // List of commands to analyze
  const commands = [
    'status',
    'pre',
    'post',
    'validate-pre',
    'validate-post',
    'checks',
    'session summary',
    'session analyze',
    'session resume'
  ];

  for (const cmd of commands) {
    try {
      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(`node "${cliPath}" ${cmd} --help`, { cwd: projectDir });
      const endTime = Date.now();

      behaviors.push({
        command: cmd,
        successOutput: stdout.split('\n').filter(line => line.length > 0),
        errorOutput: stderr.split('\n').filter(line => line.length > 0),
        executionTime: endTime - startTime,
        returnCode: 0
      });
    } catch (error: any) {
      behaviors.push({
        command: cmd,
        successOutput: [],
        errorOutput: [error.message || 'Unknown error'],
        executionTime: 0,
        returnCode: error.code || 1
      });
    }
  }

  return behaviors;
}

export function setupTestIntelligenceCommands(program: Command) {
  const testIntel = program
    .command("test-intel")
    .description("Evidence-based testing intelligence and risk assessment tools");

  // AT007: Risk Assessment Tool
  testIntel
    .command("risk-assess")
    .description("Analyze code complexity and identify testing priorities")
    .option("--json", "Output in JSON format")
    .option("--top <n>", "Show top N high-risk files", "10")
    .action(async (opts) => {
      try {
        const projectDir = process.cwd();
        const assessment = await assessProjectRisk(projectDir);

        if (opts.json) {
          console.log(JSON.stringify(assessment, null, 2));
          return;
        }

        console.log('\n🎯 EVIDENCE-BASED RISK ASSESSMENT');
        console.log('='.repeat(50));

        console.log(`\n📊 Project Overview:`);
        console.log(`  Total Files: ${assessment.totalFiles}`);
        console.log(`  High Risk: ${assessment.highRiskFiles.length} files`);
        console.log(`  Medium Risk: ${assessment.mediumRiskFiles.length} files`);
        console.log(`  Low Risk: ${assessment.lowRiskFiles.length} files`);

        console.log(`\n🔥 High-Risk Files (Top ${opts.top}):`);
        assessment.highRiskFiles.slice(0, parseInt(opts.top)).forEach((file, i) => {
          const name = file.file.split('/').pop();
          console.log(`  ${i + 1}. ${name} (Score: ${Math.round(file.riskScore)})`);
          console.log(`     Lines: ${file.lines}, Complexity: ${file.complexity}, Error Handling: ${file.errorHandling}`);
        });

        console.log(`\n📋 Testing Recommendations:`);
        assessment.recommendations.forEach((rec, i) => {
          console.log(`  ${i + 1}. ${rec}`);
        });

        console.log(`\n🎯 Priority Testing Areas:`);
        assessment.summary.priorityAreas.forEach(area => {
          console.log(`  • ${area}`);
        });

      } catch (error) {
        console.error(`Risk assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  // AT008: Command Behavior Analysis
  testIntel
    .command("behavior-analyze")
    .description("Analyze actual command behavior for test generation")
    .option("--json", "Output in JSON format")
    .action(async (opts) => {
      try {
        const projectDir = process.cwd();
        const behaviors = await analyzeCommandBehavior(projectDir);

        if (opts.json) {
          console.log(JSON.stringify(behaviors, null, 2));
          return;
        }

        console.log('\n🧪 COMMAND BEHAVIOR ANALYSIS');
        console.log('='.repeat(50));

        behaviors.forEach(behavior => {
          const status = behavior.returnCode === 0 ? '✅' : '❌';
          console.log(`\n${status} Command: ${behavior.command}`);
          console.log(`   Execution Time: ${behavior.executionTime}ms`);
          console.log(`   Output Lines: ${behavior.successOutput.length}`);
          if (behavior.errorOutput.length > 0) {
            console.log(`   Error Lines: ${behavior.errorOutput.length}`);
          }
        });

      } catch (error) {
        console.error(`Behavior analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  // AT009: Testing Gap Analysis
  testIntel
    .command("gap-analyze")
    .description("Compare risk assessment vs current test coverage")
    .option("--json", "Output in JSON format")
    .action(async (opts) => {
      try {
        const projectDir = process.cwd();
        const assessment = await assessProjectRisk(projectDir);

        // Find existing test files
        const testFiles = await findTypeScriptFiles(join(projectDir, 'tests'));
        const testFileCount = testFiles.length;

        const gaps = {
          highRiskUntested: assessment.highRiskFiles.filter(f => f.testCoverage < 70),
          mediumRiskUntested: assessment.mediumRiskFiles.filter(f => f.testCoverage < 50),
          testingPriorities: assessment.highRiskFiles.slice(0, 5),
          existingTests: testFileCount,
          recommendedTests: assessment.highRiskFiles.length + Math.floor(assessment.mediumRiskFiles.length / 2)
        };

        if (opts.json) {
          console.log(JSON.stringify(gaps, null, 2));
          return;
        }

        console.log('\n📊 TESTING GAP ANALYSIS');
        console.log('='.repeat(50));

        console.log(`\n🎯 Current Test Coverage:`);
        console.log(`  Existing Tests: ${gaps.existingTests} files`);
        console.log(`  High-Risk Untested: ${gaps.highRiskUntested.length} files`);
        console.log(`  Medium-Risk Untested: ${gaps.mediumRiskUntested.length} files`);

        console.log(`\n🚨 Priority Testing Gaps:`);
        gaps.testingPriorities.forEach((file, i) => {
          const name = file.file.split('/').pop();
          const coverage = file.testCoverage > 0 ? `${file.testCoverage}%` : 'No coverage';
          console.log(`  ${i + 1}. ${name} - ${coverage} (Risk: ${Math.round(file.riskScore)})`);
        });

        console.log(`\n📈 Recommendations:`);
        console.log(`  • Add ${gaps.recommendedTests - gaps.existingTests} targeted tests`);
        console.log(`  • Focus on ${gaps.highRiskUntested.length} high-risk files first`);
        console.log(`  • Use behavioral testing approach (output-agnostic)`);

      } catch (error) {
        console.error(`Gap analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });
}