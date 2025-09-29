# Generalized CTDD Methodology
## Context Test-Driven Development for Any Project

**CTDD Purpose**: Preserve context and progress across work sessions while accelerating development through bootstrap methodology and compound acceleration.

---

## Core CTDD Principles (Tool-Independent)

### 1. **Focus Card** (Project Definition)
Create a single file: `PROJECT_FOCUS.md`

```markdown
# Focus Card: [PROJECT-NAME]

- **FC-ID**: FC-[PROJECT]-001 (versioned for tracking)
- **Goal**: [Tool-assisted approach with measurable efficiency gains]
- **Deliverables**: [Specific, testable outcomes]
- **Constraints**: [Each phase must accelerate next + preserve functionality]
- **Non-goals**: [Manual work, complex automation before quick wins]
- **Success Metric**: [X% reduction in manual overhead / Y% improvement in efficiency]
```

### 2. **Invariants** (Always-True Conditions)
Add to `PROJECT_FOCUS.md`:

```markdown
## Invariants (Check Before/After Each Session)
- **I1**: Development velocity increases with each phase (measured)
- **I2**: All existing functionality preserved (tests pass)
- **I3**: Manual overhead decreases by 80%+ (timed evidence)
- **I4**: Bootstrap principle: tools help build tools (demonstrable)
- **I5**: Context preservation: seamless resumption across sessions
```

### 3. **CUTs** (Context Unit Tests - Acceptance Criteria)
Add specific, testable criteria:

```markdown
## Acceptance Criteria (CUTs)
- **AT001**: [Specific outcome + verification method + time savings evidence]
- **AT002**: [Include manual vs tool-assisted comparison]
- **AT003**: [Each AT must have concrete pass/fail criteria]
```

### 4. **Session State Register** (In-Memory Tracking)
Create: `SESSION_STATE.json`

```json
{
  "current_phase": "Phase 0: Emergency Quick Wins",
  "completed_acceptance_criteria": ["AT001", "AT002"],
  "current_at": "AT003",
  "file_changes": ["file.js - added helper function"],
  "critical_insights": ["Pattern X reduces complexity by 90%"],
  "next_actions": ["Implement AT004 using tools from AT002"],
  "verification_commands": ["npm test", "npm run lint"],
  "manual_time_baseline": "4 hours",
  "tool_assisted_time": "20 minutes",
  "acceleration_factor": "12x",
  "resumption_context": "Tools from AT002 ready for AT003 implementation"
}
```

---

## CTDD Workflow (Manual Implementation)

### **Phase 0: Emergency Quick Wins**
*Goal: Immediate 50%+ overhead reduction in hours, not days*

1. **Identify Pain Points** (15 minutes):
   - What takes longest manually?
   - What causes most errors?
   - What blocks resumption after breaks?

2. **Build Minimal Tools** (2-4 hours):
   - Simple scripts for repetitive tasks
   - Checklists for complex procedures
   - Quick validation commands

3. **Measure Acceleration** (Evidence Required):
   ```bash
   # Before tool
   Manual time: 2 hours

   # After tool
   Tool-assisted time: 15 minutes
   Reduction: 87.5%
   ```

### **Pre-Check Ritual** (Before Each Session)
```markdown
## Pre-Check (5 minutes)
1. ✅ Read SESSION_STATE.json - what was the last completed AT?
2. ✅ Verify current invariants still hold (run tests, check builds)
3. ✅ Identify target ATs for this session (usually 1-3)
4. ✅ Set manual time baseline for comparison
5. ✅ Create simple todo list for session
```

### **Implementation Loop**
```markdown
## Implementation (Main Work)
1. **Reference AT IDs** in all commits/changes
2. **Use tools from previous phases** to accelerate current work
3. **Collect concrete evidence** for each AT completion
4. **Update session state** as progress is made
5. **Time everything** - manual vs tool-assisted approaches
```

### **Post-Check Ritual** (After Each Session)
```markdown
## Post-Check (10 minutes)
1. ✅ Report PASS/FAIL with evidence for each targeted AT
2. ✅ Update SESSION_STATE.json with progress and insights
3. ✅ Document actual time spent vs baseline
4. ✅ Run verification commands (tests, builds, etc.)
5. ✅ Write resumption instructions for next session
6. ✅ **Insight Harvesting**: What methodology insights emerged?
```

### **Post-Phase Insight Harvesting** (Critical!)
```markdown
## After Completing a Phase
1. **Pause and Reflect**: "What new insights emerged?"
2. **Extract Patterns**: What worked? What failed? What surprised you?
3. **Update Methodology**: Add insights to this document immediately
4. **Identify Next Challenge**: What's the hardest remaining problem?
5. **Bootstrap Validation**: Did your tools help build better tools?
6. **Compound Learning**: How will these insights accelerate future work?
```

---

## Evidence-Based Validation (Manual Methods)

### **AT Validation Without Tools**
```markdown
## For Each Acceptance Criteria (AT)
1. **Define Verification Method**:
   - Command to run: `npm test && npm run build`
   - File to check: `src/main.js` line count reduced by 80%
   - Behavior to verify: Feature X works in under 2 seconds

2. **Collect Evidence**:
   - Before: Screenshot, timing, line counts
   - After: Screenshot, timing, line counts
   - Difference: Concrete improvement metrics

3. **Manual vs Tool-Assisted Comparison**:
   - Manual approach: X hours + error-prone
   - Tool-assisted: Y minutes + reliable
   - Acceleration: Z% improvement
```

### **Simple Progress Tracking**
Create: `PROGRESS_LOG.md`

```markdown
## CTDD Progress Log

### 2024-01-15 - Session 1
- **Target**: AT001, AT002
- **Completed**: AT001 ✅, AT002 ✅
- **Evidence**: Tests pass, build time 2s → 0.5s (75% improvement)
- **Insights**: Pattern matching reduced boilerplate by 90%
- **Next**: AT003 - apply pattern to remaining files

### 2024-01-16 - Session 2
- **Target**: AT003
- **Status**: In Progress
- **Blocker**: Need to resolve circular dependency
- **Tool Built**: dependency-analyzer.js (30s vs 2hr manual)
```

---

## Bootstrap Methodology (Tool-Independent)

### **"Tools Help Build Tools" Pattern**
```markdown
## Progressive Tool Enhancement
1. **Phase 0**: Build basic automation (scripts, checklists)
2. **Phase 1**: Use Phase 0 tools to build Phase 1 tools
3. **Phase 2**: Use Phase 1 tools to build Phase 2 tools
4. **Result**: Exponential acceleration, not linear improvement

## Example Progression:
- Phase 0: Manual file analysis (2 hours)
- Phase 1: grep script for analysis (5 minutes)
- Phase 2: Analysis script builds refactoring script (30 seconds)
- Phase 3: Refactoring script improves itself (bootstrap!)
```

### **Bootstrap Self-Validation Test**
```markdown
## Ultimate Methodology Test
Your methodology is mature when:
1. ✅ You can use it to improve itself
2. ✅ Tools built with it can enhance the methodology
3. ✅ Each phase accelerates the next by 5x+ (not 20%)
4. ✅ Manual overhead reduced by 95%+ on complex problems
```

---

## Architecture Patterns (From Ultimate Challenge)

### **8-Module Architecture Pattern**
When building complex tools, this architecture emerged as optimal:

```
project/
├── core/           # Fundamental operations
├── input/          # Data/command intake
├── processing/     # Main logic/transformation
├── state/          # State management
├── output/         # Results/interfaces
├── analysis/       # Introspection/metrics
├── operations/     # File/code manipulation
└── utilities/      # Helper functions
```

### **File Organization by Complexity**
```markdown
## Proven Splitting Strategy
1. **Start Small**: Files under 200 lines (quick wins)
2. **Build Tools**: Extract patterns, create helpers
3. **Scale Up**: Files 200-500 lines (tool-assisted)
4. **Ultimate Challenge**: Largest file (95%+ reduction expected)
```

---

## Common Patterns & Anti-Patterns

### **✅ DO**
- Start with Phase 0 emergency relief (hours, not days)
- Measure everything - time, lines, complexity
- Build tools that validate themselves
- Set 95%+ reduction targets for ultimate challenges
- Use CTDD to improve CTDD itself

### **❌ DON'T**
- Set conservative targets (80% when 95%+ is achievable)
- Build tools without using them on hard problems
- Skip the bootstrap validation test
- Defer all value to project completion
- Treat methodology as fixed/unchanging

---

## Quick Start Checklist

```markdown
## Start CTDD on Any Project (30 minutes setup)

### Immediate Setup:
- [ ] Create PROJECT_FOCUS.md with Focus Card
- [ ] Define 3-5 Invariants
- [ ] Write 5-10 specific Acceptance Criteria (ATs)
- [ ] Create SESSION_STATE.json
- [ ] Create PROGRESS_LOG.md

### Phase 0 (First 2-4 hours):
- [ ] Identify biggest manual pain point
- [ ] Time the current manual approach
- [ ] Build minimal tool/script to help
- [ ] Measure acceleration achieved
- [ ] Document insights and patterns

### Bootstrap Test:
- [ ] Use your Phase 0 tools to build Phase 1 tools
- [ ] Apply your methodology to improve itself
- [ ] Achieve 95%+ reduction on ultimate challenge
- [ ] Document methodology insights for future projects
```

---

## Success Metrics

### **Session Level**
- Manual time → Tool-assisted time (% reduction)
- Number of ATs completed with evidence
- Tests/builds still passing (invariants held)
- New insights captured and documented

### **Phase Level**
- Compound acceleration (each phase 5x+ faster than previous)
- Tool maturity (tools can improve other tools)
- Ultimate challenge readiness (95%+ reduction achievable)

### **Project Level**
- Bootstrap validation (methodology improves itself)
- Knowledge transfer (insights documented for future projects)
- Methodology evolution (new patterns discovered and shared)

---

*This methodology has been validated through self-application: CTDD successfully refactored its own implementation (1989 lines → 28 lines = 98.6% reduction), proving the bootstrap principle at ultimate scale.*