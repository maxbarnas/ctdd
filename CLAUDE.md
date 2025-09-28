# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build and Development
```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Format code with Prettier
npm run format
```

### CTDD CLI Commands
```bash
# Initialize CTDD in a project (creates .ctdd/spec.json and state)
npx ctdd init

# Show current status and commit ID
npx ctdd status

# Generate Pre Self-Test prompt for agent
npx ctdd pre > .ctdd/pre_prompt.txt

# Generate Post-Test prompt with optional artifact
npx ctdd post --artifact .ctdd/artifact.txt > .ctdd/post_prompt.txt

# Validate and record agent responses
npx ctdd validate-pre .ctdd/pre_response.json
npx ctdd record-pre .ctdd/pre_response.json
npx ctdd validate-post .ctdd/post_response.json
npx ctdd record-post .ctdd/post_response.json --with-checks

# Run plugin checks
npx ctdd checks
npx ctdd checks --json

# Apply delta to spec
npx ctdd delta delta.json

# Generate agent briefing documents
npx ctdd brief --out AGENT_BRIEF.md
npx ctdd brief-json --out AGENT_BRIEF.json
```

### HTTP Server
```bash
# Start HTTP server (default port 4848)
npx ctdd serve --port 4848

# Or using npm script
npm run serve
```

## Architecture

### Core System Design
CTDD (Context Test-Driven Development) is a lightweight framework for guiding LLM agents through iterative development using compact, ID-referenced specifications and validation checks.

### Key Components

1. **Spec System** (`src/core.ts`):
   - Focus Card: Project identity with goals, deliverables, constraints
   - Invariants: Boolean conditions that must always hold
   - CUTs (Context Unit Tests): Acceptance criteria with unique IDs
   - Commit ID: SHA256-based hash ensuring spec integrity

2. **Plugin System** (`src/plugin.ts`):
   - Extensible validation framework
   - Plugin types: grep, file_exists, jsonpath, multi_grep, glob
   - JSON-based configuration in `.ctdd/plugins/`
   - Results automatically merged into post-test validation

3. **CLI Interface** (`src/index.ts`):
   - Commander-based command structure
   - File-based I/O operations
   - Synchronous validation workflow

4. **HTTP Server** (`src/server.js`):
   - RESTful API for agent integration
   - Built-in web UI at `/ui`
   - Automatic plugin execution on post-response

### Data Flow
1. Spec files define project requirements
2. Commit ID computed from spec content
3. Agent receives prompts with commit ID
4. Agent responses validated against schemas
5. Plugin checks run for additional validation
6. State and logs maintained for audit trail

### Key Data Structures
- **Spec**: Focus Card + Invariants + CUTs
- **Pre-Response**: Self-check, target CUTs, plan step, risks, questions
- **Post-Response**: Post-checks with evidence, deltas, next steps
- **State**: Last pre/post responses + history log

### Important Files
- `.ctdd/spec.json`: Project specification
- `.ctdd/state.json`: Current state and history pointer
- `.ctdd/logs/`: Timestamped event logs
- `.ctdd/plugins/`: Plugin JSON configurations

## Development Notes

- TypeScript strict mode is enabled
- ES2022 target with NodeNext module system
- Node.js 18+ required
- All async operations use promises/async-await
- Zod schemas validate all JSON structures at runtime
- File paths in plugins are relative to project root
- Commit IDs follow format: `CTDD:<focus_card_id>@<hash7>`
- Error handling uses structured E001-E999 error codes with actionable messages
- Comprehensive test suite with 76 tests (100% coverage on error handling)

## Context Preservation & Resumption

**If context gets condensed/cleared during CTDD work:**

1. **Read resumption files first:**
   - `.ctdd/session-state.json` - SINGLE SOURCE OF TRUTH for progress, instructions, and implementation state
   - `CTDD_IMPLEMENTATION_CONTRACT.md` - Full project context

2. **Verify current state using commands from session-state.json:**
   ```bash
   # Commands are listed in session-state.json under "verification_commands"
   npm test                    # Should show 76/76 tests passing
   npm run test:coverage       # Check coverage status
   npm run build              # Should complete in ~2 seconds
   node dist/index.js --help      # Enhanced help with workflows
   node dist/index.js validate    # Project validation command
   node dist/index.js status -v   # Verbose status with health
   ```

3. **Current status (as of 2024-09-28 15:15):**
   - ✅ Phase 1 & 2 COMPLETED (Testing + Error Handling)
   - ✅ Phase 4 COMPLETED (High-Impact Developer UX) - ALL AT16-AT20 delivered
   - ⏭️ Phase 3 DEPRIORITIZED (Plugin complexity)
   - 🤔 Phase 5 NEXT CONSIDERATION (Type Safety vs more UX features)

4. **Key insight:** **High-impact UX improvements have massive value** - Phase 4 validated this approach

**CRITICAL: Always check `.ctdd/session-state.json` for the most recent progress before starting new work.**

**IMPORTANT: When significant work is completed, you MUST update:**
- `.ctdd/session-state.json` - SINGLE SOURCE OF TRUTH with detailed progress, insights, completion status, and resumption instructions