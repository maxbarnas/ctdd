// Example validation for AT40: check-at --all reads CUTs from project spec.json
// This demonstrates how to create custom validation scripts

export async function validate() {
  try {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    // Test that check-at --all works and reads from spec.json
    const result = await execAsync("node dist/index.js check-at --all");

    // Check for key indicators that it's reading from spec.json
    const output = result.stdout;
    const readsFromSpec = output.includes("acceptance criteria from spec.json");
    const showsProjectCuts = output.includes("Project Acceptance Criteria:");

    if (readsFromSpec && showsProjectCuts) {
      return {
        passed: true,
        message: "AT40: check-at --all successfully reads CUTs from project spec.json",
        evidence: "Command output shows 'from spec.json' and lists project-specific acceptance criteria"
      };
    } else {
      return {
        passed: false,
        message: "AT40: check-at --all not properly reading from spec.json",
        evidence: `Output missing spec.json indicators. Got: ${output.substring(0, 200)}...`
      };
    }
  } catch (error) {
    return {
      passed: false,
      message: "AT40: Failed to execute check-at command",
      evidence: `Error: ${error.message}`
    };
  }
}

export default validate;