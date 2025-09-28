How to use


- Rebuild:


	npm run build


- Generate synchronized briefs:


	# Markdown brief (with plugin summaries)
	npx ctdd brief --out AGENT_BRIEF.md
	
	# Programmatic JSON brief (with plugin summaries)
	npx ctdd brief-json --out AGENT_BRIEF.json
	
	# Exclude plugin summaries
	npx ctdd brief --no-plugins --out AGENT_BRIEF.md
	npx ctdd brief-json --no-plugins --out AGENT_BRIEF.json


- Use HTTP endpoints:


	# Start server
	npx ctdd serve --port 4848
	
	# Programmatic brief
	curl http://localhost:4848/brief.json > AGENT_BRIEF.json
	
	# Human brief
	curl http://localhost:4848/brief > AGENT_BRIEF.md
	
	# Minimal web UI
	open http://localhost:4848/ui
	# or
	xdg-open http://localhost:4848/ui

This keeps your AGENT_BRIEF.md and AGENT_BRIEF.json always in sync with .ctdd/spec.json and the current commit_id, and the web UI gives you a quick visual of focus, spec, and check status.