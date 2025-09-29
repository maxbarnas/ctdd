# Session Automation & Context Optimization Contract
## FC-SESSION-001: Eliminate Manual Session State Management

**Date**: 2025-09-29
**Problem**: Agents waste massive context manually editing session-state.json instead of using CTDD tools
**Goal**: Achieve 95%+ reduction in context spent on bookkeeping through automated session management

---

## Focus Card (FC-SESSION-001)

- **FC-ID**: FC-SESSION-001
- **Goal**: Eliminate manual session state management through tool automation
- **Deliverables**:
  - Automated session state updates via CLI commands
  - Schema versioning and migration system
  - TodoWrite integration with CTDD state tracking
  - Compressed archival of completed work
  - Context-efficient resumption system
- **Constraints**:
  - Must preserve all existing functionality
  - Must handle legacy session-state.json gracefully
  - Must reduce bookkeeping context by 95%+
- **Non-goals**:
  - Complex state management frameworks
  - External database dependencies
  - Breaking changes to existing contracts

---

## The Problem (Evidence from Ultimate Challenge)

**Context Waste Analysis**:
```
Manual session-state.json updates: ~500-1000 tokens per update
Number of manual updates in Ultimate Challenge: 10+
Total context wasted: 5,000-10,000 tokens (!)
Available tools ignored: ctdd update-session, ctdd todo-sync
```

**This violates our own Bootstrap Principle**: We built tools but aren't using them!

---

## Invariants

- **I1**: Zero manual JSON editing required for session management
- **I2**: All session updates through CLI commands (< 10 seconds each)
- **I3**: Backward compatibility with existing session-state.json
- **I4**: Context usage reduced by 95%+ for bookkeeping tasks
- **I5**: TodoWrite state automatically synchronized with CTDD state

---

## Phase 0: Emergency Relief (2 hours)

### Acceptance Criteria

- **AT201**: Create ctdd session command group for all session operations
- **AT202**: Implement ctdd session update with smart AT detection
- **AT203**: Add ctdd session archive for completed work compression
- **AT204**: Create ctdd session summary for quick status overview

### Evidence Required
- Before: 500+ tokens to manually update session state
- After: Single command `ctdd session update AT109` (< 20 tokens)
- Reduction: 96%+ context savings

---

## Phase 1: TodoWrite Integration (2 hours)

### Acceptance Criteria

- **AT205**: Automatic TodoWrite → CTDD state synchronization
- **AT206**: AT completion detection from todo status changes
- **AT207**: Bidirectional sync (CTDD state → TodoWrite on resumption)
- **AT208**: Conflict resolution for state mismatches

### Evidence Required
- Manual todo + session update: 1000+ tokens
- Automated sync: 0 tokens (happens automatically)
- Reduction: 100% for todo-related updates

---

## Phase 2: Schema Evolution & Migration (2 hours)

### Acceptance Criteria

- **AT209**: Schema versioning system for session-state.json
- **AT210**: Automatic migration from legacy to optimized schema
- **AT211**: Compressed format for completed phases (90%+ size reduction)
- **AT212**: Incremental updates instead of full rewrites

### Evidence Required
- Current session-state.json: 217 lines, 8KB+
- Optimized format: < 50 lines for active work
- Archived format: Single line references to completed work

---

## Phase 3: Intelligent Context Management (2 hours)

### Acceptance Criteria

- **AT213**: Auto-detect AT completion from code changes
- **AT214**: Insight harvesting automation (extract patterns from commits)
- **AT215**: Smart resumption briefs (only show what's needed)
- **AT216**: Context budget tracking and warnings

### Evidence Required
- Manual insight documentation: 500+ tokens per insight
- Automated extraction: Single command captures insights
- Context budget alerts: Prevent wasteful operations before they happen

---

## Success Metrics

**Primary Metric**: Context tokens spent on bookkeeping
- Current: 5,000-10,000 tokens per session
- Target: < 250 tokens per session (95%+ reduction)

**Secondary Metrics**:
- Time to update session: 15 min → 10 seconds
- Commands to sync state: Multiple manual edits → 1 automated command
- Resumption efficiency: Read entire JSON → Read 5-line summary

---

## Bootstrap Validation

**This contract must use its own improvements**:
1. Phase 0 tools used to build Phase 1
2. Session management for this contract uses new automation
3. Final test: Can the new system manage its own development?

---

## Architecture Design (Based on Ultimate Challenge Learnings)

```
src/cli/commands/
├── session.ts         # New unified session command group
│   ├── update         # Smart AT completion tracking
│   ├── archive        # Compress completed work
│   ├── summary        # Quick status overview
│   ├── migrate        # Schema version migration
│   └── sync          # TodoWrite integration

src/session/
├── schema.ts          # Versioned schema definitions
├── migration.ts       # Migration strategies
├── compression.ts     # Archive completed work
├── detection.ts       # Auto-detect AT completion
└── insights.ts        # Automated insight extraction
```

---

## Critical Insight

**We've been violating our own methodology**: Building tools but not using them for our own work. This contract fixes that fundamental contradiction.

**Expected Impact**:
- 95%+ reduction in context spent on bookkeeping
- 100% automation of repetitive session tasks
- Focus shifts from bookkeeping to actual development
- Methodology becomes self-sustaining

---

## Next Actions

1. Implement emergency relief commands (Phase 0)
2. Test with real Ultimate Challenge session data
3. Migrate existing session-state.json to optimized format
4. Document new workflow in CLAUDE.md
5. **Critical**: Use new tools for ALL future session management

---

## Graduation Criteria

Contract graduates when:
1. ✅ Zero manual JSON edits required for any session task
2. ✅ 95%+ reduction in bookkeeping context achieved
3. ✅ TodoWrite fully integrated with CTDD state
4. ✅ Contract's own development managed by new system
5. ✅ Other agents can resume work with < 100 tokens of context

---

*"The ultimate inefficiency is building tools and not using them. This contract ensures CTDD practices what it preaches."*