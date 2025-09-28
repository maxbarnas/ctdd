# CTDD Contract: Project-Agnostic Tool Fix

## Focus Card (FC-AGNOSTIC-001)

- **FC-ID**: FC-AGNOSTIC-001
- **Goal**: Fix CTDD tool to be project-agnostic instead of hardcoded to its own development
- **Deliverables**: [Updated check-at command, Updated phase-status command, Project-specific validation framework, LLM agent customization instructions]
- **Constraints**: [Must maintain existing functionality for CTDD tool project, Cannot break current 76/76 tests, Must work for any project using CTDD, Tool must guide users on how to customize for their project]
- **Non-goals**: [Complex automation systems, Over-engineering validation framework, Breaking existing workflow, Removing tool-assisted development features]

## Invariants

- **I1**: All existing CTDD tool functionality must remain intact (76/76 tests passing)
- **I2**: Commands must work correctly in any project directory with .ctdd/ setup
- **I3**: Tool must read project-specific data from .ctdd/spec.json instead of hardcoded values
- **I4**: Clear guidance must be provided for customizing validation in new projects
- **I5**: Generic validation (npm test, npm build) must work universally
- **I6**: Project-specific validation must be optional and extensible
- **I7**: Error messages must be helpful when project lacks custom validation

## CUTs (Context Unit Tests)

### Core Functionality Fix
- **AT40**: `ctdd check-at --all` reads CUTs from project's .ctdd/spec.json instead of hardcoded AT16-AT38
- **AT41**: `ctdd check-at <AT_ID>` validates specific acceptance criteria from project spec
- **AT42**: `ctdd phase-status` shows generic project progress instead of hardcoded CTDD tool phases

### Project-Specific Validation Framework
- **AT43**: Tool supports custom validation scripts in .ctdd/validation/ directory
- **AT44**: Tool provides clear instructions when no custom validation exists
- **AT45**: Custom validation scripts can return {passed: boolean, message: string, evidence?: string}

### Backward Compatibility
- **AT46**: CTDD tool project itself still works with tool commands (self-validation)
- **AT47**: All 76 tests continue to pass after changes
- **AT48**: Enhanced `ctdd init --full` creates template validation instructions

### User Experience
- **AT49**: Clear error messages when project spec is missing or invalid
- **AT50**: Helpful guidance for setting up project-specific validations
- **AT51**: Tool demonstrates how to customize by example in its own validation

**Commit**: CTDD:FC-AGNOSTIC-001@v1

## Implementation Plan

### Phase 1: Core Command Fixes
1. Update `check-at --all` to read from spec.json CUTs
2. Update `check-at <AT_ID>` to find specific CUT in project spec
3. Update `phase-status` to be generic instead of hardcoded

### Phase 2: Validation Framework
1. Create .ctdd/validation/ directory support
2. Add custom validation script loading
3. Provide fallback to generic validations

### Phase 3: Documentation & Examples
1. Update CLAUDE.md with customization instructions
2. Create example validation scripts for CTDD tool project
3. Update `init --full` to include validation templates

## Success Criteria

All CUTs (AT40-AT51) must PASS with concrete evidence:
- Tool works in any project directory
- Commands read from project-specific files
- Custom validation framework functional
- Clear user guidance provided
- Backward compatibility maintained