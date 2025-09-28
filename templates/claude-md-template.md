# CLAUDE.md

This file provides guidance to Claude Code when working with this CTDD project.

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

### Proven Patterns (From Bootstrap Success)

- **High-impact UX features > technical complexity** (Phase 4 validation)
- **Simple solutions > perfect solutions** (Context preservation success)
- **Tool helps build tool** (Bootstrap principle)
- **Emergency phases for immediate pain relief** (Phase 0 pattern)
- **Real commands only** (No theoretical features)

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