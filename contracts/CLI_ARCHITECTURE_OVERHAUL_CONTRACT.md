# CTDD Contract: CLI Architecture Overhaul - The Ultimate Challenge

## Focus Card (FC-CLI-OVERHAUL-001)

- **FC-ID**: FC-CLI-OVERHAUL-001
- **Goal**: Apply Enhanced Extract+Integrate methodology to src/index.ts (1534 lines) - the ultimate test of CTDD methodology scaling
- **Deliverables**: [Modular CLI architecture, Command organization system, Ultimate methodology validation, Tool suite maturity proof, 90%+ manual overhead reduction vs Phase 0 baseline]
- **Constraints**: [All 76 tests must pass, Build time < 3 seconds, All existing functionality preserved, Enhanced Extract+Integrate methodology exclusively, Bootstrap principle validation]
- **Non-goals**: [Complete rewrite without tools, Breaking API changes, Manual refactoring without evidence, Tool building without ultimate application]

## Invariants

- **I1**: All existing CLI functionality must be preserved (76/76 tests passing)
- **I2**: Tool-assisted approach must be 90%+ faster than manual refactoring
- **I3**: Enhanced Extract+Integrate methodology must scale to 1534-line files
- **I4**: Bootstrap principle must be validated (tools built for medium files work on largest file)
- **I5**: Compound acceleration must continue (this phase should be fastest yet)
- **I6**: src/index.ts must be reduced to under 100 SLOC (15x reduction required)
- **I7**: Build time must remain under 3 seconds throughout
- **I8**: New modular architecture must be more maintainable than monolithic approach

## Ultimate Challenge Assessment

**Target File Analysis**:
- `src/index.ts`: 1534 lines (15.3x over 100 SLOC limit)
- **Complexity**: Highest in codebase - all CLI commands, options, error handling
- **Dependencies**: Imports from every major module in the project
- **Responsibility overload**: Parsing, validation, execution, error handling, help system
- **Perfect test case**: If methodology scales here, it scales anywhere

**Available Tool Suite** (Built in FILE_SPLITTING_CONTRACT):
- ✅ `ctdd analyze-sloc` - Instant oversized file detection
- ✅ `ctdd split-file` - Tool-assisted file splitting
- ✅ `ctdd verify-splits` - Functionality validation
- ✅ `ctdd refactor-stats` - Success metrics documentation
- ✅ `ctdd rollback-split` - Safe experimentation
- ✅ `ctdd optimize-imports` - Import cleanup

**Methodology Maturity Evidence**:
- ✅ Enhanced Extract+Integrate proven on 4 files (1,122+ lines removed)
- ✅ Compound acceleration validated (18x improvement)
- ✅ Tool suite complete and battle-tested
- ✅ 76/76 tests maintained throughout previous work
- ✅ Post-Phase Insight Harvesting formalized

## Phase 0: Ultimate Challenge Preparation (30 minutes)

### Acceptance Criteria
- **AT101**: Analyze src/index.ts structure and identify natural command boundaries
- **AT102**: Map dependencies and validate safe extraction points
- **AT103**: Estimate effort using mature tool suite vs manual approach (should show 95%+ time savings)
- **AT104**: Create CLI module architecture plan using lessons from previous phases

### Expected Acceleration
- **Previous Phase 0 baseline**: 30+ minutes manual analysis
- **With mature tools**: < 2 minutes automated analysis
- **Expected improvement**: 95%+ time savings (vs original manual approach)

## Phase 1: Command Module Extraction (60 minutes)

### Acceptance Criteria
- **AT105**: Extract command definitions into organized modules (init, status, pre/post, etc.)
- **AT106**: Create CLI barrel exports maintaining API compatibility
- **AT107**: Validate all command functionality using ctdd verify-splits
- **AT108**: Measure and document compound acceleration vs FILE_SPLITTING_CONTRACT phases

### Target Architecture
```
src/cli/
├── commands/
│   ├── init.ts (already exists)
│   ├── status.ts
│   ├── validation.ts
│   ├── prompts.ts
│   ├── workflow.ts
│   ├── analysis.ts
│   └── splitting.ts
├── core/
│   ├── parser.ts
│   ├── error-handling.ts
│   └── help-system.ts
└── index.ts (barrel exports)
```

## Phase 2: Integration and Optimization (30 minutes)

### Acceptance Criteria
- **AT109**: Integrate extracted CLI modules into new src/index.ts (target: < 100 lines)
- **AT110**: Apply ctdd optimize-imports to clean up module dependencies
- **AT111**: Validate ultimate challenge success: 15x+ SLOC reduction achieved
- **AT112**: Document methodology scaling evidence using ctdd refactor-stats

### Ultimate Success Criteria
- **src/index.ts**: 1534 lines → < 100 lines (15x+ reduction)
- **Module count**: 8-10 focused CLI modules created
- **Test status**: 76/76 tests passing throughout
- **Time evidence**: 90%+ reduction vs manual approach
- **Compound acceleration**: Fastest phase yet (using mature tool suite)

## Bootstrap Validation Hypothesis

**Hypothesis**: Tools built for medium complexity files (455-606 lines) will accelerate work on the ultimate challenge (1534 lines) by 95%+

**Evidence Collection**:
- Manual approach estimate: 8+ hours for src/index.ts refactoring
- Tool-assisted prediction: < 2 hours using mature Enhanced Extract+Integrate
- Success metric: 95%+ time savings demonstrated

**Methodology Scaling Test**:
- Previous largest success: src/plugin.ts (606 lines → 11 lines, 98% reduction)
- Ultimate challenge: src/index.ts (1534 lines → < 100 lines, 93%+ reduction required)
- Scale factor: 2.5x larger file, similar reduction percentage expected

## Success Metrics & Evidence

**Time Savings**:
- Manual approach: 8+ hours
- Tool-assisted: < 2 hours
- Efficiency gain: 95%+ reduction

**Quality Assurance**:
- Tests: 76/76 passing maintained
- Build: < 3 seconds maintained
- Functionality: 100% preserved
- Architecture: Improved maintainability

**Methodology Validation**:
- Enhanced Extract+Integrate scales to ultimate complexity
- Bootstrap principle proven (tools help solve original problem)
- Compound acceleration continues (fastest phase yet)
- CTDD methodology validated at massive scale

## Post-Phase Insight Harvesting

After completing this ultimate challenge, harvest insights about:
- **Methodology scaling limits**: What file size/complexity breaks the approach?
- **Tool suite completeness**: What additional tools would accelerate future work?
- **Architecture emergence**: What patterns emerged from the largest refactoring?
- **Bootstrap completion**: Has the original problem (massive files) been solved?
- **Cross-project applicability**: How do insights apply to other projects?

## Graduation Criteria

This contract graduates when:
1. ✅ All acceptance criteria (AT101-AT112) completed with evidence
2. ✅ src/index.ts reduced to < 100 lines (15x+ reduction)
3. ✅ 76/76 tests passing throughout ultimate challenge
4. ✅ Enhanced Extract+Integrate methodology proven at ultimate scale
5. ✅ Bootstrap principle validated (tools solve original massive file problem)
6. ✅ Success documented in ctdd refactor-stats for future reference

**Next Strategic Challenge**: With CLI architecture mastered, next challenges could include:
- Core system decomposition (src/core.ts: 871 lines)
- Test architecture modernization (multiple 200+ line test files)
- Cross-project CTDD methodology application
- Advanced automation and methodology refinement