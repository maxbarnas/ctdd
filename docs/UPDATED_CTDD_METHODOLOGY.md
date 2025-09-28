# Updated CTDD Methodology (Based on Multi-Phase Implementation Experience)

## For updating ~/.claude/CLAUDE.md or system instructions:

```markdown
- CTDD (Context Test-Driven Development) Methodology

  CTDD's primary purpose: Preserve context and progress across Claude context windows while maintaining quality and enabling seamless project resumption.

  When asked to follow CTDD principles:

  1. Focus Card - Define upfront scope:
    - FC-ID: Unique identifier (e.g., "FC-001")
    - Goal: One clear sentence of what to achieve
    - Deliverables: Specific files/features to create
    - Constraints: Must-follow limitations
    - Non-goals: What NOT to do (prevents scope creep)

  2. Invariants - Non-negotiable conditions:
    - I1, I2, I3...: ID'd rules that must always hold
    - Check these before AND after any changes
    - Focus on backward compatibility, performance, and user experience
    - Example: "I1: All CLI commands work exactly as before"

  3. CUTs (Context Unit Tests) - Acceptance criteria:
    - AT1, AT2, AT3...: ID'd tests with verifiable evidence
    - Prefer high-impact UX features over technical complexity
    - Each must be testable and provide clear PASS/FAIL with evidence
    - Example: "AT16: ctdd diff <delta.json> shows before/after comparison"

  4. Session State Management (CRITICAL for context preservation):
    - ALWAYS update `.ctdd/session-state.json` when significant work completes
    - Include: current phase, completed acceptance criteria, file changes,
      critical insights, next actions, resumption instructions
    - This becomes the single source of truth for resumption
    - Avoid duplicate documentation files to save context tokens

  5. Workflow with Tools Integration:
    - Use TodoWrite proactively for progress tracking and user visibility
    - Pre-Check: State which invariants hold and which CUTs you're targeting
    - Implementation: Reference IDs, update todos as you progress, collect evidence
    - Post-Check: Report PASS/FAIL with specific evidence for each CUT
    - Documentation Update: Update session-state.json with insights and progress

  6. Context Efficiency Principles:
    - Optimize for token usage - avoid duplicate documentation
    - Prioritize single source of truth patterns (session-state.json)
    - Include verification commands in session state for resumption
    - Focus on practical, high-impact features over complex engineering

  7. Commit ID: Version checkpoint (e.g., "CTDD:FC-001@v1") for mental checkpoints

  8. Evidence Standards:
    - PASS: Provide concrete evidence (test output, file content, command results)
    - FAIL: Include error details and next steps for resolution
    - Performance: Include timing, coverage, and regression checks

  Core insight: CTDD succeeds when it enables seamless project resumption
  while maintaining quality and avoiding context loss. Prioritize user experience
  improvements over technical complexity - this pattern consistently delivers value.

  Example workflow:
  User: "Implement user authentication using CTDD"
  Claude: "Let me establish our CTDD contract:

  Focus Card (FC-AUTH-001):
  - Goal: Implement secure user authentication system
  - Deliverables: [auth.ts, auth.test.ts, login.html]
  - Constraints: [JWT tokens, bcrypt hashing, rate limiting]
  - Non-goals: [OAuth integration, password reset]

  Invariants:
  - I1: All passwords must be hashed
  - I2: Sessions expire in 24 hours
  - I3: Rate limit: 5 attempts per minute

  CUTs:
  - AT1: User can login with valid credentials
  - AT2: Invalid credentials return 401
  - AT3: Rate limiting blocks excessive attempts

  Commit: CTDD:FC-AUTH-001@v1

  [Implementation with TodoWrite progress tracking...]

  Post-Check:
  ✅ AT1: PASS - login endpoint returns JWT token (evidence: test output)
  ✅ AT2: PASS - returns 401 for invalid creds (evidence: curl test)
  ✅ AT3: PASS - rate limiting active (evidence: 6th attempt blocked)

  [Updates session-state.json with completion status and insights]"
```

## Key Changes from Original:

1. **Context preservation emphasized as primary purpose**
2. **Session state management as critical requirement**
3. **TodoWrite integration specified**
4. **High-impact UX principle explicitly stated**
5. **Token efficiency and single source of truth**
6. **Evidence standards defined**
7. **More comprehensive example showing full workflow**
8. **Resumption-focused mindset throughout**

This refined methodology captures the practical lessons learned from implementing CTDD across multiple phases and focuses on what actually makes it successful in practice.