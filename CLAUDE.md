# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CTDD Unified Methodology (CRITICAL - READ FIRST)

**CTDD (Context Test-Driven Development) Purpose**: Preserve context and progress across Claude sessions while accelerating development through bootstrap methodology.

### Core Principles (Synthesized from Bootstrap Success + Original CTDD)

1. **Context Preservation** (CRITICAL):
   - **Session State Management**: `.ctdd/session-state.json` is single source of truth
   - **Token Efficiency**: Avoid duplicate documentation, optimize for resumption
   - **Evidence Standards**: Concrete proof required for PASS/FAIL with verification commands
   - **Resumption Test**: Success = seamless project continuation across context windows

2. **Bootstrap Acceleration**:
   - **"Tool Helps Build Tool"**: Every feature should accelerate building the next feature
   - **Phase 0 Emergency Relief**: Immediate 50%+ overhead reduction in hours, not days
   - **Progressive Enhancement**: Each phase uses tools from previous phases
   - **Measurable Time Savings**: Manual vs tool-assisted approach comparison

3. **Value-First Development**:
   - **High-impact, low-effort** features first
   - **Working solution today > perfect solution someday**
   - **Evidence-based validation**: Tools must prove their own value
   - **User experience over technical complexity**

4. **CTDD Contract Structure**:
   - **Focus Card**: FC-ID, Goal, Deliverables, Constraints, Non-goals
   - **Invariants**: I1-IX emphasizing velocity increase and backward compatibility
   - **CUTs**: AT1-ATX with testable evidence and verification commands
   - **Session State Updates**: Document progress, insights, and resumption instructions

### CTDD Unified Workflow

1. **Pre-Check** (Before Implementation):
   - State which invariants currently hold (I1: ✅/❌)
   - Identify target CUTs for this session (AT1, AT3)
   - Update TodoWrite with planned actions
   - Verify session-state.json reflects current status

2. **Implementation** (Tool-Assisted Development):
   - Reference AT/I IDs in all changes
   - Use Phase 0 tools to accelerate Phase 1+ work
   - Collect concrete evidence for each CUT
   - Update todos as work progresses

3. **Post-Check** (After Implementation):
   - Report PASS/FAIL with specific evidence for each targeted CUT
   - Include verification commands (npm test, ctdd validate, etc.)
   - Update session-state.json with progress and insights
   - Document resumption instructions and next actions

4. **Post-Phase Insight Harvesting** (CRITICAL for Methodology Evolution):
   - **Pause and Reflect**: "Think deeply whether there are any new insights after this phase"
   - **Extract Methodology Learnings**: What worked? What failed? What patterns emerged?
   - **Update Living Documentation**: Add insights to CLAUDE.md and templates immediately
   - **Identify Anti-Patterns**: Document what NOT to do for future phases/projects
   - **Meta-Learning Loop**: Use CTDD to improve CTDD itself
   - **Bootstrap Self-Validation**: Did our tools help us validate our own progress?
   - **Compound Methodology Gains**: How will these insights accelerate future work?

5. **Session State Management** (CRITICAL for Context Preservation):
   ```json
   {
     "current_phase": "Phase 1: Tool-Assisted Splitting",
     "completed_acceptance_criteria": ["AT001", "AT002", "AT003", "AT004"],
     "file_changes": ["src/index.ts - added 4 Phase 0 commands"],
     "critical_insights": ["Bootstrap methodology works - 99% time reduction achieved"],
     "next_actions": ["Implement ctdd split-file using Phase 0 tools"],
     "verification_commands": ["npm test", "ctdd analyze-sloc", "ctdd suggest-splits"],
     "resumption_context": "Phase 0 complete, tools ready for Phase 1 implementation"
   }
   ```

### Contract Structure Template

```markdown
## Focus Card (FC-FEATURE-001)
- **FC-ID**: FC-FEATURE-001 (versioned for resumption tracking)
- **Goal**: [Tool-assisted approach with measurable efficiency gains]
- **Deliverables**: [Tools first, then features using tools]
- **Constraints**: [Each phase must accelerate next + preserve backward compatibility]
- **Non-goals**: [Manual work, complex automation before quick wins]

## Invariants (Always Check Before/After)
- **I1**: Development velocity must increase with each phase (measured)
- **I2**: All existing functionality preserved (76/76 tests passing)
- **I3**: Manual overhead must decrease by 80%+ (timed evidence)
- **I4**: Bootstrap principle: tools help build tools (demonstrable)
- **I5**: Context preservation: seamless resumption across sessions

## Phase 0: Emergency Quick Wins (Hours, not days)
[Build tools that deliver immediate value and accelerate next phases]

## CUTs (Context Unit Tests) with Evidence
- **AT001**: [Specific, testable criteria with verification command]
- **AT002**: [Include expected time savings: manual vs tool-assisted]

## Success Metrics & Evidence
- Manual approach: X hours → Tool-assisted: Y hours (Z% reduction)
- Verification commands: [npm test, custom validation commands]
- Resumption test: Can new Claude instance continue work seamlessly?
```

### Proven Patterns (From Successful CTDD Contracts)

1. **Context Preservation Crisis → Solution**:
   - Problem: 252 lines of context (4x over budget)
   - Solution: Simple archival + one-command compression
   - Result: 75% token reduction in 2 hours
   - Lesson: Simple solutions win

2. **Tool-Assisted Development Bootstrap**:
   - Phase 0: Basic AT validation (15 min → 30 sec)
   - Phase 1: Enhanced validation using Phase 0 tools
   - Phase 2: Session automation using Phase 1 tools
   - Result: 98% manual overhead reduction
   - Lesson: Tool helps build tool

3. **File Splitting (Updated with Bootstrap)**:
   - Phase 0: SLOC analysis tools (30 min → 5 sec)
   - Phase 1: Auto-splitting using Phase 0 analysis
   - Phase 2: Self-improving splits using Phase 1 patterns
   - Result: 15 hours → 5.5 hours (63% reduction)
   - Lesson: Automation accelerates itself

4. **"Complete the Loop" Principle (Phase 1 Discovery)**:
   - Problem: Built extraction tools but original file unchanged (1595 lines)
   - Insight: Tool-assisted work has Extract + Integrate phases
   - Solution: Use own tools to validate original problem solved
   - Result: Bootstrap methodology improved through self-application
   - Lesson: Build tools to solve problems, not just to build tools

5. **"Post-Phase Insight Harvesting" (Meta-Methodology Discovery)**:
   - Problem: Missing compound learning opportunities between phases
   - Insight: Pausing to extract methodology insights is itself a core CTDD practice
   - Solution: Formalize post-phase reflection and living documentation updates
   - Result: CTDD methodology evolves and accelerates through real project application
   - Lesson: Use CTDD to improve CTDD itself (meta-learning loop)

### Anti-Patterns to Avoid

1. ❌ **Waterfall approach**: Sequential phases without feedback loops
2. ❌ **Technical purity over value**: SLOC limits without efficiency gains
3. ❌ **Deferred benefits**: All value at the end vs progressive delivery
4. ❌ **External validation only**: Not building self-checking mechanisms
5. ❌ **Complex automation first**: Over-engineering before quick wins
6. ❌ **Incomplete loops**: Building tools without completing the original problem
   - Example: Extract code but don't integrate/reduce original file
   - Solution: "Complete the Loop" - use your tools to solve your actual problem
7. ❌ **Methodology neglect**: Treating development methodology as fixed/static
   - Example: Missing compound learning opportunities between phases
   - Solution: "Post-Phase Insight Harvesting" - evolve methodology through real application

### When Creating CTDD Contracts

**DO**:
- ✅ Start with Phase 0 emergency relief
- ✅ Measure time saved, not just technical metrics
- ✅ Build tools that validate themselves
- ✅ Create progressive enhancement where each phase accelerates
- ✅ Focus on 80%+ manual overhead reduction

**DON'T**:
- ❌ Create linear refactoring plans without tools
- ❌ Focus only on code quality metrics
- ❌ Defer all value to project completion
- ❌ Build features that don't help build other features
- ❌ Skip the bootstrap validation step

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

# Project-agnostic validation commands
npx ctdd check-at --all               # Validate all acceptance criteria from spec.json
npx ctdd check-at AT1                 # Validate specific acceptance criteria
npx ctdd phase-status                 # Show project progress and health

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
- `.ctdd/session-state.json`: Current state and history (auto-managed)
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

## Project-Specific Customization

### Custom Validation Scripts

The CTDD tool supports project-specific validation for acceptance criteria:

1. **Create validation directory**: `.ctdd/validation/`
2. **Add validation scripts**: Named after your acceptance criteria (e.g., `at16.js` for AT16)
3. **Export validation function**:

```javascript
export async function validate() {
  try {
    // Your custom validation logic
    const result = await yourProjectSpecificTest();

    return {
      passed: true,  // or false
      message: "AT16: Your acceptance criteria description and result",
      evidence: "Concrete evidence like command output, file content, etc."
    };
  } catch (error) {
    return {
      passed: false,
      message: "AT16: Test failed",
      evidence: `Error: ${error.message}`
    };
  }
}

export default validate;
```

### Custom Phase Tracking

Create `.ctdd/phases.json` to define project-specific phases:

```json
[
  {
    "name": "Phase 1: Setup",
    "description": "Initial project configuration",
    "completed": true
  },
  {
    "name": "Phase 2: Core Features",
    "description": "Implement main functionality",
    "completed": false
  }
]
```

### Commands Work With Any Project

The tool automatically reads from your project's `.ctdd/spec.json`:

- `ctdd check-at --all` - Validates all CUTs from your spec
- `ctdd check-at AT1` - Validates specific acceptance criteria from your project
- `ctdd phase-status` - Shows your project's information and progress
- `ctdd validate` - Validates your project setup

## Tool-Assisted CTDD Development Workflow (BREAKTHROUGH!)

**MAJOR SUCCESS**: Tool development now uses tool assistance - 98% manual overhead reduction achieved!

### Quick Start Commands (Use These Instead of Manual Work!)

```bash
# System health check (30 seconds vs 15 minutes manual)
ctdd check-at --all

# Project progress dashboard
ctdd phase-status

# Update session state (5 seconds vs 15 minutes manual)
ctdd update-session --complete AT##

# Todo synchronization
ctdd todo-sync --save    # Persist current todos
ctdd todo-sync --load    # Restore todos
ctdd todo-sync --status  # Check todo-AT sync

# Context compression when needed
ctdd compress-context

# Enhanced project initialization
ctdd init --full         # Complete CTDD setup for new projects
```

### Proven Bootstrap Patterns (From Tool Development Success)

- **High-impact UX features > technical complexity** (Phase 4 validation)
- **Simple solutions > perfect solutions** (Context preservation success)
- **Tool helps build tool** (Bootstrap principle - PROVEN!)
- **Emergency phases for immediate pain relief** (Phase 0 pattern)
- **Real commands only** (No theoretical features)
- **Progressive enhancement** (Each phase uses tools from previous phases)

### Manual Overhead Reduction Results

**Before CTDD tools**: 40+ minutes per development cycle
- AT validation: 15 minutes manual checking
- Session updates: 15-20 minutes manual JSON editing
- Todo management: 10 minutes manual recreation

**After CTDD tools**: <1 minute per development cycle (98% reduction!)
- AT validation: `ctdd check-at --all` (2.4 seconds - 94% faster!)
- Deep validation: `ctdd check-at --all --deep` (45 seconds - when comprehensive testing needed)
- Session updates: `ctdd update-session --complete AT##` (5 seconds)
- Todo sync: `ctdd todo-sync --save/--load` (10 seconds)

### CTDD Contract Management

**Automatic Contract Archival**: When completing CTDD contracts (Focus Cards), move completed contracts to `contracts/archive/` to maintain clean project organization:

```bash
# After completing all acceptance criteria for a contract:
mv contracts/COMPLETED_CONTRACT.md contracts/archive/

# Or create archive directory if it doesn't exist:
mkdir -p contracts/archive
mv contracts/COMPLETED_CONTRACT.md contracts/archive/
```

**Contract Organization**:
- **Active contracts**: Keep in `contracts/` (work in progress)
- **Completed contracts**: Move to `contracts/archive/` (historical reference)
- **Benefits**: Clean workspace, clear progress tracking, easy historical reference

**Integration with CTDD Workflow**:
- Complete all CUTs (acceptance criteria) in contract
- Verify with `ctdd check-at --all`
- Run tests to ensure no regressions
- Archive contract to signal completion
- Commit changes with contract completion message

### Context Preservation & Resumption

**If context gets condensed/cleared during CTDD work:**

1. **Read resumption files first:**
   - `.ctdd/session-state.json` - SINGLE SOURCE OF TRUTH for progress (now auto-managed!)
   - `contracts/CTDD_IMPLEMENTATION_CONTRACT.md` - Full project context

2. **Verify current state using tool commands:**
   ```bash
   # Use these automated commands instead of manual checking:
   ctdd check-at --all         # Lightning-fast AT validation (2.4s vs 15min)
   ctdd check-at --all --deep  # Comprehensive validation when needed (45s)
   ctdd phase-status          # Project progress dashboard
   ctdd todo-sync --status    # Todo synchronization status
   npm test                   # Should show 76/76 tests passing
   npm run build             # Should complete in ~2 seconds
   ```

3. **Current status (POST-BOOTSTRAP SUCCESS):**
   - ✅ Phase 1 & 2 COMPLETED (Testing + Error Handling)
   - ✅ Phase 4 COMPLETED (High-Impact Developer UX) - ALL AT16-AT20 delivered
   - ✅ Phase 5 COMPLETED (Type Safety & Validation) - ALL AT21-AT25 delivered
   - ✅ Bootstrap Phase 0-2 COMPLETED (Tool-Assisted Development) - ALL AT30-AT38 delivered
   - 🎯 **Tool successfully builds itself using CTDD methodology**

4. **Key breakthrough insight:** **Tool-assisted development reduces overhead by 98%** - Bootstrap validated this approach

**CRITICAL: Use `ctdd` commands instead of manual work. Session state now auto-managed.**

**IMPORTANT: When significant work is completed:**
- Use `ctdd update-session --complete AT##` instead of manual editing
- Use `ctdd todo-sync --save` to persist todo state
- Use `ctdd check-at --all` to validate progress