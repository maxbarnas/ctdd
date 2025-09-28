How to use


- Rebuild:


	npm run build


- Generate AGENT_BRIEF.md via CLI:


	# Includes plugin summaries by default
	npx ctdd brief --out AGENT_BRIEF.md
	
	# Exclude plugin section
	npx ctdd brief --no-plugins --out AGENT_BRIEF.md


- Generate via HTTP API:


	# With plugin summaries (default)
	curl http://localhost:4848/brief > AGENT_BRIEF.md
	
	# Exclude plugin summaries
	curl "http://localhost:4848/brief?plugins=0" > AGENT_BRIEF.md

What the brief contains


- Pulls title, goal, deliverables, constraints, non-goals, sources of truth from .ctdd/spec.json

- Lists Invariants and CUTs by ID and text

- Inserts the current commit_id

- Documents the exact Pre and Post JSON shapes with your commit_id

- Summarizes installed plugins and how they map to CUTs/Invariants (if present)