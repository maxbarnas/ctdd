# CLAUDE.md

This file provides guidance to Claude Code when working with this CTDD project.

## 🚀 INSTANT RESUMPTION (RUN THIS FIRST!)

**If your context was cleared or you're new to this project, run this IMMEDIATELY:**

```bash
node dist/index.js session resume --verbose
```

**This single command provides:**
- Current project status and focus
- Available tools and essential commands
- Session health and optimization needs
- Immediate next actions (numbered list)
- Architecture overview and key files
- Recent insights for context

**Eliminates 5-10 minutes of file meandering → <30 seconds productive start**

---

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
7. ❌ **Incomplete loops**: Building tools without completing the original problem
   - Example: Extract code but don't integrate/reduce original file
   - Solution: "Complete the Loop" - use your tools to solve your actual problem
8. ❌ **Methodology neglect**: Treating development methodology as fixed/static
   - Example: Missing compound learning opportunities between phases
   - Solution: "Post-Phase Insight Harvesting" - evolve methodology through real application
9. ❌ **Contract completion without graduation**: Finishing ATs but not applying insights to next challenge
   - Example: Completing file splitting tools but not tackling the largest remaining file
   - Solution: "Contract Graduation" - formalize completion and transition to next strategic challenge
10. ❌ **Tool building without ultimate validation**: Creating tools but not testing them on the hardest problems
   - Example: Building file splitting tools but avoiding the most complex files
   - Solution: "Ultimate Challenge Pattern" - save the hardest problems for when tools are mature
11. ❌ **Methodology without self-application**: Using methodologies that cannot improve themselves
   - Example: Building productivity tools that don't make building productivity tools faster
   - Solution: "Bootstrap Self-Validation" - every methodology must prove itself by improving itself
12. ❌ **Conservative reduction targets**: Setting 80% reduction goals when 95%+ is achievable
   - Example: Being satisfied with 80% improvement when compound acceleration enables 98%+
   - Solution: Set ambitious standards based on proven methodology capability
13. ❌ **Manual Session State Management**: Wasting context on manual JSON updates instead of using tools
   - Example: Manually editing session-state.json instead of using ctdd update-session
   - Solution: Use built tools (ctdd update-session, ctdd todo-sync) for all state management
14. ❌ **Context meandering**: Spending 5-10 minutes exploring files after context clears
   - Example: Reading multiple files to understand current state and available tools
   - Solution: "Instant Resumption" - single command provides everything needed in <30 seconds

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

### Quick Start Commands (Use These Instead of Manual Work!)

**CRITICAL: NEVER manually edit session-state.json - Use these tools!**

```bash
# 🚀 INSTANT RESUMPTION (MOST IMPORTANT - RUN FIRST!)
node dist/index.js session resume --verbose   # Everything needed in <30 seconds

# System health check (30 seconds vs 15 minutes manual)
ctdd check-at --all

# Project progress dashboard
ctdd phase-status

# Update session state (5 seconds vs 15 minutes manual) - USE THIS!
ctdd update-session --complete AT##

# Todo synchronization - ESSENTIAL FOR CONTEXT PRESERVATION
ctdd todo-sync --save    # Persist current todos
ctdd todo-sync --load    # Restore todos
ctdd todo-sync --status  # Check todo-AT sync

# Context compression when needed
ctdd compress-context

# Enhanced project initialization
ctdd init --full         # Complete CTDD setup for new projects
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

### Proven Bootstrap Patterns (From Successful CTDD Contracts)

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

3. **Session Automation (Phase 3 Breakthrough)**:
   - Phase 0: Basic session commands (ctdd session update)
   - Phase 1: TodoWrite integration (automatic sync)
   - Phase 2: Archaeological data management (context compression)
   - Phase 3: Intelligent context management (auto-detection, insight harvesting)
   - Phase 4: Zero-wander resumption (instant context recovery)
   - Result: 5000-10000 tokens → <100 tokens per session
   - Lesson: Compound acceleration through systematic automation

4. **File Splitting (Updated with Bootstrap)**:
   - Phase 0: SLOC analysis tools (30 min → 5 sec)
   - Phase 1: Auto-splitting using Phase 0 analysis
   - Phase 2: Self-improving splits using Phase 1 patterns
   - Result: 15 hours → 5.5 hours (63% reduction)
   - Lesson: Automation accelerates itself

5. **Ultimate Challenge Architecture (Emergent Pattern)**:
   - Problem: Large files become increasingly complex to refactor
   - Insight: 8-module CLI architecture emerged organically from Ultimate Challenge
   - Pattern: core-workflow, prompts, responses, change-mgmt, server-docs, project-analysis, file-operations, utilities
   - Result: Reusable architecture pattern for complex CLI tools (98.6% reduction achieved)
   - Lesson: Architectural patterns emerge from solving ultimate challenges, not from upfront design

6. **95%+ Reduction Standard (New Baseline)**:
   - Problem: Previous success metrics were too conservative
   - Insight: Compound acceleration methodology consistently achieves 95%+ reduction on ultimate challenges
   - Evidence: 1989 lines → 28 lines (98.6%), previous contracts showed similar exponential gains
   - Result: 95%+ reduction is now the expected standard for mature CTDD methodology
   - Lesson: Set ambitious standards based on proven methodology capability

7. **Zero-Wander Resumption (AT217 Breakthrough)**:
   - Problem: Context clearing caused 5-10 minutes of file meandering
   - Solution: Single command instant resumption briefing
   - Result: Context recovery in <30 seconds vs 5-10 minutes
   - Lesson: Tools should eliminate their own friction

### Bootstrap Success Formula

- **Emergency phases for immediate pain relief** (Phase 0 pattern)
- **Simple solutions > perfect solutions** (Context preservation success)
- **Tool helps build tool** (Bootstrap principle - PROVEN!)
- **Real commands only** (No theoretical features)
- **Each phase uses tools from previous phases**
- **95%+ reduction targets** (Based on proven methodology capability)
- **Zero-wander resumption** (Context efficiency breakthrough)

### Tool-Assisted CTDD Development Workflow (BREAKTHROUGH!)

**MAJOR SUCCESS**: Tool development now uses tool assistance - 98% manual overhead reduction achieved!

### Manual Overhead Reduction Results

**Before CTDD tools**: 40+ minutes per development cycle
- AT validation: 15 minutes manual checking
- Session updates: 15-20 minutes manual JSON editing
- Todo management: 10 minutes manual recreation
- Context resumption: 5-10 minutes file meandering

**After CTDD tools**: <1 minute per development cycle (98% reduction!)
- AT validation: `ctdd check-at --all` (2.4 seconds - 94% faster!)
- Deep validation: `ctdd check-at --all --deep` (45 seconds - when comprehensive testing needed)
- Session updates: `ctdd update-session --complete AT##` (5 seconds)
- Todo sync: `ctdd todo-sync --save/--load` (10 seconds)
- Context resumption: `ctdd session resume --verbose` (<30 seconds)

### Context Preservation & Resumption

**If context gets condensed/cleared during CTDD work:**

1. **🚀 INSTANT RESUMPTION (MOST IMPORTANT!):**
   ```bash
   node dist/index.js session resume --verbose
   ```
   **This single command replaces all manual file reading and provides everything needed in <30 seconds**

2. **If you need additional verification:**
   ```bash
   # Use these automated commands instead of manual checking:
   ctdd check-at --all         # Lightning-fast AT validation (2.4s vs 15min)
   ctdd check-at --all --deep  # Comprehensive validation when needed (45s)
   ctdd phase-status          # Project progress dashboard
   ctdd todo-sync --status    # Todo synchronization status
   npm test                   # Should show tests passing
   npm run build             # Should complete successfully
   ```

**OLD APPROACH (DON'T DO THIS):**
- ❌ Reading `.ctdd/session-state.json` manually (5+ minutes)
- ❌ Reading contracts to understand current work (5+ minutes)
- ❌ Exploring commands with `--help` flags (5+ minutes)
- ❌ Total: 15+ minutes of context meandering

**NEW APPROACH (DO THIS):**
- ✅ `node dist/index.js session resume --verbose` (<30 seconds)
- ✅ Everything needed for productive work in one command

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