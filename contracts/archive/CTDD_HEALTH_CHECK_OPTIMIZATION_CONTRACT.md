# CTDD Contract: Health Check Performance Optimization

## Focus Card (FC-HEALTH-001)

- **FC-ID**: FC-HEALTH-001
- **Goal**: Optimize health check performance from 43+ seconds to under 2 seconds for rapid developer feedback
- **Deliverables**: [Fast health check implementation, Lightweight validation approach, Separate deep validation command]
- **Constraints**: [Must maintain accuracy, Must detect real issues, Must work across platforms, Backward compatibility for existing commands]
- **Non-goals**: [Complex health monitoring, Network-based checks, Detailed performance profiling]

## Invariants

- **I1**: Health check must complete in under 2 seconds in normal conditions
- **I2**: Health check must detect genuine project issues (missing files, broken spec)
- **I3**: All 76 tests must continue to pass with optimization changes
- **I4**: Deep validation remains available via separate command
- **I5**: No breaking changes to existing command interfaces

## CUTs (Context Unit Tests)

### Performance Optimization
- **AT77**: `ctdd check-at --all` completes in under 2 seconds (vs current 43+ seconds)
- **AT78**: Health check validates spec.json existence and basic structure only
- **AT79**: Health check skips full test suite execution for speed
- **AT80**: Health check skips full build process for rapid feedback

### Accuracy and Reliability
- **AT81**: Health check detects missing .ctdd/spec.json file
- **AT82**: Health check detects malformed spec.json structure
- **AT83**: Health check validates basic project structure (.ctdd/ directory)
- **AT84**: Health check reports clear status (healthy/unhealthy) with evidence

### Enhanced Validation Options
- **AT85**: New `ctdd check-at --deep` option runs full test suite + build
- **AT86**: `ctdd validate` command provides comprehensive project validation
- **AT87**: Performance improvement documented in CLAUDE.md
- **AT88**: All existing functionality preserved with new performance

## Implementation Strategy

### Phase 1: Lightweight Health Check (AT77-80)
1. Replace `npm test` with basic spec validation
2. Replace `npm run build` with TypeScript syntax check only
3. Add file existence checks (.ctdd/, spec.json, state.json)
4. Measure and validate <2 second completion time

### Phase 2: Enhanced Validation Options (AT85-88)
1. Add `--deep` flag for full validation when needed
2. Enhance `ctdd validate` for comprehensive checks
3. Update documentation and help text
4. Maintain backward compatibility

## Success Metrics

- **Speed**: Health check <2 seconds (95%+ improvement)
- **Accuracy**: Detects real issues without false positives
- **Usability**: Developers get rapid feedback for common workflow
- **Completeness**: Deep validation available when needed