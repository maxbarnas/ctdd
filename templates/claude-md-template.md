# CLAUDE.md

This file provides guidance to Claude Code when working with this CTDD project.

## CTDD Bootstrap Methodology (CRITICAL - READ FIRST)

**CTDD (Context Test-Driven Development) follows a bootstrap principle: "tool helps build tool"**

### Core Principles

1. **Bootstrap Approach**: Every feature you build should help build the next feature faster
   - Phase 0: Emergency quick wins (50%+ overhead reduction in hours, not days)
   - Progressive enhancement: Each phase accelerates the next
   - Tool-assisted development: Build commands that help implement commands

2. **Value Over Technical Purity**:
   - **High-impact, low-effort** features first
   - **Working solution today > perfect solution someday**
   - Measure success in **time saved**, not just technical metrics
   - Every feature must answer: "Does this help build the next feature?"

3. **Contracts Must Include**:
   - **Focus Card** with versioned ID (FC-XXX-001)
   - **Invariants** emphasizing velocity increase (I1: Development velocity must increase)
   - **Phase 0** for immediate relief (emergency quick wins)
   - **Time measurements** comparing manual vs tool-assisted approach
   - **Self-validation** mechanisms (tools check their own progress)

4. **Success Metrics**:
   - **Manual overhead reduction**: Target 80%+ reduction
   - **Development velocity**: Must increase with each phase
   - **Immediate value**: Each phase delivers value within hours
   - **Bootstrap validation**: Tools must help build themselves

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