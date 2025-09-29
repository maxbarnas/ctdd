# CTDD DOCUMENTATION ALIGNMENT CONTRACT

## Focus Card (FC-DOC-001)
- **FC-ID**: FC-DOC-001 (Documentation-Code Alignment & Template Modernization)
- **Goal**: Align all documentation with current code reality and update CLAUDE.md template with all methodology breakthroughs using evidence-based documentation tools
- **Deliverables**:
  - Phase 0: Template CLAUDE.md updated with all 17 proven patterns + evidence-based testing intelligence breakthrough
  - Phase 1: Command documentation alignment (test-intelligence tools, help text accuracy)
  - Phase 2: Code example verification and architectural documentation updates
  - Phase 3: Methodology pattern consolidation and anti-pattern cleanup
- **Constraints**: Zero documentation debt, 100% command accuracy, bootstrap principle (use CTDD tools for documentation validation)
- **Non-goals**: Complete rewrite of methodology, changing proven patterns, over-documentation of trivial features

## Invariants (Always Check Before/After)
- **I1**: All documented commands work exactly as described (100% accuracy)
- **I2**: Template CLAUDE.md reflects all methodology breakthroughs from successful contracts
- **I3**: No duplicate or conflicting pattern documentation
- **I4**: Architecture documentation matches actual 10-module CLI structure
- **I5**: Evidence-based testing intelligence methodology fully documented with examples

## Current Documentation Debt Analysis

### 🔍 Critical Documentation Gaps:
1. **Template CLAUDE.md outdated**: 376 lines vs 679 lines current (44% methodology missing)
2. **Test-intelligence tools undocumented**: 3 major commands not in main help or methodology
3. **Evidence-based testing breakthrough missing**: Revolutionary approach from Test Technical Debt Contract
4. **Command help inconsistencies**: Several commands not visible in main help flow
5. **Architecture documentation stale**: 10-module CLI structure not documented
6. **Pattern duplication**: Anti-patterns #6 and #7 are identical, several proven patterns have overlap

### 📊 Documentation Alignment Issues:
1. **templates/claude-md-template.md**: Missing 17+ methodology breakthroughs from successful contracts
2. **Command discovery**: test-intel commands work but aren't discoverable in main workflow
3. **Methodology evolution**: Evidence-based testing intelligence represents paradigm shift but not templated
4. **Bootstrap validation**: Missing self-documentation using CTDD tools pattern
5. **Contract graduation pattern**: Template doesn't include latest graduation methodology

## Phase 0: Emergency Template Modernization (Day 1)

**Target: Template CLAUDE.md updated with all methodology breakthroughs in 2-3 hours**

### AT001: Update template with evidence-based testing intelligence breakthrough
- **Evidence**: Template CLAUDE.md includes comprehensive documentation of testing intelligence methodology with concrete examples
- **Commands**: `diff templates/claude-md-template.md CLAUDE.md | grep -c "test-intel\|evidence-based\|risk-assess"`
- **Manual effort**: 8+ hours methodology extraction → Tool-assisted: 1 hour using pattern extraction

### AT002: Add all 17 proven patterns to template
- **Evidence**: Template includes all proven patterns from contracts with concrete examples and results
- **Commands**: `grep -c "Proven Pattern" templates/claude-md-template.md` (should show 17+)
- **Manual effort**: 6+ hours pattern consolidation → Tool-assisted: 45 minutes using contract analysis

### AT003: Document 10-module CLI architecture in template
- **Evidence**: Template accurately describes all command modules and their purposes
- **Commands**: `ls src/cli/commands/*.ts | wc -l` (should match architecture doc)
- **Manual effort**: 4+ hours file analysis → Tool-assisted: 30 minutes using architecture extraction

### AT004: Remove pattern duplications and consolidate anti-patterns
- **Evidence**: No duplicate patterns, anti-patterns consolidated and numbered correctly
- **Commands**: `grep -n "❌.*incomplete loops" templates/claude-md-template.md` (should show single occurrence)

## Phase 1: Command Documentation Alignment

**Target: All commands accurately documented and discoverable**

### AT005: Document test-intelligence commands in main help flow
- **Evidence**: test-intel commands visible in main help and documented in workflow examples
- **Commands**: `node dist/index.js --help | grep -c "test-intel"` (should be > 0)
- **Verification**: `node dist/index.js test-intel --help` shows all 3 subcommands

### AT006: Verify all documented commands work as described
- **Evidence**: Every command example in documentation executes successfully
- **Commands**: Create validation script that tests all documented examples
- **Verification**: `ctdd validate-docs` passes 100% of documented commands

### AT007: Update help text for consistency and discoverability
- **Evidence**: All command help text follows consistent format and includes workflow context
- **Commands**: `node dist/index.js session --help | grep -c "workflow\|example"`
- **Verification**: Help text includes workflow guidance not just syntax

## Phase 2: Code Example and Architecture Documentation

**Target: 100% code example accuracy and current architecture documentation**

### AT008: Verify all code examples in documentation work correctly
- **Evidence**: All bash commands, npm scripts, and ctdd commands in docs execute without error
- **Commands**: Automated doc-testing script validates all examples
- **Verification**: `ctdd test-docs` shows 0 broken examples

### AT009: Update architecture documentation to reflect 10-module CLI structure
- **Evidence**: Architecture section accurately describes all 10 command modules and their relationships
- **Commands**: Architecture diagram/documentation matches `ls src/cli/commands/*.ts`
- **Verification**: Each module purpose documented with actual responsibility

### AT010: Document evidence-based testing methodology with working examples
- **Evidence**: Complete testing intelligence workflow documented with concrete commands and expected outputs
- **Commands**: `ctdd test-intel risk-assess --json | jq '.recommendations | length'` > 0
- **Verification**: All test-intel commands work and produce meaningful output

## Phase 3: Methodology Pattern Consolidation and Organization

**Target: Clean, organized methodology documentation without duplications**

### AT011: Consolidate overlapping proven patterns into clear, distinct patterns
- **Evidence**: Each proven pattern addresses distinct methodology aspect without overlap
- **Commands**: Pattern analysis shows no conceptual duplication
- **Verification**: Pattern numbering consecutive, descriptions clear and unique

### AT012: Organize anti-patterns by category and eliminate duplicates
- **Evidence**: Anti-patterns organized by category (methodology, technical, workflow) with no duplicates
- **Commands**: `grep -c "❌.*incomplete loops" CLAUDE.md` equals 1
- **Verification**: Anti-pattern numbering clean, categories logical

### AT013: Document contract graduation methodology with template examples
- **Evidence**: Template includes contract graduation pattern with examples from successful contracts
- **Commands**: Template shows graduation criteria, process, and strategic transition patterns
- **Verification**: Contract graduation process can be followed by new CTDD users

## Success Metrics & Evidence

**Manual Documentation Approach**: 20-30 hours per major methodology update
- Template updating: 8+ hours manual methodology extraction
- Command verification: 6+ hours manual testing
- Pattern consolidation: 8+ hours manual organization
- Architecture docs: 4+ hours manual analysis
- Example verification: 4+ hours manual testing

**Tool-Assisted Documentation Approach**: 4-6 hours (80%+ reduction)
- Template updating: 1 hour using pattern extraction tools
- Command verification: 45 minutes using automated doc testing
- Pattern consolidation: 1 hour using contract analysis
- Architecture docs: 30 minutes using module extraction
- Example verification: 30 minutes using doc-testing automation

**Evidence Collection**:
- Before: Template 376 lines, missing test-intel docs, duplicate patterns
- After: Template comprehensive, all commands documented, patterns organized
- Verification: `ctdd validate-docs` passes, `ctdd test-intel --help` works

## Bootstrap Self-Validation

This contract uses CTDD methodology to improve CTDD documentation:
- **Tool-assisted pattern extraction** from successful contracts
- **Evidence-based command validation** using actual command testing
- **Bootstrap documentation testing** using CTDD's own validation tools
- **Meta-learning application**: Using CTDD to document CTDD improvements

**Ultimate Validation**: New CTDD users can successfully apply methodology using only template documentation, demonstrating complete documentation-reality alignment.

## Resumption Context for Next Phase

Upon completion, this contract establishes CTDD documentation as self-maintaining through:
1. Template reflects all methodology breakthroughs automatically
2. Command documentation validated through automated testing
3. Pattern organization enables clear methodology evolution
4. Evidence-based testing intelligence available for all future projects

**Next Strategic Challenge**: Apply updated CTDD methodology to external projects, validating template completeness and methodology transferability.