// Example validation for AT42: phase-status is project-agnostic
// This demonstrates project-specific validation

export async function validate() {
  try {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    // Test that phase-status shows project info instead of hardcoded phases
    const result = await execAsync("node dist/index.js phase-status");

    const output = result.stdout;
    const showsProjectInfo = output.includes("Project Information:");
    const showsFocusCard = output.includes("Focus Card:");
    const showsGenericProgress = output.includes("Generic Project Progress:") || output.includes("Custom Phase Progress:");

    if (showsProjectInfo && showsFocusCard && showsGenericProgress) {
      return {
        passed: true,
        message: "AT42: phase-status successfully shows project-agnostic information",
        evidence: "Command output shows project info, focus card, and generic/custom phases instead of hardcoded CTDD tool phases"
      };
    } else {
      return {
        passed: false,
        message: "AT42: phase-status still showing hardcoded phases",
        evidence: `Missing project-agnostic indicators. Got: ${output.substring(0, 200)}...`
      };
    }
  } catch (error) {
    return {
      passed: false,
      message: "AT42: Failed to execute phase-status command",
      evidence: `Error: ${error.message}`
    };
  }
}

export default validate;