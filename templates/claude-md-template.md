# CLAUDE.md

This file provides guidance to Claude Code when working with this CTDD project.

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
     "current_phase": "Current phase description",
     "completed_acceptance_criteria": ["AT001", "AT002"],
     "file_changes": ["Brief description of key changes"],
     "critical_insights": ["Key learnings that affect future work"],
     "next_actions": ["Specific next steps"],
     "verification_commands": ["Commands to verify current state"],
     "resumption_context": "What new Claude instance needs to know"
   }
   ```

### Contract Structure Template

```markdown
## Focus Card (FC-FEATURE-001)
- **FC-ID**: FC-FEATURE-001 (versioned)
- **Goal**: [Include "tool-assisted" and efficiency focus]
- **Deliverables**: [Tools and automation, not just features]
- **Constraints**: [Each phase must accelerate the next]
- **Non-goals**: [No complex automation before quick wins]

## Invariants
- **I1**: Development velocity must increase with each phase
- **I2**: Manual overhead must decrease by 80%+
- **I3**: Each tool feature provides immediate value
- **I4**: Bootstrap principle: tools help build tools

## Phase 0: Emergency Quick Wins (Day 1)
[Immediate 50%+ overhead reduction]

## Phase 1: Tool-Assisted Implementation
[Use Phase 0 tools to build Phase 1 faster]

## Success Metrics
- Manual approach: X hours
- Tool-assisted: Y hours (80%+ reduction)
```

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

## CTDD Tool-Assisted Development Workflow

This project uses CTDD (Context Test-Driven Development) with tool assistance for maximum efficiency.

### Quick Start Commands

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
```

### CTDD Development Process

1. **Focus Card Definition**: Clear goal, deliverables, constraints, non-goals
2. **Invariants**: Non-negotiable conditions that must always hold
3. **CUTs**: Acceptance criteria with testable evidence
4. **Tool-Assisted Implementation**: Use ctdd commands to reduce manual overhead
5. **Contract Archival**: Move completed contracts to contracts/archive/

### Contract Management

**Automatic Contract Archival**: When completing CTDD contracts, move them to contracts/archive/:

```bash
# After completing all acceptance criteria:
ctdd check-at --all                      # Verify completion
mv contracts/COMPLETED_CONTRACT.md contracts/archive/
git commit -m "feat: Complete contract"  # Commit with completion
```

**Organization**:
- **Active contracts**: Keep in contracts/ (work in progress)
- **Completed contracts**: Move to contracts/archive/ (historical reference)
- **Benefits**: Clean workspace, clear progress tracking, easy reference

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

3. **High-Impact UX Features**:
   - Phase 4: Developer UX improvements
   - Built --help enhancements, phase-status dashboard
   - Result: Immediate productivity gains
   - Lesson: High-impact, low-effort wins

### Bootstrap Success Formula

- **Emergency phases for immediate pain relief** (Phase 0 pattern)
- **Simple solutions > perfect solutions** (Context preservation success)
- **Tool helps build tool** (Bootstrap principle - PROVEN!)
- **Real commands only** (No theoretical features)
- **Each phase uses tools from previous phases**

### Manual Overhead Reduction

**Before CTDD tools**: 40+ minutes per development cycle
**After CTDD tools**: <1 minute per development cycle (98% reduction)

### Context Preservation

- Session state automatically managed via ctdd commands
- Use `ctdd compress-context` when session-state.json > 100 lines
- Archive system preserves full context while keeping active context lean

### Error Handling

All errors use E001-E999 codes with actionable suggestions.
Error logging automatically captured to .ctdd/logs/errors.json.

### Bootstrap Insights

The tool development followed CTDD methodology to build CTDD tooling:
- Phase 0: Emergency manual overhead reduction
- Phase 1: Enhanced AT validation automation
- Phase 2: Session state automation
- Each phase used tools from previous phases (bootstrap principle)

**Result**: Tool immediately helps its own development and scales to other projects.