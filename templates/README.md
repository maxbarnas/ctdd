# CTDD Project Templates

This directory contains project initialization templates for the CTDD tool.

## Available Templates

### minimal.json
The most basic CTDD project template with minimal structure. Good for starting from scratch.

### generic-project.json
A balanced starting template suitable for most projects. Includes helpful placeholder text.

### csv-parser-example.json
An example template for a CSV to JSON parser project. Shows how a complete spec looks.

## Using Templates

```bash
# Use default template (generic-project)
ctdd init

# Use a specific template
ctdd init --template minimal
ctdd init --template csv-parser-example

# Use template with full setup
ctdd init --full --template minimal
```

## Creating Custom Templates

1. Copy an existing template as a starting point
2. Modify the JSON structure following the Spec schema:
   - `focus_card`: Project identity and goals
   - `invariants`: Array of conditions that must always hold
   - `cuts`: Array of acceptance criteria
3. Save with a descriptive name (e.g., `web-api.json`)
4. Use with: `ctdd init --template web-api`

## Template Structure

All templates must be valid JSON conforming to the CTDD Spec schema:

```json
{
  "focus_card": {
    "focus_card_id": "string",
    "title": "string",
    "goal": "string",
    "deliverables": ["array of strings"],
    "constraints": ["array of strings"],
    "non_goals": ["array of strings"],
    "sources_of_truth": ["array of strings"],
    "token_budget": number
  },
  "invariants": [
    {"id": "string", "text": "string"}
  ],
  "cuts": [
    {"id": "string", "text": "string"}
  ]
}
```

## Template Resolution

The CTDD tool searches for templates in this order:
1. **Tool templates directory** (this directory) - preferred location
2. **Legacy project directory** (`.ctdd/templates/` in project) - for backward compatibility
3. **Minimal fallback** - built-in minimal template if no other options exist

This ensures that:
- Tool templates are preferred over project templates (AT75)
- Existing projects with old template structure continue to work (AT74)
- Template loading always succeeds for reliable project initialization

## Fallback Behavior

If a requested template is not found:
1. Tool tries to load `minimal.json` as fallback from tool directory
2. If no templates exist in tool directory, checks legacy project location
3. If still not found, uses built-in minimal default
4. `ctdd init` always succeeds to ensure project initialization

## Best Practices

- Keep templates focused and minimal
- Use descriptive placeholder text
- Include realistic example invariants and CUTs
- Test your template with `ctdd init --template your-template`
- Validate JSON syntax before saving