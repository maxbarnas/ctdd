# TodoWrite Integration with CTDD

## Overview
This document explores how TodoWrite-style task tracking could enhance the CTDD framework, providing better granular progress tracking for LLM agents.

## Current CTDD Limitations
1. **No Granular Task Tracking**: CTDD tracks Pre/Post test cycles but not individual implementation steps
2. **Binary State**: Tasks are either targeted (in CUTs) or completed (in post_check)
3. **No In-Progress Visibility**: Can't see what the agent is currently working on
4. **Limited Planning Structure**: `plan_step` is a single string, not structured tasks

## Proposed Enhancement: CTDD Task Tracking

### 1. Add Task Management to Pre-Response
```json
{
  "commit_id": "CTDD:FC-001@abcdef1",
  "self_check": [...],
  "target_cuts": ["AT1", "AT3"],
  "tasks": [
    {
      "id": "T1",
      "content": "Parse CLI arguments",
      "activeForm": "Parsing CLI arguments",
      "status": "pending",
      "related_cuts": ["AT1", "AT3"]
    },
    {
      "id": "T2",
      "content": "Implement stdin handling",
      "activeForm": "Implementing stdin handling",
      "status": "pending",
      "related_cuts": ["AT3"]
    }
  ],
  "current_task": "T1"
}
```

### 2. Add Task Updates to Post-Response
```json
{
  "commit_id": "CTDD:FC-001@abcdef1",
  "task_updates": [
    {"id": "T1", "status": "completed", "evidence": "cli.ts:45-89"},
    {"id": "T2", "status": "in_progress", "evidence": "Working on stdin buffer"}
  ],
  "post_check": [...],
  "next_tasks": [
    {
      "id": "T3",
      "content": "Add schema validation",
      "activeForm": "Adding schema validation",
      "related_cuts": ["AT2"]
    }
  ]
}
```

### 3. New CTDD Commands
```bash
# Show current tasks
npx ctdd tasks

# Update task status
npx ctdd task-update T1 completed "Implemented in cli.ts"

# Generate task-aware prompts
npx ctdd pre --with-tasks
npx ctdd post --with-tasks
```

## Implementation Guide for CTDD

### Step 1: Extend Schemas (src/core.ts)
```typescript
const TaskSchema = z.object({
  id: z.string(),
  content: z.string(),
  activeForm: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  related_cuts: z.array(z.string()).optional(),
  evidence: z.string().optional()
});

const PreResponseWithTasksSchema = PreResponseSchema.extend({
  tasks: z.array(TaskSchema).optional(),
  current_task: z.string().optional()
});
```

### Step 2: Add Task State Management
```typescript
interface TaskState {
  tasks: Task[];
  current_task_id?: string;
  completed_tasks: string[];
}

async function loadTaskState(projectDir: string): Promise<TaskState | null> {
  const taskFile = path.join(projectDir, '.ctdd', 'tasks.json');
  // Implementation...
}
```

### Step 3: Task Visualization
```typescript
function renderTaskList(tasks: Task[]): string {
  return tasks.map(t => {
    const status = t.status === 'completed' ? '✓' :
                   t.status === 'in_progress' ? '→' : '○';
    return `${status} [${t.id}] ${t.content}`;
  }).join('\n');
}
```

## Benefits of Integration

1. **Better Progress Visibility**: See exactly what the agent is working on
2. **Structured Planning**: Break down CUTs into concrete implementation tasks
3. **Audit Trail**: Track which tasks led to which test passes/failures
4. **Incremental Progress**: Allow partial completion tracking
5. **Context Preservation**: Tasks maintain relationship to CUTs and Invariants

## Use Cases

### 1. Complex Feature Implementation
When implementing a feature that touches multiple CUTs:
```
Tasks:
→ T1: Set up project structure (AT1, AT3)
○ T2: Implement core logic (AT1, AT2)
○ T3: Add error handling (AT2)
○ T4: Write documentation (AT4)
```

### 2. Debugging Workflow
When fixing failing tests:
```
Tasks:
✓ T1: Reproduce issue locally (AT2)
→ T2: Debug validation logic (AT2)
○ T3: Fix and verify (AT2)
○ T4: Add regression test (AT2)
```

### 3. Refactoring with Invariant Preservation
When refactoring while maintaining invariants:
```
Tasks:
✓ T1: Identify refactor targets (I1, I2, I3)
→ T2: Extract common functions (I1)
○ T3: Update imports (I1, I3)
○ T4: Verify invariants hold (I1, I2, I3)
```

## Migration Path

1. **Phase 1**: Add optional task tracking to existing schemas
2. **Phase 2**: Extend CLI with task commands
3. **Phase 3**: Update server endpoints for task management
4. **Phase 4**: Add task visualization to web UI

## Backwards Compatibility

- Task fields are optional in schemas
- Existing agents continue to work without tasks
- Task-aware agents get enhanced tracking
- Gradual adoption possible

## Conclusion

Integrating TodoWrite-style task tracking into CTDD would provide:
- Fine-grained progress tracking
- Better debugging capabilities
- Clearer agent planning structure
- Improved audit trails

This enhancement maintains CTDD's core principles while adding valuable task management capabilities that modern LLM agents can leverage for more organized and trackable development workflows.