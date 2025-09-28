// src/plugins.ts
import {
  exists as fsExists,
  loadSpec,
  Spec,
  CTDD_DIR
} from "./core.js";
import {
  readFile as fsReadFile,
  readdir as fsReaddir,
  stat as fsStat
} from "fs/promises";
import * as path from "path";
import { z } from "zod";
import fg from "fast-glob";
import { JSONPath } from "jsonpath-plus";
import { CTDDError, ErrorCodes, PluginConfigError, PluginTimeoutError, withErrorContext } from "./errors.js";

const PluginDirName = "plugins";

const BasePluginSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  report_as: z.string().optional(),
  relatedCuts: z.array(z.string()).optional(),
  relatedInvariants: z.array(z.string()).optional()
});

const GrepSchema = BasePluginSchema.extend({
  kind: z.literal("grep"),
  file: z.string(),
  pattern: z.string(),
  flags: z.string().optional().default(""),
  must_exist: z.boolean().optional().default(true)
});

const FileExistsSchema = BasePluginSchema.extend({
  kind: z.literal("file_exists"),
  file: z.string(),
  should_exist: z.boolean().optional().default(true)
});

const JsonPathSchema = BasePluginSchema.extend({
  kind: z.literal("jsonpath"),
  file: z.string(),
  path: z.string(), // JSONPath expression
  // If equals is provided, we pass when any result deep-equals this value.
  equals: z.any().optional(),
  // If equals is NOT provided, we use exists (default true) to assert presence.
  exists: z.boolean().optional().default(true)
});

const MultiGrepItemSchema = z.object({
  file: z.string(),
  pattern: z.string(),
  flags: z.string().optional().default(""),
  must_exist: z.boolean().optional().default(true),
  label: z.string().optional()
});

const MultiGrepSchema = BasePluginSchema.extend({
  kind: z.literal("multi_grep"),
  checks: z.array(MultiGrepItemSchema).min(1),
  // mode=all => PASS if all checks pass; mode=any => PASS if any passes
  mode: z.enum(["all", "any"]).optional().default("all")
});

const GlobEachGrepSchema = z.object({
  pattern: z.string(),
  flags: z.string().optional().default(""),
  must_exist: z.boolean().optional().default(true)
});

const GlobSchema = BasePluginSchema.extend({
  kind: z.literal("glob"),
  pattern: z.string(),
  ignore: z.array(z.string()).optional().default([]),
  dot: z.boolean().optional().default(false),
  // Count constraints on matched files
  min: z.number().optional().default(1),
  max: z.number().optional(),
  // Optional grep to apply to matched files
  each_grep: GlobEachGrepSchema.optional(),
  // If each_grep present: 'all' means every file must pass; 'any' at least one
  each_mode: z.enum(["all", "any"]).optional().default("all")
});

const PluginSchema = z.discriminatedUnion("kind", [
  GrepSchema,
  FileExistsSchema,
  JsonPathSchema,
  MultiGrepSchema,
  GlobSchema
]);

export type PluginDef = z.infer<typeof PluginSchema>;

export type PluginResult = {
  id: string; // report_as || id
  plugin_id: string;
  title: string;
  status: "PASS" | "FAIL";
  evidence?: string;
  related_cuts?: string[];
  related_invariants?: string[];
};

async function listPluginFiles(root: string): Promise<string[]> {
  const dir = path.join(root, CTDD_DIR, PluginDirName);
  try {
    const st = await fsStat(dir);
    if (!st.isDirectory()) {
      console.warn(`[WARN] Plugin directory exists but is not a directory: ${dir}`);
      return [];
    }
  } catch (error: any) {
    // Expected when plugins directory doesn't exist
    if (error?.code !== 'ENOENT') {
      console.warn(`[WARN] Unexpected error accessing plugin directory ${dir}: ${error?.message}`);
    }
    return [];
  }

  try {
    const names = await fsReaddir(dir);
    return names
      .filter((n) => n.endsWith(".json"))
      .map((n) => path.join(dir, n));
  } catch (error: any) {
    throw new CTDDError(
      `Failed to read plugin directory: ${error?.message || 'Unknown error'}`,
      ErrorCodes.PLUGIN_LOAD_FAILED,
      { pluginDir: dir, originalError: error?.code },
      [
        'Check directory permissions',
        'Verify plugin directory is accessible',
        'Create plugins directory if missing'
      ]
    );
  }
}

export async function loadPlugins(root: string): Promise<PluginDef[]> {
  const files = await listPluginFiles(root);
  const out: PluginDef[] = [];
  const validationErrors: string[] = [];

  for (const f of files) {
    try {
      const raw = await fsReadFile(f, "utf-8");
      const json = JSON.parse(raw);
      const parsed = PluginSchema.safeParse(json);

      if (parsed.success) {
        out.push(parsed.data);
      } else {
        // Enhanced validation error with structured details
        const fileName = path.basename(f);
        const errorDetails = parsed.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
          expected: issue.code === 'invalid_union_discriminator' ? issue.options : undefined
        }));

        const errorMessage = `Invalid plugin ${fileName}: ${JSON.stringify(errorDetails, null, 2)}`;
        validationErrors.push(errorMessage);
        console.warn(errorMessage);
      }
    } catch (e) {
      const fileName = path.basename(f);
      const errorMessage = `Failed to load plugin ${fileName}: ${e instanceof Error ? e.message : 'Unknown error'}`;
      validationErrors.push(errorMessage);
      console.warn(errorMessage);
    }
  }

  // If there are validation errors, log them to error system
  if (validationErrors.length > 0) {
    const { logError } = await import('./core.js');
    await logError(
      root,
      new PluginConfigError(
        path.join(root, CTDD_DIR, PluginDirName),
        `Plugin validation failed for ${validationErrors.length} plugin(s): ${validationErrors.join('; ')}`
      ),
      'loadPlugins'
    );
  }

  return out;
}

function mkResultBase(def: any): Pick<
  PluginResult,
  "id" | "plugin_id" | "title" | "related_cuts" | "related_invariants"
> {
  return {
    id: def.report_as ?? def.id,
    plugin_id: def.id,
    title: def.title || "",
    related_cuts: def.relatedCuts,
    related_invariants: def.relatedInvariants
  };
}

function compileRegex(
  pattern: string,
  flags?: string
): { re: RegExp | null; err?: string } {
  try {
    const re = new RegExp(pattern, flags ?? "");
    return { re };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown regex error';
    return { re: null, err: `Invalid regex: /${pattern}/${flags ?? ""} - ${errorMsg}` };
  }
}

async function runGrep(
  root: string,
  _spec: Spec,
  def: z.infer<typeof GrepSchema>
): Promise<PluginResult> {
  const base = mkResultBase(def);
  const filePath = path.join(root, def.file);
  let content = "";
  try {
    content = await fsReadFile(filePath, "utf-8");
  } catch (error: any) {
    const status = def.must_exist ? "FAIL" : "PASS";
    const errorContext = error?.code === 'ENOENT' ? 'file not found' : `read error: ${error?.message}`;
    return {
      ...base,
      title:
        base.title ||
        `grep ${def.file} /${def.pattern}/${def.flags ?? ""}`,
      status,
      evidence: `${errorContext}: ${def.file}`
    };
  }
  const { re, err } = compileRegex(def.pattern, def.flags);
  if (!re) {
    return {
      ...base,
      title: base.title || "invalid regex",
      status: "FAIL",
      evidence: err
    };
  }
  const found = re.test(content);
  const pass = def.must_exist ? found : !found;
  const status = pass ? "PASS" : "FAIL";
  const expectation = def.must_exist ? "present" : "absent";
  return {
    ...base,
    title:
      base.title || `grep ${def.file} expects ${expectation}`,
    status,
    evidence: `/${def.pattern}/${def.flags ?? ""} in ${def.file} => ${found}`
  };
}

async function runFileExists(
  root: string,
  _spec: Spec,
  def: z.infer<typeof FileExistsSchema>
): Promise<PluginResult> {
  const base = mkResultBase(def);
  const filePath = path.join(root, def.file);
  const ok = await fsExists(filePath);
  const pass = def.should_exist ? ok : !ok;
  const status = pass ? "PASS" : "FAIL";
  const expectation = def.should_exist ? "exists" : "absent";
  return {
    ...base,
    title: base.title || `file ${def.file} ${expectation}`,
    status,
    evidence: `exists=${ok}`
  };
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (ka.length !== kb.length) return false;
    for (let i = 0; i < ka.length; i++) {
      if (ka[i] !== kb[i]) return false;
      if (!deepEqual(a[ka[i]], b[kb[i]])) return false;
    }
    return true;
  }
  return false;
}

async function runJsonPath(
  root: string,
  _spec: Spec,
  def: z.infer<typeof JsonPathSchema>
): Promise<PluginResult> {
  const base = mkResultBase(def);
  const filePath = path.join(root, def.file);
  let json: any;
  try {
    const raw = await fsReadFile(filePath, "utf-8");
    json = JSON.parse(raw);
  } catch (e: any) {
    return {
      ...base,
      title:
        base.title || `jsonpath ${def.file} ${def.path}`,
      status: "FAIL",
      evidence: `Unable to read/parse JSON: ${def.file}`
    };
  }

  let results: any[];
  try {
    results = JSONPath({ json, path: def.path }) as any[];
  } catch (e: any) {
    return {
      ...base,
      title:
        base.title || `jsonpath ${def.file} ${def.path}`,
      status: "FAIL",
      evidence: `Invalid JSONPath: ${def.path}`
    };
  }

  if (typeof def.equals !== "undefined") {
    const matched = results.some((r) => deepEqual(r, def.equals));
    return {
      ...base,
      title:
        base.title ||
        `jsonpath equals ${def.path} === ${JSON.stringify(def.equals)}`,
      status: matched ? "PASS" : "FAIL",
      evidence: `results=${JSON.stringify(results).slice(0, 200)}`
    };
  } else {
    const exists = results.length > 0;
    const pass = def.exists ? exists : !exists;
    return {
      ...base,
      title:
        base.title ||
        `jsonpath exists(${def.exists}) ${def.path}`,
      status: pass ? "PASS" : "FAIL",
      evidence: `count=${results.length}`
    };
  }
}

async function runMultiGrep(
  root: string,
  _spec: Spec,
  def: z.infer<typeof MultiGrepSchema>
): Promise<PluginResult> {
  const base = mkResultBase(def);

  type Sub = {
    label: string;
    status: "PASS" | "FAIL";
    evidence: string;
  };
  const subs: Sub[] = [];

  for (const item of def.checks) {
    const filePath = path.join(root, item.file);
    let content = "";
    let sub: Sub;
    try {
      content = await fsReadFile(filePath, "utf-8");
    } catch (error: any) {
      const ok = item.must_exist ? "FAIL" : "PASS";
      const errorMsg = error?.code === 'ENOENT' ? 'file not found' : `read error: ${error?.message}`;
      sub = {
        label: item.label ?? `${item.file} /${item.pattern}/`,
        status: ok as "PASS" | "FAIL",
        evidence: `${errorMsg}: ${item.file}`
      };
      subs.push(sub);
      continue;
    }
    const { re, err } = compileRegex(item.pattern, item.flags);
    if (!re) {
      sub = {
        label: item.label ?? `${item.file} /${item.pattern}/`,
        status: "FAIL",
        evidence: err ?? "Invalid regex"
      };
      subs.push(sub);
      continue;
    }
    const found = re.test(content);
    const pass = item.must_exist ? found : !found;
    sub = {
      label: item.label ?? `${item.file} /${item.pattern}/`,
      status: pass ? "PASS" : "FAIL",
      evidence: `/${item.pattern}/${item.flags ?? ""} => ${found}`
    };
    subs.push(sub);
  }

  const passes = subs.filter((s) => s.status === "PASS").length;
  const total = subs.length;
  const overall =
    def.mode === "all" ? passes === total : passes > 0;

  const failMsgs = subs
    .filter((s) => s.status === "FAIL")
    .map((s) => `${s.label}: ${s.evidence}`)
    .join(" | ")
    .slice(0, 400);

  return {
    ...base,
    title:
      base.title ||
      `multi_grep (${def.mode}) ${passes}/${total} passed`,
    status: overall ? "PASS" : "FAIL",
    evidence: failMsgs || `All ${total} checks passed`
  };
}

async function runGlob(
  root: string,
  _spec: Spec,
  def: z.infer<typeof GlobSchema>
): Promise<PluginResult> {
  const base = mkResultBase(def);
  const matches = await fg(def.pattern, {
    cwd: root,
    dot: def.dot,
    ignore: def.ignore
  });
  const count = matches.length;

  // Count constraints
  let countOk = true;
  if (typeof def.min === "number") countOk &&= count >= def.min;
  if (typeof def.max === "number") countOk &&= count <= def.max;

  let grepOk = true;
  let grepEvidence = "";
  if (def.each_grep && count > 0) {
    const subResults: Array<{ file: string; pass: boolean; found: boolean }> =
      [];
    const { pattern, flags, must_exist } = def.each_grep;
    const { re, err } = compileRegex(pattern, flags);
    if (!re) {
      return {
        ...base,
        title: base.title || `glob ${def.pattern}`,
        status: "FAIL",
        evidence:
          err ??
          `Invalid regex: /${pattern}/${flags ?? ""}`
      };
    }
    for (const rel of matches) {
      const filePath = path.join(root, rel);
      let content = "";
      try {
        content = await fsReadFile(filePath, "utf-8");
      } catch (error: any) {
        // If file vanished between glob and read, mark as fail.
        console.warn(`[WARN] File read failed for ${rel}: ${error?.message || 'Unknown error'}`);
        subResults.push({
          file: rel,
          pass: !must_exist, // reading failure counts as not found
          found: false
        });
        continue;
      }
      const found = re.test(content);
      const pass = must_exist ? found : !found;
      subResults.push({ file: rel, pass, found });
    }
    if (def.each_mode === "all") {
      grepOk = subResults.every((r) => r.pass);
    } else {
      grepOk = subResults.some((r) => r.pass);
    }
    const failures = subResults
      .filter((r) => !r.pass)
      .slice(0, 8)
      .map(
        (r) =>
          `${r.file}: /${pattern}/${flags ?? ""} => ${r.found}`
      )
      .join(" | ");
    grepEvidence =
      failures ||
      `/${pattern}/${flags ?? ""} passed on ${
        def.each_mode
      } mode`;
  }

  const overall = countOk && grepOk;
  const parts: string[] = [];
  parts.push(`count=${count}`);
  if (typeof def.min === "number") parts.push(`min=${def.min}`);
  if (typeof def.max === "number") parts.push(`max=${def.max}`);
  if (def.each_grep) parts.push(grepEvidence);

  return {
    ...base,
    title: base.title || `glob ${def.pattern}`,
    status: overall ? "PASS" : "FAIL",
    evidence: parts.join(" | ").slice(0, 400)
  };
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
          const anyDef = def as any;
          console.warn(`Unknown plugin kind: ${anyDef.kind}`);
          result = {
            id: anyDef.report_as || anyDef.id,
            plugin_id: anyDef.id,
            title: anyDef.title || `Plugin ${anyDef.id}`,
            status: "FAIL",
            evidence: `Unknown plugin kind: ${anyDef.kind}`
          };
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