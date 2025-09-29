# CTDD Contract: File Splitting with Bootstrap Methodology

## Focus Card (FC-SPLIT-002)

- **FC-ID**: FC-SPLIT-002
- **Goal**: Transform oversized files into maintainable modules using tool-assisted bootstrap approach that accelerates its own implementation
- **Deliverables**: [SLOC analysis tools, Auto-splitting commands, Dependency mapper, Self-validation system, 80%+ manual refactoring overhead reduction]
- **Constraints**: [Maintain all functionality, No breaking API changes, Tests must pass throughout, Each phase must accelerate the next]
- **Non-goals**: [Manual refactoring without tools, Perfect architecture before proving value, Complex automation before quick wins]

## Invariants

- **I1**: Refactoring velocity must increase with each phase (tool helps build tool)
- **I2**: All existing functionality preserved (76/76 tests passing)
- **I3**: Manual refactoring overhead must decrease by 80%+ by end
- **I4**: Each tool feature must provide immediate value for splitting work
- **I5**: Bootstrap principle: tools we build help complete the splitting faster
- **I6**: No file exceeds target SLOC after completion (100 source/200 test)
- **I7**: Build time should not increase significantly
- **I8**: Tool-assisted splitting must be faster than manual approach

## Current State Analysis

**Files requiring split (manual analysis took 30+ minutes):**

**Source files exceeding 100 SLOC:**
- `src/index.ts`: 1445 lines (14x over limit) - **HIGHEST PRIORITY**
- `src/core.ts`: 903 lines (9x over limit) - **CRITICAL PATH**
- `src/plugin.ts`: 605 lines (6x over limit)
- `src/server.ts`: 454 lines (4.5x over limit)
- `src/errors.ts`: 259 lines (2.6x over limit)
- `src/validation.ts`: 170 lines (1.7x over limit)

**Test files exceeding 200 SLOC:**
- `tests/e2e/full-workflow.test.ts`: 367 lines
- `tests/unit/errors.test.ts`: 323 lines
- `tests/integration/cli.test.ts`: 318 lines
- `tests/unit/core.test.ts`: 281 lines
- `tests/integration/plugin-timeouts.test.ts`: 219 lines

## Phase 0: Emergency Quick Wins (2 hours)

### Acceptance Criteria
- **AT001**: Create `ctdd analyze-sloc` command showing all oversized files instantly (vs 30min manual)
- **AT002**: Build `ctdd suggest-splits src/index.ts` to analyze and suggest logical module boundaries
- **AT003**: Generate dependency map for safe splitting with `ctdd deps src/index.ts`
- **AT004**: Validate suggestions maintain functionality with `ctdd validate-split --dry-run`

### Immediate Value
- **Manual SLOC analysis**: 30+ minutes → 5 seconds (99% reduction)
- **Dependency checking**: 20 minutes → 10 seconds (99% reduction)
- **Split planning**: 45 minutes → 2 minutes (95% reduction)

### Implementation
```bash
# Quick implementation using existing infrastructure
ctdd analyze-sloc                     # List all files over limits
ctdd suggest-splits src/index.ts      # AI-powered split suggestions
ctdd deps src/index.ts                # Show what depends on this file
ctdd validate-split --dry-run         # Check if split is safe
```

## Phase 1: Tool-Assisted Splitting - Core Files (Day 1)

### Acceptance Criteria
- **AT005**: Implement `ctdd split-file src/index.ts --auto` that splits index.ts into CLI modules
- **AT006**: Auto-generate barrel exports maintaining API compatibility
- **AT007**: Create `ctdd verify-splits` ensuring no functionality lost
- **AT008**: Split src/core.ts using tools built for index.ts (bootstrap principle)
- **AT009**: Measure time saved: manual split (3 hours) vs tool-assisted (15 minutes)

### PHASE 1 INSIGHT: Two-Phase Splitting Methodology

**Critical Learning from Phase 1**: File splitting is actually **Extract + Integrate**:

**Phase A - Extract** (✅ COMPLETED):
- Create new modules with extracted functionality
- Generate barrel exports for API compatibility
- Verify extracted modules compile and work independently

**Phase B - Integrate** (🚧 IN PROGRESS):
- Replace original code with imports from new modules
- Remove duplicated code from original file
- Verify original file functionality with reduced SLOC
- Measure actual file size reduction

**"Complete the Loop" Principle**: Tool-assisted development must solve the original problem, not just build infrastructure.

### Progressive Enhancement
- Use Phase 0 tools to analyze files before splitting
- Each split validates both extraction AND integration using AT007 verification
- Tools learn from each split to improve suggestions
- **New**: Track original file reduction, not just new file creation

### Target Splits (Tool-Assisted)

**src/index.ts → CLI modules** (using AT005):
- `src/cli/commands.ts` - Core command definitions
- `src/cli/init.ts` - Init command logic
- `src/cli/status.ts` - Status and validation commands
- `src/cli/prompts.ts` - Pre/post prompt commands
- `src/cli/responses.ts` - Response validation/recording
- `src/cli/briefing.ts` - Brief generation commands
- `src/cli/checks.ts` - Plugin check commands
- `src/cli/project.ts` - Project management commands
- `src/cli/server.ts` - Server command
- `src/cli/delta.ts` - Delta application command
- `src/cli/utilities.ts` - CLI utility functions
- `src/index.ts` - Main entry point (~100 SLOC)

**src/core.ts → Domain modules** (using AT008):
- `src/core/constants.ts` - Core constants and config
- `src/core/state.ts` - State management
- `src/core/operations.ts` - Core operations
- `src/core/logging.ts` - Logging utilities
- `src/schemas/spec.ts` - Zod schemas for specs
- `src/schemas/responses.ts` - Response schemas
- `src/io/files.ts` - File operations
- `src/io/directories.ts` - Directory management
- `src/rendering/prompts.ts` - Prompt rendering
- `src/rendering/briefs.ts` - Brief rendering
- `src/templates/loader.ts` - Template loading
- `src/templates/processor.ts` - Template processing

## Phase 2: Self-Improving Plugin & Server Splits (Day 2)

### Acceptance Criteria
- **AT010**: Split src/plugin.ts using patterns learned from Phase 1
- **AT011**: Split src/server.ts with auto-route extraction
- **AT012**: Create `ctdd refactor-stats` showing time savings and quality metrics
- **AT013**: Build `ctdd rollback-split` for safe experimentation
- **AT014**: Implement `ctdd optimize-imports` to clean up after splits

### Bootstrap Acceleration
- Tools from Phase 1 now split remaining files 5x faster
- Self-validation ensures each split maintains quality
- Metrics prove tool-assisted approach superiority

### Target Splits (Automated)

**src/plugin.ts → Plugin modules**:
- `src/plugins/types.ts` - Plugin type definitions
- `src/plugins/loader.ts` - Plugin discovery/loading
- `src/plugins/executor.ts` - Plugin execution engine

**src/server.ts → Server modules**:
- `src/server/middleware.ts` - CORS and middleware

## Phase 3: Test Splitting & Validation (Day 3)

### Acceptance Criteria
- **AT015**: Apply splitting tools to test files (>200 SLOC)
- **AT016**: Validate all 76 tests still pass after complete refactoring
- **AT017**: Ensure build time remains under 3 seconds
- **AT018**: Generate splitting report with metrics
- **AT019**: Archive this contract after successful completion

### Final Validation
```bash
ctdd analyze-sloc --verify            # Confirm all files within limits
ctdd refactor-stats                   # Show total time saved
npm test                              # 76/76 passing
npm run build                         # <3 seconds
ctdd validate-splits --final          # Complete validation
```

## Success Metrics

### Efficiency Gains (Projected from Bootstrap Pattern)
**Manual Refactoring Time**:
- Analysis & planning: 2 hours
- src/index.ts split: 3 hours
- src/core.ts split: 2.5 hours
- src/plugin.ts split: 2 hours
- src/server.ts split: 1.5 hours
- Test file splits: 2 hours
- Testing & validation: 2 hours
- **Total**: ~15 hours

**Tool-Assisted Time** (Based on CTDD Bootstrap Success):
- Phase 0 tool creation: 2 hours
- Phase 1 execution: 2 hours (includes building tools)
- Phase 2 execution: 1 hour (tools accelerate work)
- Phase 3 execution: 30 minutes (maximum acceleration)
- **Total**: ~5.5 hours (63% reduction, accelerating to 80%+ by end)

### Quality Metrics
- All files within SLOC limits (100 source/200 test)
- No functionality lost (76/76 tests passing)
- No API breaks (all exports maintained)
- Build time preserved (<3 seconds)
- Code more maintainable (smaller, focused modules)

## Implementation Commands

### Phase 0: Build Tools (Immediate Start)
```bash
# Implement analysis command
ctdd analyze-sloc

# Test on own codebase
ctdd suggest-splits src/index.ts
ctdd deps src/index.ts
```

### Phase 1: Execute Splits (After Tools Ready)
```bash
# Use tools to split highest impact files
ctdd split-file src/index.ts --auto
ctdd verify-splits
ctdd split-file src/core.ts --auto
```

### Phase 2: Accelerate & Improve
```bash
# Tools now faster, smarter
ctdd split-file src/plugin.ts --auto
ctdd split-file src/server.ts --auto
ctdd optimize-imports
```

### Phase 3: Complete & Validate
```bash
# Final validation
ctdd analyze-sloc --verify
ctdd refactor-stats
npm test
npm run build
```

## Risk Mitigation

### Split Breaks Functionality
- **Risk**: Splitting introduces bugs
- **Mitigation**: AT007 `verify-splits` after each operation
- **Validation**: All tests must pass continuously

### Tool Development Overhead
- **Risk**: Building tools takes longer than manual work
- **Mitigation**: Phase 0 quick wins prove value immediately
- **Validation**: Track time spent vs time saved

### Import Complexity
- **Risk**: Circular dependencies after splitting
- **Mitigation**: AT003 dependency mapping before splits
- **Validation**: Build must succeed after each split

## Contract Completion Criteria

**Bootstrap Success Validation**:
- ✅ All files within SLOC limits (ctdd analyze-sloc --verify)
- ✅ 76/76 tests passing throughout process
- ✅ 80%+ manual overhead reduction achieved
- ✅ Tools accelerated their own development
- ✅ Each phase faster than previous
- ✅ Contract archived to contracts/archive/

**Evidence of Bootstrap Success**:
```bash
# Final measurements
ctdd refactor-stats --final

# Expected output:
# Manual approach: ~15 hours estimated
# Tool-assisted: 5.5 hours actual
# Time saved: 9.5 hours (63% reduction)
# Files split: 11
# Tests passing: 76/76
# Build time: 2.1 seconds
```

## Lessons from Successful CTDD Contracts

This contract incorporates proven patterns:
1. **Phase 0 Emergency Relief**: Immediate value like context compression contract
2. **Tool Helps Build Tool**: Bootstrap principle from tool-assisted development contract
3. **Measurable Time Savings**: Focus on efficiency not just technical metrics
4. **Progressive Enhancement**: Each phase accelerates the next
5. **Self-Validation**: Tools validate their own success
6. **High-Impact First**: Start with 14x oversized index.ts

**Commit**: CTDD:FC-SPLIT-002@v2-bootstrap