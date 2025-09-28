# CTDD Sidecar

Context Test-Driven Development (CTDD) is a lightweight method for guiding
LLM-based coding agents using compact, ID'ed context and cheap self-tests.
Instead of sending full history, you resend a small "spec" (Focus Card,
Invariants, CUTs), have the agent self-test before and after each step, and
enforce integrity via a `commit_id`.

This repo provides:
- A CLI (`ctdd`)
- A tiny HTTP server (`ctdd serve`)
- Plugin hooks for cheap static checks (grep-like and file-exists) merged into
  Post-Test results

## Why CTDD

- Keeps the agent focused despite context loss or condensation
- Auditable drift control via commit IDs and deltas
- Cheap validation using static checks and natural-language acceptance tests
  (CUTs)
- Tiny per-iteration token overhead

---

## Installation

```bash
npm install
npm run build
```

Node.js 18+ is required.

---

## Quick Start

Initialize CTDD in your project (creates `.ctdd/spec.json` and state files):

```bash
npx ctdd init
```

Show current status:

```bash
npx ctdd status
```

Generate a compact Pre Self-Test prompt for your agent:

```bash
npx ctdd pre > .ctdd/pre_prompt.txt
```

After your agent returns a Pre Self-Test JSON (you save it as
`.ctdd/pre_response.json`), validate and record:

```bash
npx ctdd validate-pre .ctdd/pre_response.json
npx ctdd record-pre .ctdd/pre_response.json
```

Generate a Post-Test prompt (optionally include an artifact summary):

```bash
echo "Produced cli.ts and README.md" > .ctdd/artifact.txt
npx ctdd post --artifact .ctdd/artifact.txt > .ctdd/post_prompt.txt
```

Validate, optionally merge plugin checks, and record the Post-Test response:

```bash
# Save agent post-response JSON as .ctdd/post_response.json
npx ctdd validate-post .ctdd/post_response.json
npx ctdd record-post .ctdd/post_response.json --with-checks
```

Apply a delta to invariants/CUTs (bump commit):

```bash
npx ctdd delta delta.json
```

---

## What CTDD Stores

Everything lives under `.ctdd/`:

- `spec.json` — your Focus Card, Invariants, and CUTs
- `state.json` — last pre/post responses and history pointer
- `logs/` — timestamped event JSON logs
- `plugins/` — optional plugin JSON files for static checks

---

## Spec Structure

The spec is compact and ID'ed. `ctdd init` creates a sample you can edit.

```json
{
  "focus_card": {
    "focus_card_id": "FC-001",
    "title": "Refactor CSV-to-JSON CLI",
    "goal": "Create a robust CLI to convert CSV to JSON with schema validation.",
    "deliverables": ["cli.ts", "README.md", "schema.json"],
    "constraints": ["Node 18+", "No network calls", "Pure TypeScript"],
    "non_goals": ["Web UI", "Database integration"],
    "sources_of_truth": ["schema.json", "README examples"],
    "token_budget": 2000
  },
  "invariants": [
    { "id": "I1", "text": "CLI must run on Node 18+." },
    { "id": "I2", "text": "No network calls allowed." },
    {
      "id": "I3",
      "text": "Input via file path or stdin; output to stdout by default."
    },
    {
      "id": "I4",
      "text": "Validation must use schema.json; fail with nonzero exit."
    },
    { "id": "I5", "text": "TypeScript only; no external transpilers." },
    { "id": "I6", "text": "README examples must be runnable as shown." }
  ],
  "cuts": [
    {
      "id": "AT1",
      "text": "Given sample.csv, running `node cli.js sample.csv` emits valid JSON to stdout."
    },
    {
      "id": "AT2",
      "text": "Invalid rows trigger exit code != 0 and print a single-line error."
    },
    {
      "id": "AT3",
      "text": "`cat sample.csv | node cli.js` produces the same output as AT1."
    },
    {
      "id": "AT4",
      "text": "README quickstart command exactly matches the implemented CLI flags."
    }
  ]
}
```

`commit_id` is computed as a short hash of this spec core:
`CTDD:<focus_card_id>@<hash7>`. If the agent’s response echoes a different
commit, you should fail-fast and reconcile.

---

## CLI Reference

- `ctdd init`  
  Initialize `.ctdd/spec.json` with a sample spec and set state.

- `ctdd status`  
  Print commit, title, goal, and last pre/post results.

- `ctdd hash`  
  Print the current `commit_id`.

- `ctdd pre [--out <file>]`  
  Emit the Pre Self-Test prompt. Agent should return Pre JSON only.

- `ctdd post [--artifact <file>] [--out <file>]`  
  Emit the Post-Test prompt (optional artifact summary lines).

- `ctdd validate-pre <file>`  
  Validate agent Pre JSON against schema.

- `ctdd validate-post <file>`  
  Validate agent Post JSON against schema.

- `ctdd record-pre <file>`  
  Record agent Pre JSON (appends to logs, updates state).

- `ctdd record-post <file> [--with-checks]`  
  Record agent Post JSON. With `--with-checks`, runs plugins and merges results
  into `post_check`.

- `ctdd delta <delta.json>`  
  Apply a delta to invariants/CUTs and bump `commit_id`.

- `ctdd checks [--json]`  
  Run plugin checks under `.ctdd/plugins/`.

---

## HTTP Server

Start:

```bash
npx ctdd serve --port 4848
```

Endpoints:
- `GET /health` → `{ ok: true }`
- `POST /init` → `{ ok: true, commit_id }` (same as `ctdd init`)
- `GET /status` → `{ ok: true, commit_id, spec, state }`
- `GET /pre-prompt` → text/plain prompt
- `POST /post-prompt` body: `{ "artifact": "..." }` → text/plain prompt
- `POST /pre-response` body: Pre JSON → `{ ok: true, commit_id }`
- `POST /post-response` body: Post JSON → `{ ok: true, commit_id, plugin_checks }`
- `GET /checks` → `{ ok: true, checks: [...] }`
- `POST /delta` body: delta JSON → `{ ok: true, commit_id }`

All JSON bodies must match schemas below and echo the current `commit_id`.

---

## Agent Protocol

Pre Self-Test prompt asks the agent to return:

```json
{
  "commit_id": "CTDD:FC-001@abcdef1",
  "self_check": [{ "id": "I1", "status": "PASS" }],
  "target_cuts": ["AT1", "AT3"],
  "plan_step": "Implement CLI arg parsing and stdin handling.",
  "risks": ["Schema validation may require a library."],
  "questions": ["May I use Ajv as a dev dependency?"]
}
```

Post-Test prompt asks the agent to return:

```json
{
  "commit_id": "CTDD:FC-001@abcdef1",
  "post_check": [
    { "id": "AT1", "status": "PASS", "evidence": "Manual run OK" },
    {
      "id": "AT2",
      "status": "FAIL",
      "evidence": "Exit code 0 on invalid input"
    }
  ],
  "deltas": [
    {
      "type": "modify",
      "target": "README.md",
      "reason": "Align flags in quickstart"
    }
  ],
  "next": "Wire schema.json validation and nonzero exit on invalid rows."
}
```

Commit discipline:
- The agent must echo the exact `commit_id` from your prompt.
- If mismatched: stop, regenerate prompts from your current spec, or apply a
  delta then continue.

---

## Plugins: Cheap Static Checks

Plugins live in `.ctdd/plugins/` as JSON files. They run quickly and produce
PASS/FAIL signals that can be merged into `post_check`.

Supported kinds:
- `grep` — regex test against a file’s content
- `file_exists` — existence check for a given file

Run them:

```bash
# Human-readable
npx ctdd checks

# JSON output
npx ctdd checks --json
```

When using:
- CLI: `ctdd record-post ... --with-checks` merges results into `post_check`
- Server: `/post-response` automatically merges plugin results

### Plugin Schemas

`grep`:

```json
{
  "id": "unique-id",
  "title": "Optional title",
  "kind": "grep",
  "file": "path/relative/to/repo.ext",
  "pattern": "your-regex-here",
  "flags": "i",
  "must_exist": true,
  "report_as": "AT4",
  "relatedCuts": ["AT4"],
  "relatedInvariants": ["I6"]
}
```

Notes:
- `pattern` is a JavaScript RegExp string. Escape backslashes in JSON, e.g.
  `"fetch\\("`.
- `must_exist: true` means PASS when the pattern is found; false means PASS when
  it is not found.

`file_exists`:

```json
{
  "id": "schema-file-exists",
  "title": "schema.json is present",
  "kind": "file_exists",
  "file": "schema.json",
  "should_exist": true,
  "report_as": "AT1:static",
  "relatedCuts": ["AT1"]
}
```

### Sample Plugins

`.ctdd/plugins/grep-readme-flags.json`:

```json
{
  "id": "grep-readme-flags",
  "title": "README documents CLI flags",
  "kind": "grep",
  "file": "README.md",
  "pattern": "--out",
  "flags": "i",
  "must_exist": true,
  "report_as": "AT4",
  "relatedCuts": ["AT4"],
  "relatedInvariants": ["I6"]
}
```

`.ctdd/plugins/no-network-calls.json`:

```json
{
  "id": "no-network-calls",
  "title": "No network calls in CLI source",
  "kind": "grep",
  "file": "cli.ts",
  "pattern": "fetch\\(|axios\\.|http\\.|https\\.",
  "flags": "i",
  "must_exist": false,
  "report_as": "I2:static",
  "relatedInvariants": ["I2"]
}
```

`.ctdd/plugins/schema-file-exists.json`:

```json
{
  "id": "schema-file-exists",
  "title": "schema.json is present",
  "kind": "file_exists",
  "file": "schema.json",
  "should_exist": true,
  "report_as": "AT1:static",
  "relatedCuts": ["AT1"]
}
```

---

## Deltas

Use deltas to evolve invariants and CUTs while maintaining integrity. Applying a
delta bumps the `commit_id`.

`delta.json` example:

```json
{
  "type": "modify",
  "target": "I3",
  "from": "Input via file path or stdin; output to stdout by default.",
  "to": "Input via file path or stdin; output to stdout or file via --out.",
  "reason": "Users need file output.",
  "impacted_tests": ["AT1", "AT3"],
  "new_tests": [
    {
      "id": "AT5",
      "text": "`--out out.json` writes to file. Without --out, stdout remains default."
    }
  ]
}
```

Apply:

```bash
npx ctdd delta delta.json
```

This supports:
- `modify` an invariant or CUT by ID (`target`)
- `remove` an invariant or CUT by ID
- `add` new CUTs via `new_tests`

---

## Prompts Produced By CTDD

Pre Self-Test prompt outlines:
- Commit
- Goal, Deliverables, Constraints, Non-goals
- Invariants and CUTs (IDs and text)
- Required JSON shape for the agent’s Pre response

Post-Test prompt outlines:
- Commit
- Invariant and CUT IDs under review
- Optional artifact summary you pass in
- Required JSON shape for the Post response

Both prompts are designed to be short and stable per step.

---

## Minimal Orchestrator Example (Node)

```ts
import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
const exec = promisify(execFile);

async function run() {
  // 1) Pre prompt
  const { stdout: prePrompt } = await exec("npx", ["ctdd", "pre"]);
  // Send prePrompt to your LLM, capture JSON-only response
  // await writeFile(".ctdd/pre_response.json", preResp);

  // 2) Record pre
  // await exec("npx", ["ctdd", "validate-pre", ".ctdd/pre_response.json"]);
  // await exec("npx", ["ctdd", "record-pre", ".ctdd/pre_response.json"]);

  // 3) Agent acts in your pipeline...

  // 4) Post prompt with artifact summary
  await writeFile(".ctdd/artifact.txt", "Updated cli.ts; README flags added.");
  const { stdout: postPrompt } = await exec("npx", [
    "ctdd",
    "post",
    "--artifact",
    ".ctdd/artifact.txt"
  ]);
  // Send postPrompt to LLM, capture JSON-only response
  // await writeFile(".ctdd/post_response.json", postResp);

  // 5) Record post with plugin checks
  // await exec("npx", ["ctdd", "validate-post", ".ctdd/post_response.json"]);
  // await exec(
  //   "npx",
  //   ["ctdd", "record-post", ".ctdd/post_response.json", "--with-checks"]
  // );
}

run().catch(console.error);
```

---

## Troubleshooting

- Commit mismatch error  
  Regenerate prompts (`ctdd pre` / `ctdd post`) or apply your delta first.

- Validation failure on agent JSON  
  Ensure the agent returns JSON only, with required fields and IDs.

- Invalid plugin regex  
  Double-escape backslashes in JSON patterns, e.g. `"fetch\\("`.

- Server 400s  
  Check request bodies match schemas and that `.ctdd/spec.json` exists.

---

## Notes

- Keep the spec small and stable. Favor adding CUTs with short IDs over verbose
  histories.
- Use plugins for cheap, deterministic checks (grep, file_exists). Keep them
  O(filesize) per loop.
- The agent should cite targeted invariant/CUT IDs in responses to reinforce
  focus.

Happy shipping!
