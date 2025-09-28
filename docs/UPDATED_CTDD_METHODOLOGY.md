# Updated CTDD Methodology: Tool-Assisted Development

## Overview: The Bootstrap Breakthrough

CTDD (Context Test-Driven Development) has evolved from a manual methodology to a **tool-assisted development workflow** that reduces manual overhead by **98%+**. This document captures the breakthrough insights from successfully using CTDD methodology to build CTDD tooling.

## Core Principle: The Circular Bootstrap

**The tool helps build the tool.** CTDD tooling was developed using CTDD methodology, creating a self-improving cycle where each phase accelerated the next phase.

### Proven Bootstrap Pattern:
1. **Phase 0**: Emergency manual overhead reduction (immediate pain relief)
2. **Phase 1**: Enhanced automation using Phase 0 tools
3. **Phase 2**: Advanced features using Phase 0+1 tools
4. **Result**: Tool immediately helps its own development

## Tool-Assisted CTDD Workflow

### Before vs After Tool Assistance

**Manual CTDD (Before)**: 40+ minutes per development cycle
- AT validation: 15 minutes of manual checking
- Session state updates: 15-20 minutes of manual JSON editing
- Todo management: 10 minutes of manual recreation
- Contract synchronization: Manual cross-referencing

**Tool-Assisted CTDD (After)**: <1 minute per development cycle
- AT validation: `ctdd check-at --all` (30 seconds)
- Session state updates: `ctdd update-session --complete AT##` (5 seconds)
- Todo management: `ctdd todo-sync --save/--load` (10 seconds)
- Contract synchronization: `ctdd phase-status` (10 seconds)

**Result: 98% manual overhead reduction**

## Enhanced CTDD Structure

### 1. Focus Card (FC-ID)
- **Goal**: One clear sentence of what to achieve
- **Deliverables**: Specific files/features to create
- **Constraints**: Must-follow limitations
- **Non-goals**: What NOT to do (prevents scope creep)

**Tool Support**: `ctdd init --full` creates complete project structure with Focus Card template

### 2. Invariants (I1, I2, I3...)
- Non-negotiable conditions that must always hold
- Checked before AND after any changes
- Focus on backward compatibility, performance, user experience

**Tool Support**: `ctdd check-at --all` validates invariants automatically

### 3. CUTs (Context Unit Tests) - AT1, AT2, AT3...
- ID'd tests with verifiable evidence
- Prefer high-impact UX features over technical complexity
- Each must be testable and provide clear PASS/FAIL with evidence

**Tool Support**:
- `ctdd check-at --all` validates all ATs with evidence collection
- `ctdd check-at AT16` validates specific acceptance criteria
- `ctdd update-session --complete AT##` marks ATs as complete

### 4. Automated Session State Management
- **Single source of truth**: `.ctdd/session-state.json`
- **Automatic updates**: Tool manages state instead of manual editing
- **Context preservation**: Archive system for token efficiency
- **Cross-instance handoff**: Standardized resumption protocol

**Tool Support**:
- `ctdd update-session --complete AT##` for progress updates
- `ctdd compress-context` for token efficiency
- `ctdd todo-sync` for todo persistence

## Proven Development Patterns

### High-Impact Pattern Hierarchy (Validated)
1. **High-impact UX features > technical complexity** (Phase 4 validation)
2. **Simple solutions > perfect solutions** (Context preservation success)
3. **Working solution today > perfect solution someday** (Bootstrap success)
4. **Real commands only** (No theoretical features)
5. **Emergency phases for immediate pain relief** (Phase 0 pattern)

### Progressive Enhancement Strategy
- Start with immediate pain relief (Emergency Phase 0)
- Build features that help build better features
- Each phase uses tools from previous phases
- Validate self-use principle (tool helps build tool)

### Bootstrap Self-Validation
- Tool must immediately help its own development
- Manual overhead reduction measurable from day 1
- Development velocity increases with each phase
- Tool-assisted workflow more efficient than manual

## Project Initialization Solution

### The Circular Dependency Problem Solved
**Problem**: Starting new projects requires connecting:
- Global CTDD methodology
- Local project setup
- Tool automation
- Context preservation
- Session state management

**Solution**: Enhanced `ctdd init --full`

The tool itself handles the complexity of setting up the complete CTDD environment, creating a self-bootstrapping system.

### For updating ~/.claude/CLAUDE.md or system instructions:

  1. Focus Card - Define upfront scope:
    - FC-ID: Unique identifier (e.g., "FC-001")
    - Goal: One clear sentence of what to achieve
    - Deliverables: Specific files/features to create
    - Constraints: Must-follow limitations
    - Non-goals: What NOT to do (prevents scope creep)

  2. Invariants - Non-negotiable conditions:
    - I1, I2, I3...: ID'd rules that must always hold
    - Check these before AND after any changes
    - Focus on backward compatibility, performance, and user experience
    - Example: "I1: All CLI commands work exactly as before"

  3. CUTs (Context Unit Tests) - Acceptance criteria:
    - AT1, AT2, AT3...: ID'd tests with verifiable evidence
    - Prefer high-impact UX features over technical complexity
    - Each must be testable and provide clear PASS/FAIL with evidence
    - Example: "AT16: ctdd diff <delta.json> shows before/after comparison"

  4. Session State Management (CRITICAL for context preservation):
    - ALWAYS update `.ctdd/session-state.json` when significant work completes
    - Include: current phase, completed acceptance criteria, file changes,
      critical insights, next actions, resumption instructions
    - This becomes the single source of truth for resumption
    - Avoid duplicate documentation files to save context tokens

  5. Workflow with Tools Integration:
    - Use TodoWrite proactively for progress tracking and user visibility
    - Pre-Check: State which invariants hold and which CUTs you're targeting
    - Implementation: Reference IDs, update todos as you progress, collect evidence
    - Post-Check: Report PASS/FAIL with specific evidence for each CUT
    - Documentation Update: Update session-state.json with insights and progress

  6. Context Efficiency Principles:
    - Optimize for token usage - avoid duplicate documentation
    - Prioritize single source of truth patterns (session-state.json)
    - Include verification commands in session state for resumption
    - Focus on practical, high-impact features over complex engineering

  7. Commit ID: Version checkpoint (e.g., "CTDD:FC-001@v1") for mental checkpoints

  8. Evidence Standards:
    - PASS: Provide concrete evidence (test output, file content, command results)
    - FAIL: Include error details and next steps for resolution
    - Performance: Include timing, coverage, and regression checks

  Core insight: CTDD succeeds when it enables seamless project resumption
  while maintaining quality and avoiding context loss. Prioritize user experience
  improvements over technical complexity - this pattern consistently delivers value.

  Example workflow:
  User: "Implement user authentication using CTDD"
  Claude: "Let me establish our CTDD contract:

  Focus Card (FC-AUTH-001):
  - Goal: Implement secure user authentication system
  - Deliverables: [auth.ts, auth.test.ts, login.html]
  - Constraints: [JWT tokens, bcrypt hashing, rate limiting]
  - Non-goals: [OAuth integration, password reset]

  Invariants:
  - I1: All passwords must be hashed
  - I2: Sessions expire in 24 hours
  - I3: Rate limit: 5 attempts per minute

  CUTs:
  - AT1: User can login with valid credentials
  - AT2: Invalid credentials return 401
  - AT3: Rate limiting blocks excessive attempts

  Commit: CTDD:FC-AUTH-001@v1

  [Implementation with TodoWrite progress tracking...]

  Post-Check:
  ✅ AT1: PASS - login endpoint returns JWT token (evidence: test output)
  ✅ AT2: PASS - returns 401 for invalid creds (evidence: curl test)
  ✅ AT3: PASS - rate limiting active (evidence: 6th attempt blocked)

  [Updates session-state.json with completion status and insights]"
```

## Key Changes from Original:

1. **Context preservation emphasized as primary purpose**
2. **Session state management as critical requirement**
3. **TodoWrite integration specified**
4. **High-impact UX principle explicitly stated**
5. **Token efficiency and single source of truth**
6. **Evidence standards defined**
7. **More comprehensive example showing full workflow**
8. **Resumption-focused mindset throughout**

This refined methodology captures the practical lessons learned from implementing CTDD across multiple phases and focuses on what actually makes it successful in practice.