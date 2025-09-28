# CTDD Contract: Complete Template System Migration

## Focus Card (FC-TEMPLATE-SYSTEM-001)

- **FC-ID**: FC-TEMPLATE-SYSTEM-001
- **Goal**: Eliminate all hardcoded templates from source code and complete migration to file-based template system
- **Deliverables**: [Template files for all content, Updated template loading system, Clean source code without hardcoded templates]
- **Constraints**: [Must maintain all existing functionality, Must preserve template content accuracy, All tests must pass, Backward compatibility required]
- **Non-goals**: [Complex templating engines, Network-based templates, Dynamic template generation]

## Invariants

- **I1**: No hardcoded template content remains in source code
- **I2**: All template functionality works identically to current implementation
- **I3**: Template files are the single source of truth for all content
- **I4**: All 76 tests continue to pass after migration
- **I5**: Template loading handles missing files gracefully with clear error messages

## CUTs (Context Unit Tests)

### Hardcoded Template Elimination
- **AT101**: Remove hardcoded CLAUDE.md template from src/index.ts (~85 lines)
- **AT102**: Remove hardcoded session-state.json template from src/index.ts (~30 lines)
- **AT103**: Create templates/claude-md-template.md file with current content
- **AT104**: Create templates/session-state-template.json file with current structure

### Template Loading System Enhancement
- **AT105**: Extend loadTemplate() to handle non-spec template types (markdown, json)
- **AT106**: Create loadMarkdownTemplate() function for CLAUDE.md template
- **AT107**: Create loadJsonTemplate() function for session-state.json template
- **AT108**: Update init --full command to use file-based templates exclusively

### Functionality Preservation
- **AT109**: ctdd init --full creates identical CLAUDE.md from template file
- **AT110**: ctdd init --full creates identical session-state.json from template file
- **AT111**: Template substitution works (dates, project names, etc.)
- **AT112**: Error handling works when template files are missing

### System Integrity
- **AT113**: All 76 tests pass with file-based template system
- **AT114**: Template directory contains all necessary template files
- **AT115**: Source code contains no hardcoded template strings
- **AT116**: Fresh project initialization works identically

## Implementation Strategy

### Phase 1: Template File Creation (AT101-104)
1. Extract hardcoded CLAUDE.md template to templates/claude-md-template.md
2. Extract hardcoded session-state template to templates/session-state-template.json
3. Preserve exact content and structure for compatibility

### Phase 2: Template Loading Enhancement (AT105-108)
1. Create generic template loading functions for different file types
2. Add template variable substitution support (dates, project names)
3. Update init command to use file-based templates
4. Implement graceful error handling for missing templates

### Phase 3: Source Code Cleanup (AT109-116)
1. Remove hardcoded template strings from source code
2. Replace with file-based template loading calls
3. Test all functionality for equivalence
4. Validate error handling and edge cases

## Architecture Benefits

- **Maintainability**: Template updates require only file changes, no rebuilds
- **Consistency**: Single source of truth for all template content
- **Customization**: Users can modify templates without touching source code
- **DRY Principle**: Eliminates template content duplication
- **Version Control**: Template changes tracked separately from code logic