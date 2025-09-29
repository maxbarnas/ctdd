# CTDD TEST TECHNICAL DEBT CONTRACT

## Focus Card (FC-TEST-001)
- **FC-ID**: FC-TEST-001 (Test Technical Debt Elimination)
- **Goal**: Eliminate all failing tests and establish comprehensive coverage for critical/complex code paths using tool-assisted testing methodology
- **Deliverables**:
  - Phase 0: Fix all 12 failing tests (string matching issues)
  - Phase 1: Add comprehensive tests for session management (1627 lines uncovered)
  - Phase 2: Test plugin execution system and error handling
  - Phase 3: Server and CLI command coverage
- **Constraints**: Zero regressions, 95%+ coverage for critical paths, bootstrap principle (use tools to build tests)
- **Non-goals**: 100% line coverage, testing trivial getters/setters, over-engineering test infrastructure

## Invariants (Always Check Before/After)
- **I1**: All tests must pass (currently 12/76 failing ❌ → target 76/76 ✅)
- **I2**: Critical code paths covered (session mgmt, plugin execution, error handling)
- **I3**: No false positives or flaky tests (test reliability > 99%)
- **I4**: Test execution time reasonable (< 60 seconds for full suite)
- **I5**: Bootstrap principle: Use CTDD tools to validate test improvements

## Current Test Debt Analysis

### 🔍 Failed Test Categories:
1. **String matching inconsistencies (8 tests)**: "passed" vs "successful", "Recorded" vs detailed messages
2. **JSON parsing errors (2 tests)**: Invalid JSON handling in plugin tests
3. **File output issues (2 tests)**: File writing behavior vs expectations

### 📊 Coverage Gaps (High-Risk Areas):
1. **src/cli/commands/session.ts (1627 lines)**: Session state management, todo sync, AT detection
2. **src/core.ts (870 lines)**: Spec operations, validation, commit ID generation
3. **src/plugins/executor.ts (299 lines)**: Plugin execution, timeout handling, result merging
4. **src/errors.ts (259 lines)**: Error handling, context wrapping, logging
5. **23 CLI command files**: Complex exported functions with minimal coverage

## Phase 0: Emergency Quick Wins (Fix Immediate Failures)

**Target: 100% test pass rate in 2-4 hours**

### AT001: Fix string matching test failures
- **Evidence**: All CLI integration tests pass with correct string expectations
- **Commands**: `npm test -- --testPathPattern=cli.test.ts`
- **Manual effort**: 4+ hours of debugging → Tool-assisted: 30 minutes

### AT002: Fix JSON parsing test failures
- **Evidence**: Plugin timeout tests handle invalid JSON gracefully
- **Commands**: `npm test -- --testPathPattern=plugin-timeouts.test.ts`

### AT003: Fix E2E workflow test failures
- **Evidence**: All E2E workflow tests pass without string mismatches
- **Commands**: `npm test -- --testPathPattern=full-workflow.test.ts`

## Phase 1: Session Management Testing (Highest Risk)

**Target: Comprehensive coverage for 1627-line session.ts file**

### AT004: Session state management tests
- **Evidence**: Load/save session state with edge cases (corrupted JSON, missing files)
- **Coverage**: `loadSessionState()`, `saveSessionState()`, error handling
- **Risk**: Session corruption could break entire CTDD workflow

### AT005: Todo synchronization tests
- **Evidence**: Todo sync commands work reliably with various todo states
- **Coverage**: `syncTodos()`, `loadTodos()`, AT detection patterns
- **Critical**: Todo-AT sync is core to CTDD methodology

### AT006: Session resumption tests
- **Evidence**: Resume command provides complete context in <30 seconds
- **Coverage**: Context generation, status analysis, architecture summaries
- **Bootstrap validation**: Tool helps validate its own resumption feature

## Phase 2: Plugin System & Error Handling

### AT007: Plugin execution reliability tests
- **Evidence**: All plugin types (grep, file_exists, jsonpath, multi_grep, glob) work correctly
- **Coverage**: Timeout handling, invalid plugin types, malformed configurations
- **Risk**: Plugin failures could break AT validation

### AT008: Error handling and logging tests
- **Evidence**: All error codes (E001-E999) properly handled with actionable messages
- **Coverage**: `CTDDError`, `withErrorContext`, error log entry creation
- **Critical**: Error handling affects debugging and user experience

### AT009: Validation and schema tests
- **Evidence**: Zod schema validation works for all JSON structures
- **Coverage**: Circular reference detection, safe JSON parsing, schema versioning
- **Risk**: Invalid specs could corrupt project state

## Phase 3: Server & CLI Command Coverage

### AT010: Server component tests
- **Evidence**: HTTP server, routes, middleware, UI serve correctly
- **Coverage**: RESTful API endpoints, plugin integration, web UI functionality
- **Risk**: Server failures break HTTP-based agent integration

### AT011: CLI command reliability tests
- **Evidence**: All 23 CLI command modules work correctly with edge cases
- **Coverage**: File operations, project analysis, change management utilities
- **Bootstrap**: Use CTDD validation tools to test CTDD command reliability

## Success Metrics & Evidence

### Quantitative Targets:
- Test failures: 12 → 0 (100% pass rate)
- Critical path coverage: ~30% → 95%+
- Test execution time: Current ~48s → maintain <60s
- Manual test debugging: 15+ hours → <2 hours (87% reduction)

### Verification Commands:
```bash
npm test                           # All tests pass (76/76)
npm run test:coverage             # Coverage report shows 95%+ critical paths
ctdd check-at --all               # All ATs validate successfully
node dist/index.js session resume # Resumption works in <30 seconds
```

**Bootstrap Validation:** Use CTDD tools to validate the test improvements themselves - tests should help build better tests.

## Anti-Patterns to Avoid

❌ **Fixing tests without understanding root cause** (quick string replacements)
❌ **Over-testing trivial code** (simple getters, constant definitions)
❌ **Ignoring flaky tests** (intermittent failures hide real issues)
❌ **Manual test debugging** (use tools to identify patterns in failures)
❌ **Testing implementation details** (test behavior, not internal structure)

## Tool-Assisted Approach

### Phase 0 Tools (Build These First):
- Test failure analyzer: Categorize and pattern-match common failures
- Coverage gap identifier: Find untested critical paths automatically
- Test template generator: Bootstrap test files for complex modules

### Phase 1+ Tools (Use Phase 0 tools):
- Mock data generator: Create realistic test data for session states
- Error scenario generator: Systematically test error conditions
- Test validation suite: Ensure tests actually catch regressions

---

*This contract follows CTDD methodology with measurable time savings, bootstrap principles, and focuses on high-impact testing improvements rather than achieving arbitrary coverage percentages.*