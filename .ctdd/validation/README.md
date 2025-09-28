# CTDD Custom Validation Framework

This directory contains project-specific validation scripts for acceptance criteria.

## How to Create Custom Validations

1. Create a `.js` file named after your acceptance criteria (e.g., `at16.js` for AT16)
2. Export a `validate` function that returns a result object:

```javascript
export async function validate() {
  try {
    // Your validation logic here
    const testResult = await someTest();

    return {
      passed: true,  // or false
      message: "AT16: Your test description and result",
      evidence: "Concrete evidence of the test result"
    };
  } catch (error) {
    return {
      passed: false,
      message: "AT16: Test failed",
      evidence: `Error: ${error.message}`
    };
  }
}

export default validate;
```

## Result Object Format

- `passed`: Boolean indicating if the test passed
- `message`: Human-readable description of the result
- `evidence`: Optional concrete evidence (command output, file content, etc.)

## Examples

See `at40.js` and `at42.js` for working examples that test the project-agnostic tool changes.

## Usage

Run `ctdd check-at AT40` to test a specific acceptance criteria with custom validation.
Run `ctdd check-at --all` to see all acceptance criteria (custom validations run automatically if available).