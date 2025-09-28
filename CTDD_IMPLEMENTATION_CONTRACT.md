# CTDD Contract: Codebase Improvement Implementation

## Focus Card (FC-IMPROVE-001)

- **FC-ID**: FC-IMPROVE-001
- **Goal**: Transform CTDD from prototype to production-ready testing framework
- **Deliverables**: [Test suite, Error handling, Enhanced plugins, Better CLI UX, Documentation]
- **Constraints**: [Maintain backward compatibility, No breaking changes without migration, Performance must not degrade]
- **Non-goals**: [Rewrite from scratch, Change core CTDD methodology, Add UI framework]

## Invariants

- **I1**: All existing CLI commands must continue working exactly as before
- **I2**: Existing .ctdd/ file formats must remain compatible (with optional enhancements)
- **I3**: Test coverage must be ≥90% for all new and modified code
- **I4**: No performance regression - new features must not slow existing functionality
- **I5**: All errors must provide actionable error messages with error codes
- **I6**: Plugin system must remain backward compatible during transition
- **I7**: Build process must complete in <30 seconds
- **I8**: All async operations must have proper timeout handling

## CUTs (Context Unit Tests)

### Phase 1: Testing Foundation
- **AT1**: `npm test` runs complete test suite in <10 seconds
- **AT2**: Test coverage report shows ≥90% line coverage
- **AT3**: All core functions (loadSpec, computeCommitId, applyDelta) have unit tests
- **AT4**: Integration tests verify CLI commands work end-to-end
- **AT5**: E2E tests validate full CTDD workflow (init → pre → post → delta)

### Phase 2: Error Handling
- **AT6**: All catch blocks provide specific error messages with codes
- **AT7**: Invalid plugin configurations show clear validation errors
- **AT8**: Missing files produce helpful "did you mean" suggestions
- **AT9**: All errors include context (file paths, line numbers, suggested fixes)
- **AT10**: Error logging writes structured JSON to .ctdd/logs/errors.json

### Phase 3: Enhanced Plugin System
- **AT11**: Async plugins execute in parallel and complete in <5 seconds total
- **AT12**: Plugin dependency resolution works (plugin B waits for plugin A)
- **AT13**: Plugin performance metrics appear in `ctdd checks --metrics`
- **AT14**: Plugin timeout handling prevents hanging operations
- **AT15**: Plugin caching reduces repeat execution time by 70%

### Phase 4: Developer Experience
- **AT16**: `ctdd init --interactive` creates spec through Q&A workflow
- **AT17**: Shell autocomplete works for all commands and options
- **AT18**: `ctdd status --progress` shows visual progress bars
- **AT19**: `ctdd diff` shows before/after comparison for deltas
- **AT20**: `ctdd rollback` undoes last applied delta

### Phase 5: Type Safety & Validation
- **AT21**: All plugin configs validate against schemas at load time
- **AT22**: Runtime type checking catches JSON schema violations
- **AT23**: Circular reference detection prevents infinite loops
- **AT24**: Schema versioning allows migration between CTDD versions
- **AT25**: TypeScript strict mode compiles without warnings

**Commit**: CTDD:FC-IMPROVE-001@v1

## Implementation Phases

### Phase 1: Testing Foundation (Days 1-5)
**Pre-Check**:
- ✓ I1: Will not modify existing CLI behavior
- ✓ I3: Will achieve ≥90% test coverage
- ✓ I7: Will maintain fast build times
- **Targeting**: AT1, AT2, AT3, AT4, AT5

**Tasks**:
1. Add Vitest testing framework
2. Create test utilities and fixtures
3. Write unit tests for core.ts functions
4. Write integration tests for CLI commands
5. Create E2E test workflows
6. Set up coverage reporting

### Phase 2: Error Handling (Days 6-10)
**Pre-Check**:
- ✓ I5: Will provide actionable error messages
- ✓ I8: Will add timeout handling
- **Targeting**: AT6, AT7, AT8, AT9, AT10

**Tasks**:
1. Create CTDDError class hierarchy
2. Replace empty catch blocks
3. Add input validation with helpful messages
4. Implement structured error logging
5. Create error recovery mechanisms

### Phase 3: Enhanced Plugin System (Days 11-18)
**Pre-Check**:
- ✓ I4: Will not degrade performance
- ✓ I6: Will maintain plugin compatibility
- **Targeting**: AT11, AT12, AT13, AT14, AT15

**Tasks**:
1. Add async plugin interface
2. Implement plugin dependency resolution
3. Add performance metrics collection
4. Create plugin caching system
5. Add timeout handling for plugins

### Phase 4: Developer Experience (Days 19-23)
**Pre-Check**:
- ✓ I1: Will not break existing commands
- **Targeting**: AT16, AT17, AT18, AT19, AT20

**Tasks**:
1. Create interactive init workflow
2. Add shell completion scripts
3. Implement progress indicators
4. Create delta diff viewer
5. Add rollback functionality

### Phase 5: Type Safety & Validation (Days 24-28)
**Pre-Check**:
- ✓ I2: Will maintain file format compatibility
- ✓ I5: Will improve error messages
- **Targeting**: AT21, AT22, AT23, AT24, AT25

**Tasks**:
1. Add runtime schema validation
2. Implement circular reference detection
3. Create schema versioning system
4. Enable TypeScript strict mode
5. Add migration tools

## Quality Gates

Each phase must pass all CUTs before proceeding:

### Phase 1 Gate
```bash
npm test                    # AT1: Tests pass
npm run test:coverage      # AT2: Coverage ≥90%
npm run test:integration   # AT4: CLI tests pass
npm run test:e2e          # AT5: Full workflow works
```

### Phase 2 Gate
```bash
# Trigger all error conditions and verify helpful messages
ctdd validate-pre invalid.json  # AT7: Clear validation errors
ctdd status (no .ctdd/)         # AT8: Helpful suggestions
grep "CTDDError" dist/*.js      # AT6: Structured errors
```

### Phase 3 Gate
```bash
ctdd checks --metrics      # AT13: Performance data shown
ctdd checks --timeout=1s   # AT14: Timeout handling works
time ctdd checks           # AT11: Async execution <5s
```

### Phase 4 Gate
```bash
ctdd init --interactive    # AT16: Q&A workflow
ctdd diff last-delta.json  # AT19: Before/after shown
ctdd rollback             # AT20: Undo works
```

### Phase 5 Gate
```bash
tsc --noEmit --strict     # AT25: TypeScript strict mode
ctdd migrate --from=0.1   # AT24: Version migration
```

## Risk Mitigation

### Backward Compatibility
- All changes must pass `npm run test:compatibility`
- Migration guides for any breaking changes
- Feature flags for experimental functionality
- Gradual rollout of new features

### Performance Protection
- Benchmark suite runs on every change
- Alert if any operation takes >2x baseline
- Memory usage monitoring
- Plugin execution profiling

### Quality Assurance
- All code reviewed against CUTs
- Pre-commit hooks run tests and linting
- Documentation updated with each feature
- User acceptance testing for UX changes

## Success Criteria

**Final Post-Check** (All CUTs must PASS):
- ✓ AT1-AT25: All acceptance tests passing
- ✓ I1-I8: All invariants maintained
- Test coverage ≥90%
- No performance regressions
- All error paths tested
- Documentation complete

**Evidence Collection**:
- `npm run test:all` - Full test suite results
- `npm run benchmark` - Performance comparison
- `ctdd init --interactive` - UX validation
- `ctdd checks --metrics` - Plugin performance
- Error trigger tests - Error message quality

This contract ensures CTDD becomes a production-ready framework while maintaining the lightweight, focused methodology that makes it valuable.