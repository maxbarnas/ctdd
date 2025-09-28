# CTDD Improvement Plan Based on TodoWrite Patterns

## Executive Summary
This plan outlines concrete improvements to CTDD inspired by TodoWrite's task management patterns, focusing on enhanced progress tracking, better state management, and improved developer experience.

## Proposed Improvements

### 1. Granular Task Tracking System

#### Current State
- CTDD only tracks binary test pass/fail states
- No visibility into work-in-progress
- Limited planning structure (single `plan_step` string)

#### Proposed Enhancement
```typescript
// New task-aware state structure
interface CTDDState {
  commit_id: string;
  tasks: {
    id: string;
    content: string;
    activeForm: string;
    status: 'pending' | 'in_progress' | 'completed';
    related_cuts: string[];
    related_invariants: string[];
    started_at?: string;
    completed_at?: string;
    evidence?: string;
  }[];
  current_task_id?: string;
  last_pre?: PreResponse;
  last_post?: PostResponse;
}
```

#### Implementation Steps
1. Add `TaskSchema` to `src/core.ts`
2. Create `src/tasks.ts` module for task management
3. Update state.json structure to include tasks
4. Add task-related CLI commands

### 2. Progressive Status Reporting

#### Current State
- Status command shows minimal information
- No progress percentage or completion tracking
- Limited visibility into agent's current focus

#### Proposed Enhancement
```bash
$ npx ctdd status --detailed

CTDD Status Report
==================
Commit: CTDD:FC-001@abc123f
Title: Refactor CSV-to-JSON CLI
Goal: Create robust CLI with schema validation

Progress: ████████░░░░░░░░ 53% (8/15 tasks)

Current Task: [T9] Implementing schema validation
Started: 10 minutes ago
Related: AT2, I4

Completed Today:
✓ [T1] Parse CLI arguments (AT1, AT3)
✓ [T2] Set up project structure (AT1)
✓ [T3] Implement file reading (AT1)

Pending:
○ [T10] Add error handling (AT2)
○ [T11] Write documentation (AT4)
○ [T12] Final validation pass (ALL)

Last Check Results:
• AT1: PASS (evidence: cli.ts:45)
• AT2: FAIL (missing validation)
• AT3: PENDING
• AT4: PENDING
```

### 3. Smart Task Generation from CUTs

#### New Feature: Auto-generate tasks from CUTs
```bash
$ npx ctdd generate-tasks

Analyzing CUTs and generating implementation tasks...

Generated 12 tasks from 4 CUTs:
[T1] Parse command-line arguments → AT1
[T2] Implement file path validation → AT1
[T3] Read and parse CSV content → AT1
[T4] Convert CSV to JSON structure → AT1
[T5] Implement stdout output → AT1
[T6] Add schema validation logic → AT2
[T7] Implement error exit codes → AT2
[T8] Create error message formatting → AT2
[T9] Implement stdin reading → AT3
[T10] Add pipe support → AT3
[T11] Ensure output consistency → AT3
[T12] Verify README examples → AT4

Save tasks? (y/n): y
Tasks saved to .ctdd/tasks.json
```

### 4. Interactive Task Mode

#### New Feature: Interactive task management during development
```bash
$ npx ctdd interactive

CTDD Interactive Mode
> current
Currently working on: [T5] Implementing stdout output

> complete T5 "Added JSON.stringify output to console"
✓ Task T5 completed

> next
Starting task: [T6] Add schema validation logic
Related CUTs: AT2
Related Invariants: I4

> pause "Need to research schema library options"
Task T6 paused: Need to research schema library options

> list pending
Pending tasks:
○ [T6] Add schema validation logic (PAUSED)
○ [T7] Implement error exit codes
○ [T8] Create error message formatting

> resume T6
Resuming task: [T6] Add schema validation logic

> help
Commands: current, complete, next, pause, resume, list, check, exit
```

### 5. Task-Aware Prompts

#### Enhanced Pre-Test Prompt
```markdown
## Current Development State
Active Task: [T6] Add schema validation logic
Progress: 5 of 12 tasks completed (42%)
Time on current task: 15 minutes

## Completed Tasks Evidence
- [T1] Parse CLI arguments: Implemented in cli.ts:10-35
- [T2] Set up project structure: Created src/, tests/, schemas/
- [T3] Implement file reading: fs.readFileSync in cli.ts:40-55

## Next Planned Tasks
- [T7] Implement error exit codes (AT2)
- [T8] Create error message formatting (AT2)
```

### 6. Task Dependencies and Parallelization

#### New Feature: Define task dependencies
```json
{
  "tasks": [
    {
      "id": "T1",
      "content": "Set up project structure",
      "dependencies": [],
      "can_parallel": true
    },
    {
      "id": "T2",
      "content": "Implement CLI parsing",
      "dependencies": ["T1"],
      "can_parallel": false
    },
    {
      "id": "T3",
      "content": "Add tests",
      "dependencies": ["T2"],
      "can_parallel": true
    }
  ]
}
```

### 7. Task Templates and Patterns

#### New Feature: Reusable task templates
```bash
$ npx ctdd apply-template refactor

Applying 'refactor' template...
Generated tasks:
[R1] Analyze current implementation
[R2] Identify refactoring targets
[R3] Create backup/snapshot
[R4] Extract common functions
[R5] Update imports and dependencies
[R6] Run existing tests
[R7] Update documentation
[R8] Verify invariants preserved
```

### 8. Task-Based Commit Messages

#### Auto-generate commit messages from completed tasks
```bash
$ npx ctdd commit-from-tasks

Analyzing completed tasks...

Suggested commit message:
---
feat: Implement CSV to JSON conversion with validation

Completed tasks:
- Parse CLI arguments (AT1, AT3)
- Implement file reading and stdin support (AT1, AT3)
- Add schema validation with error codes (AT2, I4)
- Update README with examples (AT4, I6)

CTDD: 8/12 tasks completed, 4/4 CUTs passing
---

Use this message? (y/n/edit):
```

## Implementation Roadmap

### Phase 1: Core Task System (Week 1-2)
- [ ] Implement task schema and types
- [ ] Add task CRUD operations
- [ ] Update state management
- [ ] Create basic task CLI commands

### Phase 2: Enhanced Reporting (Week 3)
- [ ] Implement detailed status command
- [ ] Add progress tracking
- [ ] Create task timeline view
- [ ] Add task evidence linking

### Phase 3: Intelligent Features (Week 4-5)
- [ ] Auto-generate tasks from CUTs
- [ ] Implement task dependencies
- [ ] Add task templates
- [ ] Create interactive mode

### Phase 4: Integration (Week 6)
- [ ] Update Pre/Post prompts with tasks
- [ ] Add task-aware server endpoints
- [ ] Update web UI with task views
- [ ] Create migration tool for existing projects

## Benefits

1. **Better Progress Visibility**: See exactly what's being worked on
2. **Improved Planning**: Structure work into manageable tasks
3. **Enhanced Debugging**: Track which tasks led to failures
4. **Time Tracking**: Understand how long tasks take
5. **Better Collaboration**: Multiple agents can see task state
6. **Audit Trail**: Complete history of task progression

## Backwards Compatibility

- All task features are optional
- Existing CTDD projects continue to work
- Migration tool available for adding tasks to existing specs
- Task-aware and non-task-aware agents can coexist

## Metrics and Success Criteria

### Quantitative
- 50% reduction in "lost context" issues
- 30% faster completion of multi-CUT features
- 75% of users adopt task tracking within 3 months

### Qualitative
- Improved developer experience
- Better debugging capabilities
- Clearer progress communication
- Enhanced audit trail for compliance

## Conclusion

By incorporating TodoWrite-style task management into CTDD, we can provide:
- Fine-grained progress tracking
- Better state management
- Improved developer experience
- Enhanced debugging capabilities

These improvements maintain CTDD's core principles of compact context and cheap validation while adding valuable task management capabilities that modern LLM agents need for complex development workflows.