# CTDD Contract: Template Extraction to Files

## Focus Card (FC-TEMPLATE-001)

- **FC-ID**: FC-TEMPLATE-001
- **Goal**: Extract all hardcoded templates from source code to template files for better maintainability and customization
- **Deliverables**: [Template files in .ctdd/templates/, Updated core.ts without hardcoded templates, Template loading system]
- **Constraints**: [Must maintain backward compatibility, Must handle missing templates gracefully, Must work on all platforms, No breaking changes to existing API]
- **Non-goals**: [Complex template engines, Dynamic template generation, Network-based templates]

## Invariants

- **I1**: All 76 tests must continue to pass
- **I2**: `ctdd init` must always succeed even if templates are missing
- **I3**: Template loading must be synchronous for consistency
- **I4**: Templates must be valid JSON that conforms to Spec schema
- **I5**: Source code must not contain any hardcoded project templates

## CUTs (Context Unit Tests)

### Template Extraction
- **AT52**: All hardcoded templates removed from src/core.ts
- **AT53**: Generic project template exists at .ctdd/templates/generic-project.json
- **AT54**: CSV parser example template preserved at .ctdd/templates/csv-parser-example.json

### Template Loading System
- **AT55**: Template loader function loads templates from files
- **AT56**: Template loader falls back to minimal template if file missing
- **AT57**: Template loader validates loaded JSON against Spec schema

### Integration
- **AT58**: `ctdd init` uses file-based templates instead of hardcoded ones
- **AT59**: `ctdd init --template <name>` allows template selection
- **AT60**: All 76 existing tests pass with new template system

### User Experience
- **AT61**: Clear error messages when template is invalid or corrupted
- **AT62**: Template directory structure documented in README
- **AT63**: Users can add custom templates to templates/ directory

**Commit**: CTDD:FC-TEMPLATE-001@v1

## Implementation Plan

### Pre-Check Phase
1. Verify current state - tests passing, init works
2. Identify all hardcoded templates in source
3. Plan extraction strategy

### Implementation Phase
1. Create template files from hardcoded content
2. Implement template loader with validation
3. Update initProject to use loader
4. Add template selection option to CLI

### Post-Check Phase
1. Verify all tests pass
2. Test template loading edge cases
3. Document template system

## Success Criteria

All CUTs (AT52-AT63) must PASS with evidence:
- No hardcoded templates in source code
- Templates loadable from files
- Graceful fallback behavior
- Full backward compatibility maintained