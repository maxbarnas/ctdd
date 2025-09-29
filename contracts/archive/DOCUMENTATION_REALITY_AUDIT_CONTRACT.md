# CTDD DOCUMENTATION REALITY AUDIT CONTRACT

## Focus Card (FC-AUDIT-001)
- **FC-ID**: FC-AUDIT-001 (Critical Documentation-Reality Alignment Before Public Release)
- **Goal**: Eliminate all documentation-reality gaps to ensure 100% accuracy and prevent external user confusion using evidence-based documentation validation
- **Deliverables**:
  - Phase 0: Emergency workflow realignment (README commands must work as documented)
  - Phase 1: Terminology consistency audit (.ctdd/spec.json vs contracts/ evolution)
  - Phase 2: Command discovery and workflow validation
  - Phase 3: Professional quality assurance before external exposure
- **Constraints**: Zero broken commands, 100% workflow accuracy, principle of least astonishment compliance
- **Non-goals**: Major methodology changes, backward breaking changes, over-documentation of working features

## Invariants (Always Check Before/After)
- **I1**: Every command mentioned in README works exactly as documented
- **I2**: Workflow described in README matches actual development patterns
- **I3**: .ctdd/spec.json alignment with current methodology (or deprecation if obsolete)
- **I4**: Terminology consistency throughout all documentation
- **I5**: External users can follow documentation without confusion or dead ends

## Critical Reality Gaps Identified

### 🚨 **Gap 1: Broken Workflow Commands (CRITICAL)**
**Problem**: README documents `npx ctdd pre > .ctdd/pre_prompt.txt` which generates traditional CTDD prompt expecting CUTs/Invariants JSON format, but our current methodology uses Focus Card contracts with AT## acceptance criteria.

**Evidence**:
- `node dist/index.js pre` outputs: "Return JSON with shape: {..., 'target_cuts': ['AT1','AT3'], ...}"
- Current contracts use AT001, AT002 format, not AT1, AT3
- No active contracts use the CUTs/Invariants workflow described

**Impact**: **CRITICAL** - External users following README will get confused by non-working workflow

### 🚨 **Gap 2: Spec.json vs Contract Evolution (HIGH)**
**Problem**: .ctdd/spec.json contains FC-CTDD-TOOL-001 with AT1-AT51 format, but evolved contracts use AT001+ format and different structure.

**Evidence**:
- spec.json: "AT1", "AT16", "AT17", etc.
- Recent contracts: "AT001", "AT002", "AT003", etc.
- Tools like `ctdd check-at --all` read from spec.json but may not align with current workflow

**Impact**: **HIGH** - Tool behavior vs documentation mismatch

### 🚨 **Gap 3: Terminology Confusion (MEDIUM)**
**Problem**: README uses "CUTs (Context Unit Tests)" terminology but current methodology evolved to "acceptance criteria" language.

**Evidence**:
- README: "CUTs: AT1, AT2, AT3"
- Current contracts: "acceptance criteria AT001, AT002"
- Mixed terminology throughout documentation

**Impact**: **MEDIUM** - Professional credibility and user confusion

## Phase 0: Emergency Workflow Realignment (Priority 1)

**Target: Fix broken README workflow commands in <2 hours**

### AT001: Verify and document actual working workflow
- **Evidence**: README workflow commands work exactly as described with current methodology
- **Commands**: Test every command mentioned in README quick start
- **Verification**: External user can follow README from start to finish without errors

### AT002: Align command examples with current patterns
- **Evidence**: All README examples use current contract format (AT001+ not AT1+)
- **Commands**: Update all command examples to match evolved methodology
- **Verification**: Examples match actual current project patterns

### AT003: Remove or fix pre/post workflow documentation
- **Evidence**: Either pre/post commands work with current contracts OR they're removed/marked as legacy
- **Commands**: Decide if pre/post workflow should be deprecated or updated
- **Verification**: No broken workflow paths in documentation

## Phase 1: Spec.json vs Contracts Alignment (Priority 2)

**Target: Resolve .ctdd/spec.json relevance and alignment**

### AT004: Determine .ctdd/spec.json current role
- **Evidence**: Clear decision on whether spec.json is current methodology or legacy
- **Commands**: Check what tools actually use spec.json vs contracts/
- **Verification**: Tools and documentation aligned on single source of truth

### AT005: Update or deprecate spec.json appropriately
- **Evidence**: Either spec.json updated to current patterns OR clearly marked legacy with migration path
- **Commands**: If keeping: update to AT001+ format. If deprecating: add migration notes
- **Verification**: No confusion between spec.json and contracts/ workflows

## Phase 2: Command Discovery and Validation (Priority 3)

**Target: Every documented command works perfectly**

### AT006: Full README command validation
- **Evidence**: Every single command in README tested and works exactly as documented
- **Commands**: Systematic testing of all workflow examples
- **Verification**: External user test - can someone follow README end-to-end?

### AT007: Command discovery improvements
- **Evidence**: Users can discover all available commands through documented paths
- **Commands**: Ensure help system exposes all documented functionality
- **Verification**: No "hidden" commands that work but aren't discoverable

## Phase 3: Professional Quality Assurance

**Target: External user confidence and professional credibility**

### AT008: Terminology consistency audit
- **Evidence**: Consistent terminology throughout all documentation (CUTs vs acceptance criteria decision)
- **Commands**: Global find/replace for terminology alignment
- **Verification**: Professional presentation without internal terminology confusion

### AT009: External user validation
- **Evidence**: Documentation passes "fresh eyes" test for clarity and accuracy
- **Commands**: External perspective review of updated documentation
- **Verification**: New user can understand and apply methodology without gaps

## Success Metrics & Evidence

**Manual Documentation Fixing**: 12-16 hours
- Command testing: 4+ hours trial and error
- Workflow alignment: 6+ hours methodology understanding
- Quality assurance: 4+ hours external perspective review
- Risk: Missing critical gaps, creating new inconsistencies

**Evidence-Based Documentation Audit**: 4-6 hours (75% reduction)
- Gap identification: 1 hour systematic analysis (COMPLETED)
- Priority fixing: 2 hours focusing on critical gaps first
- Validation testing: 1-2 hours automated verification
- Quality assurance: 1 hour professional review

**Evidence Collection**:
- Before: README workflow broken, spec.json unclear, terminology mixed
- After: 100% working commands, clear methodology, professional consistency
- Verification: External user can successfully apply methodology

## Bootstrap Self-Validation

This contract uses CTDD methodology to fix CTDD documentation:
- **Evidence-based approach**: Identified specific gaps before fixing
- **Priority-based fixing**: Critical workflow gaps first, terminology cleanup second
- **Tool-assisted validation**: Use own commands to test own documentation
- **Meta-methodology**: Using documentation audit to improve documentation audit tools

**Ultimate validation**: Successful external user onboarding proves documentation accuracy and methodology transferability.

## Immediate Next Actions

1. **Test every README command** (30 minutes) - systematic verification
2. **Fix broken workflow paths** (60 minutes) - make examples work
3. **Resolve spec.json question** (30 minutes) - current vs legacy decision
4. **Professional quality check** (30 minutes) - external user perspective

**Critical Success Criterion**: External user following README experiences zero confusion or broken commands.