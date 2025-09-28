npm install
npm run build

# Initialize in your project
npx ctdd init

# Show status
npx ctdd status

# Generate Pre Self-Test prompt (prints to stdout)
npx ctdd pre > .ctdd/pre_prompt.txt

# After the agent returns pre-response JSON, validate and record
# Save agent output to .ctdd/pre_response.json
npx ctdd validate-pre .ctdd/pre_response.json
npx ctdd record-pre .ctdd/pre_response.json

# Generate Post-Test prompt (optionally pass an artifact summary)
echo "Produced cli.ts and README.md" > .ctdd/artifact.txt
npx ctdd post --artifact .ctdd/artifact.txt > .ctdd/post_prompt.txt

# Validate and record agent post-response
npx ctdd validate-post .ctdd/post_response.json
npx ctdd record-post .ctdd/post_response.json

# Apply a delta to invariants/CUTs and bump commit
npx ctdd delta delta.json
