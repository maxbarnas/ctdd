// src/core.ts
import { createHash } from "crypto";
import {
  readFile as fsReadFile,
  writeFile as fsWriteFile,
  mkdir as fsMkdir,
  stat as fsStat
} from "fs/promises";
import * as path from "path";
import { z } from "zod";

export const CTDD_DIR = ".ctdd";
export const SPEC_FILE = "spec.json";
export const STATE_FILE = "state.json";
export const LOG_DIR = "logs";

export type PassFail = "PASS" | "FAIL" | "SKIP";

export const FocusCardSchema = z.object({
  focus_card_id: z.string(),
  title: z.string(),
  goal: z.string(),
  deliverables: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  non_goals: z.array(z.string()).default([]),
  sources_of_truth: z.array(z.string()).default([]),
  token_budget: z.number().optional()
});

export const InvariantSchema = z.object({
  id: z.string(),
  text: z.string()
});

export const CutSchema = z.object({
  id: z.string(),
  text: z.string(),
  examples: z.array(z.string()).optional()
});

export const SpecSchema = z.object({
  focus_card: FocusCardSchema,
  invariants: z.array(InvariantSchema),
  cuts: z.array(CutSchema)
});

export type FocusCard = z.infer<typeof FocusCardSchema>;
export type Invariant = z.infer<typeof InvariantSchema>;
export type Cut = z.infer<typeof CutSchema>;
export type Spec = z.infer<typeof SpecSchema>;

export const PreResponseSchema = z.object({
  commit_id: z.string(),
  self_check: z
    .array(
      z.object({
        id: z.string(),
        status: z.enum(["PASS", "FAIL"]),
        note: z.string().optional()
      })
    )
    .default([]),
  target_cuts: z.array(z.string()).default([]),
  plan_step: z.string(),
  risks: z.array(z.string()).default([]),
  questions: z.array(z.string()).default([])
});

export const PostResponseSchema = z.object({
  commit_id: z.string(),
  post_check: z
    .array(
      z.object({
        id: z.string(),
        status: z.enum(["PASS", "FAIL", "SKIP"]),
        evidence: z.string().optional()
      })
    )
    .default([]),
  deltas: z
    .array(
      z.object({
        type: z.enum(["add", "remove", "modify"]),
        target: z.string(),
        reason: z.string().optional()
      })
    )
    .default([]),
  next: z.string().optional()
});

export type PreResponse = z.infer<typeof PreResponseSchema>;
export type PostResponse = z.infer<typeof PostResponseSchema>;

export type State = {
  commit_id: string;
  last_pre?: PreResponse;
  last_post?: PostResponse;
  history: Array<{
    t: string;
    type: "pre" | "post";
    data: unknown;
  }>;
};

export async function ensureProjectDirs(root: string) {
  const ctddPath = path.join(root, CTDD_DIR);
  const logPath = path.join(ctddPath, LOG_DIR);
  await fsMkdir(ctddPath, { recursive: true });
  await fsMkdir(logPath, { recursive: true });
}

export async function exists(p: string) {
  try {
    await fsStat(p);
    return true;
  } catch {
    return false;
  }
}

export function stableStringify(input: unknown): string {
  const seen = new WeakSet();
  function sort(obj: any): any {
    if (obj === null || typeof obj !== "object") return obj;
    if (seen.has(obj)) throw new Error("Cyclic reference");
    seen.add(obj);
    if (Array.isArray(obj)) return obj.map(sort);
    const keys = Object.keys(obj).sort();
    const out: Record<string, any> = {};
    for (const k of keys) out[k] = sort(obj[k]);
    return out;
  }
  return JSON.stringify(sort(input));
}

export function computeCommitId(spec: Spec): string {
  const core = {
    focus_card: spec.focus_card,
    invariants: spec.invariants,
    cuts: spec.cuts
  };
  const h = createHash("sha256")
    .update(stableStringify(core))
    .digest("hex")
    .slice(0, 7);
  return `CTDD:${spec.focus_card.focus_card_id}@${h}`;
}

export async function loadSpec(root: string): Promise<Spec> {
  const p = path.join(root, CTDD_DIR, SPEC_FILE);
  const raw = await fsReadFile(p, "utf-8");
  return SpecSchema.parse(JSON.parse(raw));
}

export async function saveSpec(root: string, spec: Spec) {
  const p = path.join(root, CTDD_DIR, SPEC_FILE);
  await fsWriteFile(p, JSON.stringify(spec, null, 2), "utf-8");
}

export async function loadState(root: string): Promise<State | null> {
  const p = path.join(root, CTDD_DIR, STATE_FILE);
  if (!(await exists(p))) return null;
  const raw = await fsReadFile(p, "utf-8");
  return JSON.parse(raw) as State;
}

export async function saveState(root: string, state: State) {
  const p = path.join(root, CTDD_DIR, STATE_FILE);
  await fsWriteFile(p, JSON.stringify(state, null, 2), "utf-8");
}

export function renderPrePrompt(spec: Spec, commitId: string): string {
  const fc = spec.focus_card;
  const invLines = spec.invariants
    .map((i) => `${i.id}: ${i.text}`)
    .join("\n");
  const cutLines = spec.cuts.map((c) => `${c.id}: ${c.text}`).join("\n");

  return [
    "You are resuming work. Use only this context:",
    `Commit: ${commitId}`,
    `Goal: ${fc.goal}`,
    `Deliverables: ${fc.deliverables.join(", ")}`,
    `Constraints: ${fc.constraints.join(", ")}`,
    `Non-goals: ${fc.non_goals.join(", ")}`,
    "Invariants:",
    invLines,
    "CUTs:",
    cutLines,
    "",
    "TASK: Before acting, run a self-check and propose your next small step.",
    "Return JSON with shape:",
    `{
  "commit_id": "${commitId}",
  "self_check": [{"id": "I1", "status": "PASS|FAIL", "note": ""}],
  "target_cuts": ["AT1","AT3"],
  "plan_step": "one short step you will take next",
  "risks": ["..."],
  "questions": ["..."]
}`
  ].join("\n");
}

export function renderPostPrompt(
  spec: Spec,
  commitId: string,
  artifactHint?: string
): string {
  const invIds = spec.invariants.map((i) => i.id).join(", ");
  const cutIds = spec.cuts.map((c) => c.id).join(", ");

  const artifactNote = artifactHint
    ? `Artifact summary:\n${artifactHint}\n`
    : "";

  return [
    `Commit: ${commitId}`,
    `Invariants under review: ${invIds}`,
    `CUTs under review: ${cutIds}`,
    artifactNote,
    "Given the output you just produced, re-evaluate only relevant CUTs and",
    "Invariants. Return:",
    `{
  "commit_id": "${commitId}",
  "post_check": [{"id": "AT1", "status": "PASS|FAIL|SKIP", "evidence": ""}],
  "deltas": [{"type": "modify","target": "README.md","reason": "align flags"}],
  "next": "next smallest step"
}`
  ].join("\n");
}

// Optional plugin info for inclusion in the agent brief without importing
// plugins.ts (avoids cycles).
export type PluginInfoForBrief = {
  id: string;
  kind: string;
  title?: string;
  report_as?: string;
  relatedCuts?: string[];
  relatedInvariants?: string[];
  file?: string;
  pattern?: string;
  flags?: string;
  must_exist?: boolean;
  should_exist?: boolean;
};

export function renderAgentBrief(
  spec: Spec,
  commitId: string,
  plugins?: PluginInfoForBrief[]
): string {
  const fc = spec.focus_card;
  const lines: string[] = [];
  const dl = (arr: string[]) => (arr.length ? arr : ["(none)"]);

  lines.push("# CTDD Agent Brief");
  lines.push("");
  lines.push(`Commit: ${commitId}`);
  lines.push("");
  lines.push(
    "You are working in a Context Test-Driven Development (CTDD) workflow."
  );
  lines.push(
    "CTDD keeps you aligned using a compact spec (Focus Card, Invariants,"
  );
  lines.push("CUTs) and requires short self-tests before and after each step.");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 1) What You Are Building");
  lines.push("");
  lines.push(`Project: ${fc.title}`);
  lines.push("");
  lines.push(`Goal: ${fc.goal}`);
  lines.push("");
  lines.push("Deliverables:");
  for (const d of dl(fc.deliverables)) lines.push(`- ${d}`);
  lines.push("");
  lines.push("Constraints:");
  for (const c of dl(fc.constraints)) lines.push(`- ${c}`);
  lines.push("");
  lines.push("Non-goals:");
  for (const n of dl(fc.non_goals)) lines.push(`- ${n}`);
  lines.push("");
  lines.push("Sources of truth:");
  for (const s of dl(fc.sources_of_truth)) lines.push(`- ${s}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 2) Spec Snapshot (IDs you must reference)");
  lines.push("");
  lines.push("Invariants (boolean, must hold):");
  for (const i of spec.invariants) lines.push(`- ${i.id}: ${i.text}`);
  lines.push("");
  lines.push("Context Unit Tests (CUTs) / Acceptance tests:");
  for (const c of spec.cuts) lines.push(`- ${c.id}: ${c.text}`);
  lines.push("");
  lines.push(
    "The authoritative spec is stored at .ctdd/spec.json. Always trust the"
  );
  lines.push("file over any snapshot if they differ.");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 3) Commit Integrity");
  lines.push("");
  lines.push(
    "The sidecar computes a commit_id as CTDD:<focus_card_id>@<hash7>."
  );
  lines.push("- Always echo back the exact commit_id provided in prompts.");
  lines.push(
    "- If it differs from your last, treat your previous state as invalid and"
  );
  lines.push("  align to the new commit.");
  lines.push(
    "- If you need to change any invariant or CUT, propose a small delta."
  );
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 4) Your Operating Loop");
  lines.push("");
  lines.push("A) Pre Self-Test (before you act)");
  lines.push("");
  lines.push("Return JSON only, for example:");
  lines.push("```json");
  lines.push("{");
  lines.push(`  "commit_id": "${commitId}",`);
  lines.push('  "self_check": [{ "id": "I1", "status": "PASS" }],');
  lines.push('  "target_cuts": ["AT1"],');
  lines.push('  "plan_step": "One small step you will take next.",');
  lines.push('  "risks": ["Short list"],');
  lines.push('  "questions": ["Optional, crisp"]');
  lines.push("}");
  lines.push("```");
  lines.push("");
  lines.push("B) Act (produce code/docs) — smallest change to advance CUTs.");
  lines.push("");
  lines.push("C) Post-Test (after you act)");
  lines.push("");
  lines.push("Return JSON only, for example:");
  lines.push("```json");
  lines.push("{");
  lines.push(`  "commit_id": "${commitId}",`);
  lines.push(
    '  "post_check": [{ "id": "AT1", "status": "PASS", "evidence": "1-2 lines" }],'
  );
  lines.push(
    '  "deltas": [{ "type": "modify", "target": "README.md", "reason": "Align flags" }],'
  );
  lines.push('  "next": "Next smallest step"');
  lines.push("}");
  lines.push("```");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 5) Cheap Static Checks (Plugins)");
  lines.push("");
  lines.push("The sidecar can run cheap plugin checks (e.g., grep, file_exists).");
  lines.push(
    "Their PASS/FAIL may be merged into post_check automatically by the"
  );
  lines.push("orchestrator.");
  if (plugins && plugins.length) {
    lines.push("");
    lines.push("Configured plugins (summary):");
    for (const p of plugins) {
      const relatesCuts = p.relatedCuts?.length
        ? ` cuts=${p.relatedCuts.join(",")}`
        : "";
      const relatesInv = p.relatedInvariants?.length
        ? ` inv=${p.relatedInvariants.join(",")}`
        : "";
      const mapped = p.report_as ? ` report_as=${p.report_as}` : "";
      const file = p.file ? ` file=${p.file}` : "";
      const patt = p.pattern ? ` pattern=/${p.pattern}/${p.flags ?? ""}` : "";
      const must =
        typeof p.must_exist === "boolean"
          ? ` must_exist=${p.must_exist}`
          : typeof p.should_exist === "boolean"
          ? ` should_exist=${p.should_exist}`
          : "";
      lines.push(
        `- ${p.id} [${p.kind}]${mapped}${relatesCuts}${relatesInv}${file}${patt}${must}`
      );
    }
  } else {
    lines.push("");
    lines.push("(No plugins were detected.)");
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 6) PASS/FAIL Guidance");
  lines.push("");
  lines.push("- PASS a CUT only when behavior is fully supported.");
  lines.push("- Prefer FAIL with a clear next step over vague PASS.");
  lines.push("- Keep evidence short (1–2 lines).");
  lines.push("- If an invariant would be violated, stop and propose a delta first.");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 7) Deltas (proposing spec changes)");
  lines.push("");
  lines.push("Example delta:");
  lines.push("```json");
  lines.push("{");
  lines.push('  "type": "modify",');
  lines.push('  "target": "I3",');
  lines.push('  "from": "Old text",');
  lines.push('  "to": "New text",');
  lines.push('  "reason": "Why change",');
  lines.push('  "impacted_tests": ["AT1"],');
  lines.push('  "new_tests": [{ "id": "AT5", "text": "..." }]');
  lines.push("}");
  lines.push("```");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 8) JSON Schemas (reference)");
  lines.push("");
  lines.push("Pre Self-Test:");
  lines.push("```json");
  lines.push('{ "commit_id": "string",');
  lines.push('  "self_check": [{ "id": "string", "status": "PASS|FAIL" }],');
  lines.push('  "target_cuts": ["AT1"],');
  lines.push('  "plan_step": "string",');
  lines.push('  "risks": ["string"],');
  lines.push('  "questions": ["string"] }');
  lines.push("```");
  lines.push("");
  lines.push("Post-Test:");
  lines.push("```json");
  lines.push('{ "commit_id": "string",');
  lines.push(
    '  "post_check": [{ "id": "AT1", "status": "PASS|FAIL|SKIP", "evidence": "optional" }],'
  );
  lines.push(
    '  "deltas": [{ "type": "add|remove|modify", "target": "ID or file" }],'
  );
  lines.push('  "next": "string" }');
  lines.push("```");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 9) Definition of Done (DoD)");
  lines.push("");
  lines.push("- Invariants are satisfiable and not violated.");
  lines.push("- CUTs are passed or clearly marked FAIL with next steps.");
  lines.push("- README usage matches actual behavior.");
  lines.push("- Cheap plugin checks would pass.");
  lines.push("");
  return lines.join("\n");
}

export type AgentBriefJson = {
  commit_id: string;
  focus_card: FocusCard;
  invariants: Invariant[];
  cuts: Cut[];
  plugins?: PluginInfoForBrief[];
  shapes: {
    pre_response_example: Record<string, unknown>;
    post_response_example: Record<string, unknown>;
  };
};

export function renderAgentBriefJson(
  spec: Spec,
  commitId: string,
  plugins?: PluginInfoForBrief[]
): AgentBriefJson {
  const preExample = {
    commit_id: commitId,
    self_check: [{ id: "I1", status: "PASS" }],
    target_cuts: ["AT1"],
    plan_step: "One small step you will take next.",
    risks: ["Short list"],
    questions: ["Optional, crisp"]
  };
  const postExample = {
    commit_id: commitId,
    post_check: [
      { id: "AT1", status: "PASS", evidence: "1-2 lines" },
      { id: "AT2", status: "FAIL", evidence: "What is missing" }
    ],
    deltas: [{ type: "modify", target: "README.md", reason: "Align flags" }],
    next: "Next smallest step"
  };
  return {
    commit_id: commitId,
    focus_card: spec.focus_card,
    invariants: spec.invariants,
    cuts: spec.cuts,
    plugins,
    shapes: {
      pre_response_example: preExample,
      post_response_example: postExample
    }
  };
}

export async function recordEvent(
  root: string,
  type: "pre" | "post",
  data: unknown
): Promise<State> {
  const spec = await loadSpec(root);
  const commitId = computeCommitId(spec);
  const prev = (await loadState(root)) ?? {
    commit_id: commitId,
    history: []
  };
  const now = new Date().toISOString();
  const state: State = {
    commit_id: commitId,
    last_pre: type === "pre" ? (data as PreResponse) : prev.last_pre,
    last_post: type === "post" ? (data as PostResponse) : prev.last_post,
    history: [...prev.history, { t: now, type, data }]
  };
  await saveState(root, state);
  const logPath = path.join(
    root,
    CTDD_DIR,
    LOG_DIR,
    `${now.replace(/[:.]/g, "-")}-${type}.json`
  );
  await fsWriteFile(logPath, JSON.stringify(data, null, 2), "utf-8");
  return state;
}

export type DeltaObject = {
  type: "add" | "remove" | "modify";
  target: string;
  from?: string;
  to?: any;
  reason?: string;
  impacted_tests?: string[];
  new_tests?: Array<{ id: string; text: string }>;
};

export async function applyDeltaObject(
  root: string,
  delta: DeltaObject
): Promise<{ newCommitId: string }> {
  const spec = await loadSpec(root);

  const invIndex = spec.invariants.findIndex((i) => i.id === delta.target);
  const cutIndex = spec.cuts.findIndex((c) => c.id === delta.target);

  if (delta.type === "modify") {
    if (invIndex >= 0) {
      if (typeof delta.to === "string") {
        spec.invariants[invIndex].text = delta.to;
      } else {
        throw new Error("Delta.to must be string when modifying invariant.");
      }
    } else if (cutIndex >= 0) {
      if (typeof delta.to === "string") {
        spec.cuts[cutIndex].text = delta.to;
      } else {
        throw new Error("Delta.to must be string when modifying CUT.");
      }
    } else {
      throw new Error(`Target not found: ${delta.target}`);
    }
  } else if (delta.type === "remove") {
    if (invIndex >= 0) {
      spec.invariants.splice(invIndex, 1);
    } else if (cutIndex >= 0) {
      spec.cuts.splice(cutIndex, 1);
    } else {
      throw new Error(`Target not found: ${delta.target}`);
    }
  } else if (delta.type === "add") {
    if (delta.new_tests?.length) {
      for (const t of delta.new_tests) {
        if (spec.cuts.find((c) => c.id === t.id)) {
          throw new Error(`CUT already exists: ${t.id}`);
        }
        spec.cuts.push({ id: t.id, text: t.text });
      }
    } else {
      throw new Error(
        "Add delta requires new_tests for this simplified sidecar."
      );
    }
  }

  await saveSpec(root, spec);
  const newCommitId = computeCommitId(spec);
  const state = (await loadState(root)) ?? {
    commit_id: newCommitId,
    history: []
  };
  state.commit_id = newCommitId;
  await saveState(root, state);
  return { newCommitId };
}

export async function initProject(root: string) {
  await ensureProjectDirs(root);
  const specPath = path.join(root, CTDD_DIR, SPEC_FILE);
  if (await exists(specPath)) {
    throw new Error("Spec already exists. Aborting init.");
  }
  const sample: Spec = {
    focus_card: {
      focus_card_id: "FC-001",
      title: "Refactor CSV-to-JSON CLI",
      goal: "Create a robust CLI to convert CSV to JSON with schema validation.",
      deliverables: ["cli.ts", "README.md", "schema.json"],
      constraints: ["Node 18+", "No network calls", "Pure TypeScript"],
      non_goals: ["Web UI", "Database integration"],
      sources_of_truth: ["schema.json", "README examples"],
      token_budget: 2000
    },
    invariants: [
      { id: "I1", text: "CLI must run on Node 18+." },
      { id: "I2", text: "No network calls allowed." },
      {
        id: "I3",
        text: "Input via file path or stdin; output to stdout by default."
      },
      {
        id: "I4",
        text: "Validation must use schema.json; fail with nonzero exit."
      },
      { id: "I5", text: "TypeScript only; no external transpilers." },
      { id: "I6", text: "README examples must be runnable as shown." }
    ],
    cuts: [
      {
        id: "AT1",
        text:
          "Given sample.csv, running `node cli.js sample.csv` emits valid JSON " +
          "to stdout."
      },
      {
        id: "AT2",
        text:
          "Invalid rows trigger exit code != 0 and print a single-line error."
      },
      {
        id: "AT3",
        text: "`cat sample.csv | node cli.js` produces the same output as AT1."
      },
      {
        id: "AT4",
        text:
          "README quickstart command exactly matches the implemented CLI flags."
      }
    ]
  };
  await saveSpec(root, sample);
  const commitId = computeCommitId(sample);
  const state: State = { commit_id: commitId, history: [] };
  await saveState(root, state);
  return { commitId };
}