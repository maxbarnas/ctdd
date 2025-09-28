# CTDD Contract: State File Cleanup

## Focus Card (FC-CLEANUP-001)

- **FC-ID**: FC-CLEANUP-001
- **Goal**: Clean up stale state management files and consolidate to single source of truth
- **Deliverables**: [Remove redundant state.json and todos.json, Verify graceful handling, Update documentation]
- **Constraints**: [Must not break existing functionality, Must maintain backward compatibility, All tests must pass]
- **Non-goals**: [Complex state migration, Preserving stale data, Multi-file state management]

## Invariants

- **I1**: All 76 tests must continue to pass after cleanup
- **I2**: Commands must handle missing legacy state files gracefully
- **I3**: session-state.json remains as single source of truth
- **I4**: No breaking changes to existing API or workflows
- **I5**: System must work for fresh project initialization

## CUTs (Context Unit Tests)

### File Cleanup
- **AT89**: Remove stale .ctdd/state.json (4+ hours old, empty history)
- **AT90**: Remove stale .ctdd/todos.json (outdated Bootstrap Phase 2 content)
- **AT91**: Keep session-state.json as authoritative state source
- **AT92**: Verify no references to removed files in documentation

### Graceful Handling
- **AT93**: ctdd status works without legacy state.json file
- **AT94**: Core functions handle missing state files gracefully
- **AT95**: Fresh project initialization unaffected by cleanup
- **AT96**: All existing commands continue to function

### System Integrity
- **AT97**: All 76 tests pass after state file removal
- **AT98**: No error messages about missing legacy files
- **AT99**: session-state.json provides comprehensive project state
- **AT100**: Clean project directory structure achieved

## Implementation Strategy

### Phase 1: Verification (AT93-96)
1. Test current system behavior with missing state files
2. Verify error handling in core functions
3. Confirm session-state.json provides complete functionality

### Phase 2: Cleanup (AT89-92)
1. Remove stale state.json and todos.json files
2. Update any documentation references
3. Verify clean project structure

### Phase 3: Validation (AT97-100)
1. Run full test suite to ensure no regressions
2. Test fresh project initialization
3. Confirm all commands work properly

## Success Metrics

- **Simplicity**: Single state file (session-state.json) manages all state
- **Reliability**: All tests pass, no error messages about missing files
- **Cleanliness**: Project directory contains only active, used files
- **Functionality**: All existing workflows continue to work seamlessly