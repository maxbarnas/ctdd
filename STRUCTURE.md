# Project Structure

## Directory Layout

```
ctdd/
├── src/                    # Core tool source code
│   ├── index.ts           # CLI entry point
│   ├── server.ts          # HTTP server
│   ├── core.ts            # Core CTDD logic
│   └── plugin.ts          # Plugin system
├── examples/              # Example files and samples
│   ├── spec-samples/      # Sample spec files (CUTs, invariants, focus cards)
│   ├── delta-samples/     # Delta file examples
│   ├── orchestration/     # Orchestrator implementation examples
│   └── expected-outputs/  # Expected output samples
├── docs/                  # Documentation
│   ├── AGENT_BRIEF.md     # Agent briefing document
│   └── proposals/         # Enhancement proposals and diffs
├── .ctdd/                 # CTDD runtime directory (created by init)
│   ├── spec.json          # Project specification
│   ├── state.json         # Current state
│   ├── logs/              # Event logs
│   └── plugins/           # Plugin configurations
├── CLAUDE.md              # Claude Code guidance
├── README.md              # Main documentation
├── package.json           # Node.js configuration
└── tsconfig.json          # TypeScript configuration
```

## Key Files

- **Source Code** (`src/`): TypeScript implementation of CTDD
- **Examples** (`examples/`): Reference implementations and samples
- **Documentation** (`docs/`): Additional documentation and proposals
- **Configuration**: Root-level config files only

## Build Output

After running `npm run build`, compiled JavaScript appears in:
```
dist/
├── index.js               # Compiled CLI
├── server.js              # Compiled server
├── core.js                # Compiled core logic
└── plugin.js              # Compiled plugin system
```