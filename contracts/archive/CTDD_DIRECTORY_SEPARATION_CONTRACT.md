# CTDD Contract: Separate Tool Assets from Project State

## Focus Card (FC-SEPARATION-001)

- **FC-ID**: FC-SEPARATION-001
- **Goal**: Properly separate tool assets (templates) from project state (.ctdd/) to fix architectural confusion
- **Deliverables**: [Templates moved to tool directory, Clean .ctdd/ with only project state, Template resolution from tool location]
- **Constraints**: [Must not break existing projects, Must work with npm installation, Must handle missing templates gracefully]
- **Non-goals**: [Complex asset management, Network template fetching, Database storage]

## Invariants

- **I1**: All 76 tests must continue to pass
- **I2**: `.ctdd/` directory contains ONLY project-specific files
- **I3**: Templates ship with the tool, not with each project
- **I4**: `ctdd init` works correctly whether installed globally or locally
- **I5**: Existing projects continue to function without migration
- **I6**: Template loading works from tool installation directory

## CUTs (Context Unit Tests)

### Directory Structure
- **AT64**: Templates moved from `.ctdd/templates/` to `templates/` in tool root
- **AT65**: `.ctdd/` directory contains only: spec.json, state.json, session-state.json, logs/, plugins/, validation/, archive/
- **AT66**: Tool templates accessible from npm package installation

### Template Resolution
- **AT67**: Template loader resolves templates from tool installation directory
- **AT68**: Template loader handles npm global installation path
- **AT69**: Template loader handles npm local installation path
- **AT70**: Template loader handles development environment (running from source)

### Project Cleanliness
- **AT71**: New projects created with `ctdd init` don't get templates copied to `.ctdd/`
- **AT72**: `.ctdd/` folder only contains project-specific state and configuration
- **AT73**: Clear separation between tool assets and project data

### Migration & Compatibility
- **AT74**: Existing projects with templates in `.ctdd/templates/` continue to work
- **AT75**: Tool prefers tool-directory templates over project templates
- **AT76**: Documentation updated to reflect new structure

**Commit**: CTDD:FC-SEPARATION-001@v1

## Implementation Plan

### Phase 1: Move Templates
1. Create `templates/` in tool root
2. Move all templates from `.ctdd/templates/` to `templates/`
3. Update `.gitignore` to not ignore tool templates

### Phase 2: Update Template Resolution
1. Implement `getToolTemplatesDir()` to find tool installation
2. Update `loadTemplate()` to look in tool directory first
3. Handle npm global, npm local, and development scenarios

### Phase 3: Clean Project Structure
1. Remove templates from project initialization
2. Update documentation about directory structure
3. Test all installation scenarios

## Success Criteria

- Templates load from tool directory, not project directory
- `.ctdd/` only contains project state
- All installation methods work (global, local, dev)
- Clear architectural separation achieved