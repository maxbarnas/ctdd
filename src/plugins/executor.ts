// src/plugins/executor.ts
// Extracted from src/plugin.ts - Phase 3A (Extract)

import { readFile as fsReadFile } from "fs/promises";
import * as path from "path";
import fg from "fast-glob";
import { JSONPath } from "jsonpath-plus";
import { loadSpec, exists as fsExists, Spec } from "../core.js";
import { PluginTimeoutError, withErrorContext } from "../errors.js";
import { PluginDef, PluginResult } from "./types.js";
import { loadPlugins } from "./loader.js";

// Individual plugin runners
async function runGrep(root: string, spec: Spec, def: PluginDef & { kind: "grep" }): Promise<PluginResult> {
  const base = { id: def.report_as || def.id, plugin_id: def.id };
  const filePath = path.resolve(root, def.file);

  // Check file existence
  if (!(await fsExists(filePath))) {
    if (def.must_exist) {
      return {
        ...base,
        title: def.title || `grep ${def.pattern} in ${def.file}`,
        status: "FAIL",
        evidence: `File not found: ${def.file}`
      };
    } else {
      return {
        ...base,
        title: def.title || `grep ${def.pattern} in ${def.file}`,
        status: "PASS",
        evidence: `File not found but must_exist=false: ${def.file}`
      };
    }
  }

  try {
    const content = await fsReadFile(filePath, "utf-8");
    const flags = def.flags || "";
    const regex = new RegExp(def.pattern, flags);
    const match = regex.test(content);

    return {
      ...base,
      title: def.title || `grep ${def.pattern} in ${def.file}`,
      status: match ? "PASS" : "FAIL",
      evidence: match ? `Pattern found in ${def.file}` : `Pattern not found in ${def.file}`
    };
  } catch (error) {
    return {
      ...base,
      title: def.title || `grep ${def.pattern} in ${def.file}`,
      status: "FAIL",
      evidence: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function runFileExists(root: string, spec: Spec, def: PluginDef & { kind: "file_exists" }): Promise<PluginResult> {
  const base = { id: def.report_as || def.id, plugin_id: def.id };
  const filePath = path.resolve(root, def.file);
  const exists = await fsExists(filePath);
  const shouldExist = def.should_exist ?? true;

  return {
    ...base,
    title: def.title || `file ${shouldExist ? 'exists' : 'does not exist'}: ${def.file}`,
    status: exists === shouldExist ? "PASS" : "FAIL",
    evidence: exists
      ? `File exists: ${def.file}`
      : `File does not exist: ${def.file}`
  };
}

async function runJsonPath(root: string, spec: Spec, def: PluginDef & { kind: "jsonpath" }): Promise<PluginResult> {
  const base = { id: def.report_as || def.id, plugin_id: def.id };
  const filePath = path.resolve(root, def.file);

  try {
    const content = await fsReadFile(filePath, "utf-8");
    const json = JSON.parse(content);
    const results = JSONPath({ path: def.path, json });

    if (def.equals !== undefined) {
      // Check if any result deep-equals the expected value
      const found = results.some((result: any) =>
        JSON.stringify(result) === JSON.stringify(def.equals)
      );
      return {
        ...base,
        title: def.title || `jsonpath ${def.path} equals expected in ${def.file}`,
        status: found ? "PASS" : "FAIL",
        evidence: found
          ? `Expected value found at ${def.path}`
          : `Expected value not found at ${def.path}. Found: ${JSON.stringify(results)}`
      };
    } else {
      // Check existence
      const exists = results.length > 0;
      const shouldExist = def.exists ?? true;
      return {
        ...base,
        title: def.title || `jsonpath ${def.path} in ${def.file}`,
        status: exists === shouldExist ? "PASS" : "FAIL",
        evidence: exists
          ? `Path exists with ${results.length} result(s)`
          : `Path does not exist`
      };
    }
  } catch (error) {
    return {
      ...base,
      title: def.title || `jsonpath ${def.path} in ${def.file}`,
      status: "FAIL",
      evidence: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function runMultiGrep(root: string, spec: Spec, def: PluginDef & { kind: "multi_grep" }): Promise<PluginResult> {
  const base = { id: def.report_as || def.id, plugin_id: def.id };
  const results: boolean[] = [];
  const evidenceParts: string[] = [];

  for (const check of def.checks) {
    const filePath = path.resolve(root, check.file);
    const label = check.label || `${check.pattern} in ${check.file}`;

    if (!(await fsExists(filePath))) {
      if (check.must_exist) {
        results.push(false);
        evidenceParts.push(`${label}: File not found`);
      } else {
        results.push(true);
        evidenceParts.push(`${label}: File not found (OK)`);
      }
      continue;
    }

    try {
      const content = await fsReadFile(filePath, "utf-8");
      const flags = check.flags || "";
      const regex = new RegExp(check.pattern, flags);
      const match = regex.test(content);
      results.push(match);
      evidenceParts.push(`${label}: ${match ? "PASS" : "FAIL"}`);
    } catch (error) {
      results.push(false);
      evidenceParts.push(`${label}: Error reading file`);
    }
  }

  const mode = def.mode || "all";
  const overall = mode === "all" ? results.every(r => r) : results.some(r => r);

  return {
    ...base,
    title: def.title || `multi_grep (${mode})`,
    status: overall ? "PASS" : "FAIL",
    evidence: evidenceParts.join(" | ")
  };
}

async function runGlob(root: string, spec: Spec, def: PluginDef & { kind: "glob" }): Promise<PluginResult> {
  const base = { id: def.report_as || def.id, plugin_id: def.id };

  try {
    const matches = await fg(def.pattern, {
      cwd: root,
      ignore: def.ignore,
      dot: def.dot
    });

    const count = matches.length;
    const min = def.min ?? 1;
    const max = def.max;

    const parts: string[] = [`Found ${count} file(s)`];
    let countOk = count >= min;
    if (max !== undefined) {
      countOk = countOk && count <= max;
      parts.push(`(expected ${min}-${max})`);
    } else {
      parts.push(`(expected ≥${min})`);
    }

    let grepOk = true;
    if (def.each_grep && matches.length > 0) {
      const grepResults: boolean[] = [];
      for (const match of matches) {
        const filePath = path.resolve(root, match);
        try {
          const content = await fsReadFile(filePath, "utf-8");
          const flags = def.each_grep.flags || "";
          const regex = new RegExp(def.each_grep.pattern, flags);
          const found = regex.test(content);
          grepResults.push(found);
        } catch {
          grepResults.push(!def.each_grep.must_exist);
        }
      }

      const eachMode = def.each_mode || "all";
      grepOk = eachMode === "all" ? grepResults.every(r => r) : grepResults.some(r => r);
      parts.push(`grep: ${grepOk ? "PASS" : "FAIL"}`);
    }

    const overall = countOk && grepOk;

    return {
      ...base,
      title: def.title || `glob ${def.pattern}`,
      status: overall ? "PASS" : "FAIL",
      evidence: parts.join(" | ").slice(0, 400)
    };
  } catch (error) {
    return {
      ...base,
      title: def.title || `glob ${def.pattern}`,
      status: "FAIL",
      evidence: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Timeout wrapper for plugin execution
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new PluginTimeoutError(operationName, timeoutMs));
    }, timeoutMs);

    operation()
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function runPlugins(root: string, timeoutMs: number = 30000): Promise<PluginResult[]> {
  return withErrorContext('runPlugins', async () => {
    const spec = await loadSpec(root);
    const defs = await loadPlugins(root);
    const results: PluginResult[] = [];

    // Execute plugins with timeout
    for (const def of defs) {
      try {
        let result: PluginResult;

        if (def.kind === "grep") {
          result = await withTimeout(() => runGrep(root, spec, def), timeoutMs, def.id);
        } else if (def.kind === "file_exists") {
          result = await withTimeout(() => runFileExists(root, spec, def), timeoutMs, def.id);
        } else if (def.kind === "jsonpath") {
          result = await withTimeout(() => runJsonPath(root, spec, def), timeoutMs, def.id);
        } else if (def.kind === "multi_grep") {
          result = await withTimeout(() => runMultiGrep(root, spec, def), timeoutMs, def.id);
        } else if (def.kind === "glob") {
          result = await withTimeout(() => runGlob(root, spec, def), timeoutMs, def.id);
        } else {
          // Type-safe exhaustive check
          const never: never = def;
          throw new Error(`Unknown plugin kind: ${(never as any).kind}`);
        }

        results.push(result);
      } catch (error) {
        const anyDef = def as any;
        console.error(`Plugin ${anyDef.id} failed:`, error);
        results.push({
          id: anyDef.report_as || anyDef.id,
          plugin_id: anyDef.id,
          title: anyDef.title || `Plugin ${anyDef.id}`,
          status: "FAIL",
          evidence: error instanceof Error ? error.message : String(error)
        });
      }
    }
    return results;
  });
}

// Convert plugin results into Post-Test-style checks
export function checksToPostChecks(results: PluginResult[]) {
  return results.map((r) => ({
    id: r.id,
    status: r.status as "PASS" | "FAIL",
    evidence: r.evidence ?? r.title
  }));
}