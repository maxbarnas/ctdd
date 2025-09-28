# CTDD Agent Brief

You are working in a Context Test-Driven Development (CTDD) workflow. CTDD
keeps you focused using a compact spec (Focus Card, Invariants, CUTs) and
requires short self-tests before and after each step. A sidecar tool (`ctdd`)
and optional HTTP server provide prompts, state management, commit integrity,
and cheap static checks.

Follow this protocol exactly to avoid drift and rework.

---

## 1) What You Are Building

Project: CSV-to-JSON CLI (TypeScript)

Goal: Create a robust CLI to convert CSV to JSON with schema validation.

Deliverables:
- cli.ts
- README.md
- schema.json

Constraints:
- Node 18+
- No network calls at runtime
- Pure TypeScript (no external transpilers)

Non-goals:
- Web UI
- Database integration

Sources of truth:
- schema.json
- README examples

Token budget: Keep your responses compact and focused. Cite IDs rather than
repeating spec text.

---

## 2) Spec Snapshot (IDs you must reference)

Invariants (boolean, must hold):
- I1: CLI must run on Node 18+.
- I2: No network calls allowed.
- I3: Input via file path or stdin; output to stdout by default.
- I4: Validation must use schema.json; fail with nonzero exit.
- I5: TypeScript only; no external transpilers.
- I6: README examples must be runnable as shown.

Context Unit Tests (CUTs) / Acceptance tests:
- AT1: Given sample.csv, `node cli.js sample.csv` emits valid JSON to stdout.
- AT2: Invalid rows trigger exit code != 0 and print a single-line error.
- AT3: `cat sample.csv | node cli.js` produces the same output as AT1.
- AT4: README quickstart command exactly matches implemented CLI flags.

The authoritative spec is stored at .ctdd/spec.json. Always trust the file over
the snapshot above if they differ.

---

## 3) Commit Integrity

The sidecar computes a `commit_id` from the spec:
CTDD:<focus_card_id>@<hash7>.

Rules you must follow:
- Always echo back the exact `commit_id` from the current prompt.
- If the commit you see in your prompt differs from the last one you used,
  treat your previous state as invalid and align to the current `commit_id`.
- If you need to change any invariant or CUT, propose a small delta (see
  Section 8). Do not silently drift.

---

## 4) Your Operating Loop

Each iteration has three sub-steps.

A) Pre Self-Test (before you act)
- Input: A compact pre-prompt including commit_id, goal, invariants, and CUTs.
- Output: JSON ONLY (no commentary), shaped as:

```json
{
  "commit_id": "CTDD:FC-001@abcdef1",
  "self_check": [
    { "id": "I1", "status": "PASS" },
    { "id": "I2", "status": "PASS" }
  ],
  "target_cuts": ["AT1", "AT3"],
  "plan_step": "Implement CLI arg parsing and stdin handling.",
  "risks": ["Schema validation path might change error codes."],
  "questions": ["Is Ajv acceptable as a dependency?"]
}
```

Guidance:
- Keep `self_check` concise; PASS/FAIL with a short note only if FAIL.
- Choose a small `plan_step` that advances target CUTs without breaking
  invariants.
- Ask one or two crisp questions if needed.

B) Act (produce code or docs)
- Make the smallest change that moves one or two CUTs forward.
- Cite the invariant/CUT IDs you intend to satisfy in your own reasoning
  (you won’t send this citation unless specifically asked).

C) Post-Test (after you act)
- Input: A compact post-prompt (and possibly an artifact summary prepared by
  the orchestrator).
- Output: JSON ONLY (no commentary), shaped as:

```json
{
  "commit_id": "CTDD:FC-001@abcdef1",
  "post_check": [
    { "id": "AT1", "status": "PASS", "evidence": "Manual reasoning OK" },
    { "id": "AT2", "status": "FAIL", "evidence": "Nonzero exit not wired" }
  ],
  "deltas": [
    { "type": "modify", "target": "README.md", "reason": "Align flags" }
  ],
  "next": "Wire schema validation and return code for invalid rows."
}
```

Guidance:
- `post_check` only for the CUTs/IDs you can evaluate by reasoning or cheap
  checks. Use evidence 1–2 lines max.
- Propose deltas only if the spec needs to change. Otherwise leave it empty.
- Suggest the next smallest step.

---

## 5) Cheap Static Checks (Plugins)

The sidecar can run “plugins” that perform fast, deterministic checks and merge
results into `post_check`. Example plugins:
- grep README.md for expected flags (supports AT4).
- grep cli.ts to ensure there are no network calls (supports I2).
- check that schema.json exists (supports AT1).

You should anticipate how these checks will behave when you modify files.
Reference related IDs in your reasoning and ensure your code and README will
pass the static checks described below (common examples):

Examples that may run:
- AT4 via grep: README.md contains `--out` flag documentation if you add it.
- I2 via grep: cli.ts contains no `fetch(`, `axios.`, `http.`, `https.`.
- AT1:static via file_exists: schema.json is present.

---

## 6) How to Think About PASS/FAIL

- PASS a CUT only if the behavior is fully supported by your code changes and
  the README usage matches the actual CLI behavior.
- FAIL a CUT if anything is missing or ambiguous (prefer failing fast).
- Provide short evidence: reference the specific flag, exit code behavior, or a
  short reasoning line bound to the change you just made.
- If an invariant would be violated by a proposed change, stop and either pick a
  different plan or propose a delta to change the spec first.

---

## 7) Artifacts You May Produce

- Code: cli.ts (TypeScript), optionally supporting a `--out` flag if added via
  delta to I3 and new CUTs.
- Docs: README.md must accurately reflect commands in quickstart examples (I6,
  AT4).
- Schema: schema.json drives validation (I4). Explain expected fields at a high
  level in README.

Save diffs and code in normal files; the sidecar logs your JSON pre/post
responses and commit state.

---

## 8) Proposing Spec Changes (Deltas)

If the spec needs to evolve (e.g., adding a `--out` flag), propose a small,
explicit delta JSON in your Post-Test response’s `deltas` array.

Examples:
- Modify an invariant (change text only)
- Add new CUTs for new behavior
- Remove a CUT (rare; explain why)

Example delta:

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

Never make behavioral changes that contradict the spec without a delta.

---

## 9) Typical Step Plan Examples

- Step A:
  - plan_step: Implement CLI arg parsing for file path and stdin.
  - target_cuts: ["AT1", "AT3"]
  - risks: Stdin handling consistency.
  - next: Wire schema.json validation and nonzero exit.

- Step B:
  - plan_step: Integrate schema.json validation with clear error line; return
    nonzero exit on invalid rows.
  - target_cuts: ["AT2"]
  - risks: Performance trade-off; maintain stdout default.
  - next: Align README quickstart with flags; add examples.

- Step C:
  - plan_step: Sync README quickstart to implemented flags; ensure sample
    commands match actual CLI behavior.
  - target_cuts: ["AT4"]
  - next: Consider adding `--out` via delta if requested.

---

## 10) Definition of Done

- All invariants I1–I6 are satisfiable and not violated by your changes.
- CUTs AT1–AT4 are satisfied or clearly identified as FAIL with actionable next
  steps.
- README quickstart commands are exact and runnable as shown.
- No network calls exist in cli.ts (I2).
- The sidecar’s plugin checks would pass (grep/file_exists as applicable).
- Your Post-Test response includes concise evidence, and if spec changes were
  needed, you proposed clear deltas.

---

## 11) Common Pitfalls and How to Avoid Them

- Pitfall: Changing behavior without a delta. Fix: Propose a delta first.
- Pitfall: Declaring PASS without evidence. Fix: Include 1–2 lines referencing
  behavior or file content.
- Pitfall: Drifting commit IDs. Fix: Always echo the commit from the current
  prompt; if mismatch, stop and align.
- Pitfall: README mismatch (AT4). Fix: Update README exactly to the implemented
  flags and examples.
- Pitfall: Hidden network calls (I2). Fix: Avoid `fetch(`, `axios.`, `http.`,
  `https.` in cli.ts.

---

## 12) JSON Schemas (for reference)

Pre Self-Test response:

```json
{
  "commit_id": "string",
  "self_check": [
    { "id": "string", "status": "PASS|FAIL", "note": "optional" }
  ],
  "target_cuts": ["AT1"],
  "plan_step": "string",
  "risks": ["string"],
  "questions": ["string"]
}
```

Post-Test response:

```json
{
  "commit_id": "string",
  "post_check": [
    { "id": "AT1", "status": "PASS|FAIL|SKIP", "evidence": "optional" }
  ],
  "deltas": [
    { "type": "add|remove|modify", "target": "ID or file", "reason": "..." }
  ],
  "next": "string"
}
```

Delta object (typical):

```json
{
  "type": "add|remove|modify",
  "target": "I3 or AT1 or file",
  "from": "optional",
  "to": "string or object",
  "reason": "string",
  "impacted_tests": ["AT1"],
  "new_tests": [{ "id": "AT5", "text": "..." }]
}
```

---

## 13) How Testing Works Around You

The orchestrator uses the CTDD sidecar to:
- Generate your pre/post prompts with the current `commit_id`.
- Validate your JSON responses.
- Optionally run plugin checks and merge them into your `post_check`.
- Record all steps into .ctdd/logs for traceability.

You do not directly run commands. Instead, you must structure your outputs so
the sidecar can test your work cheaply and consistently.

---

## 14) When You Need Clarification

Use the `questions` array in the Pre Self-Test to ask 1–2 precise questions.
Examples:
- “May I add Ajv as a dependency (no network calls at runtime)?”
- “Should invalid rows cause the entire run to fail or only skip rows?”

Keep questions crisp and actionable.

---

## 15) Final Reminders

- Think small, ship small. Target at most 1–2 CUTs per step.
- Always cite IDs (I1..I6, AT1..ATn) in your plan and checks.
- Prefer FAIL with a clear next step over vague PASS.
- Propose deltas before changing behavior that contradicts the current spec.
- Keep evidence short and concrete.

You are judged on correctness (IDs satisfied), integrity (commit discipline),
and clarity (short, decisive JSON outputs).
