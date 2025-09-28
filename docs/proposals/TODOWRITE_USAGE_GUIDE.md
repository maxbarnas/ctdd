# TodoWrite Usage Guide for CTDD Development

## When to Use TodoWrite with CTDD

As Claude Code working with CTDD projects, use TodoWrite to track your implementation of CTDD workflows and features.

## Practical Examples

### Example 1: Implementing a CTDD Workflow
```javascript
// TodoWrite tasks for implementing a complete CTDD cycle:
todos = [
  {
    content: "Initialize CTDD spec for CSV parser",
    activeForm: "Initializing CTDD spec for CSV parser",
    status: "in_progress"
  },
  {
    content: "Define invariants for CSV parser",
    activeForm: "Defining invariants for CSV parser",
    status: "pending"
  },
  {
    content: "Create CUTs for core functionality",
    activeForm: "Creating CUTs for core functionality",
    status: "pending"
  },
  {
    content: "Generate Pre-Test prompt",
    activeForm: "Generating Pre-Test prompt",
    status: "pending"
  },
  {
    content: "Implement CSV parsing logic",
    activeForm: "Implementing CSV parsing logic",
    status: "pending"
  },
  {
    content: "Run plugin validations",
    activeForm: "Running plugin validations",
    status: "pending"
  },
  {
    content: "Generate Post-Test response",
    activeForm: "Generating Post-Test response",
    status: "pending"
  }
]
```

### Example 2: Debugging Failed CUTs
```javascript
todos = [
  {
    content: "Analyze failing test AT2",
    activeForm: "Analyzing failing test AT2",
    status: "in_progress"
  },
  {
    content: "Reproduce AT2 failure locally",
    activeForm: "Reproducing AT2 failure locally",
    status: "pending"
  },
  {
    content: "Fix validation logic for AT2",
    activeForm: "Fixing validation logic for AT2",
    status: "pending"
  },
  {
    content: "Verify AT2 passes with fix",
    activeForm: "Verifying AT2 passes with fix",
    status: "pending"
  },
  {
    content: "Update Post-Test evidence for AT2",
    activeForm: "Updating Post-Test evidence for AT2",
    status: "pending"
  }
]
```

### Example 3: Adding New Plugin Checks
```javascript
todos = [
  {
    content: "Identify validation gaps in current plugins",
    activeForm: "Identifying validation gaps in current plugins",
    status: "in_progress"
  },
  {
    content: "Create grep plugin for API key detection",
    activeForm: "Creating grep plugin for API key detection",
    status: "pending"
  },
  {
    content: "Add file_exists plugin for required configs",
    activeForm: "Adding file_exists plugin for required configs",
    status: "pending"
  },
  {
    content: "Test plugins with ctdd checks command",
    activeForm: "Testing plugins with ctdd checks command",
    status: "pending"
  },
  {
    content: "Document new plugins in README",
    activeForm: "Documenting new plugins in README",
    status: "pending"
  }
]
```

## TodoWrite Best Practices for CTDD

### 1. Track CTDD Phases
Always create tasks that align with CTDD's Pre-Test → Implementation → Post-Test flow:
- Pre-Test preparation tasks
- Implementation tasks (one per CUT or feature)
- Post-Test validation tasks

### 2. Link Tasks to CUTs
When implementing features, create tasks that map to specific CUTs:
```javascript
{
  content: "Implement stdin handling for AT3",
  activeForm: "Implementing stdin handling for AT3",
  status: "pending"
}
```

### 3. Track Plugin Development
For plugin creation and testing:
```javascript
{
  content: "Create grep plugin to validate I2 (no network calls)",
  activeForm: "Creating grep plugin to validate I2",
  status: "pending"
}
```

### 4. Manage Delta Applications
When applying spec changes:
```javascript
todos = [
  {
    content: "Review delta changes for I3",
    activeForm: "Reviewing delta changes for I3",
    status: "in_progress"
  },
  {
    content: "Apply delta with ctdd delta command",
    activeForm: "Applying delta with ctdd delta command",
    status: "pending"
  },
  {
    content: "Verify new commit_id generated",
    activeForm: "Verifying new commit_id generated",
    status: "pending"
  },
  {
    content: "Update affected CUTs for new invariant",
    activeForm: "Updating affected CUTs for new invariant",
    status: "pending"
  }
]
```

## Common CTDD + TodoWrite Workflows

### Workflow 1: New Project Setup
1. Initialize CTDD structure
2. Define Focus Card
3. Create Invariants
4. Define CUTs
5. Set up initial plugins
6. Generate first Pre-Test prompt

### Workflow 2: Feature Implementation
1. Analyze target CUTs
2. Create implementation plan
3. Write code for each CUT
4. Run plugin checks
5. Generate Post-Test response
6. Record results

### Workflow 3: Debugging Session
1. Identify failing checks
2. Reproduce issues
3. Implement fixes
4. Validate fixes
5. Update evidence
6. Re-run Post-Test

### Workflow 4: Spec Evolution
1. Identify needed changes
2. Create delta JSON
3. Apply delta
4. Update related code
5. Verify integrity
6. Document changes

## Integration Benefits

Using TodoWrite with CTDD provides:

1. **Session Continuity**: Track progress across Pre/Post cycles
2. **Granular Visibility**: See exactly which CUT or Invariant is being worked on
3. **Debugging Context**: Maintain task state while investigating failures
4. **Planning Structure**: Break down complex CTDD workflows into manageable steps
5. **Progress Reporting**: Show completed vs pending work clearly

## Example: Complete CTDD Session with TodoWrite

```javascript
// Start of session - Planning phase
TodoWrite([
  { content: "Analyze project requirements", status: "completed" },
  { content: "Design CTDD spec structure", status: "in_progress" },
  { content: "Implement initial Focus Card", status: "pending" },
  { content: "Define 6 invariants", status: "pending" },
  { content: "Create 4 acceptance tests", status: "pending" }
]);

// Mid session - Implementation phase
TodoWrite([
  { content: "Analyze project requirements", status: "completed" },
  { content: "Design CTDD spec structure", status: "completed" },
  { content: "Implement initial Focus Card", status: "completed" },
  { content: "Define 6 invariants", status: "completed" },
  { content: "Create 4 acceptance tests", status: "completed" },
  { content: "Generate Pre-Test prompt", status: "completed" },
  { content: "Implement feature for AT1", status: "in_progress" },
  { content: "Implement feature for AT2", status: "pending" },
  { content: "Run validation plugins", status: "pending" },
  { content: "Generate Post-Test response", status: "pending" }
]);

// End of session - Validation phase
TodoWrite([
  // ... previous completed tasks ...
  { content: "Implement feature for AT1", status: "completed" },
  { content: "Implement feature for AT2", status: "completed" },
  { content: "Run validation plugins", status: "completed" },
  { content: "Generate Post-Test response", status: "completed" },
  { content: "Document implementation in README", status: "in_progress" }
]);
```

This approach ensures complete tracking of CTDD workflows while maintaining the discipline and structure that CTDD provides for LLM agent development.