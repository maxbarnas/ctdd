// src/errors.ts
export const ErrorCodes = {
  // File system errors
  SPEC_NOT_FOUND: 'E001',
  SPEC_INVALID: 'E002',
  STATE_LOAD_FAILED: 'E003',
  FILE_WRITE_FAILED: 'E004',

  // Plugin errors
  PLUGIN_LOAD_FAILED: 'E101',
  PLUGIN_EXECUTION_FAILED: 'E102',
  PLUGIN_TIMEOUT: 'E103',
  PLUGIN_INVALID_CONFIG: 'E104',
  PLUGIN_CONFIG_INVALID: 'E105',

  // Validation errors
  VALIDATION_FAILED: 'E201',
  COMMIT_ID_MISMATCH: 'E202',
  SCHEMA_VALIDATION_FAILED: 'E203',
  CIRCULAR_REFERENCE_DETECTED: 'E204',
  OBJECT_DEPTH_EXCEEDED: 'E205',
  MISSING_REQUIRED_FIELDS: 'E206',
  JSON_PARSE_FAILED: 'E207',

  // Delta errors
  DELTA_TARGET_NOT_FOUND: 'E301',
  DELTA_INVALID_OPERATION: 'E302',
  DELTA_APPLICATION_FAILED: 'E303',

  // Server errors
  SERVER_START_FAILED: 'E401',
  REQUEST_PROCESSING_FAILED: 'E402',

  // General errors
  INITIALIZATION_FAILED: 'E501',
  UNKNOWN_ERROR: 'E999'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export class CTDDError extends Error {
  public readonly code: ErrorCode;
  public readonly context?: Record<string, any>;
  public readonly suggestions?: string[];

  constructor(
    message: string,
    code: ErrorCode,
    context?: Record<string, any>,
    suggestions?: string[]
  ) {
    super(message);
    this.name = 'CTDDError';
    this.code = code;
    this.context = context;
    this.suggestions = suggestions;

    // Ensure proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CTDDError);
    }
  }

  toString(): string {
    let result = `[${this.code}] ${this.message}`;

    if (this.context) {
      const contextStr = Object.entries(this.context)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      result += `\nContext: ${contextStr}`;
    }

    if (this.suggestions && this.suggestions.length > 0) {
      result += `\nSuggestions:\n${this.suggestions.map(s => `  - ${s}`).join('\n')}`;
    }

    return result;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      suggestions: this.suggestions,
      stack: this.stack
    };
  }
}

// Specific error classes for common scenarios
export class SpecNotFoundError extends CTDDError {
  constructor(specPath: string) {
    super(
      `CTDD spec file not found: ${specPath}`,
      ErrorCodes.SPEC_NOT_FOUND,
      { specPath },
      [
        'Run "ctdd init" to create a new CTDD project',
        'Check if you are in the correct directory',
        'Verify the .ctdd directory exists'
      ]
    );
  }
}

export class PluginTimeoutError extends CTDDError {
  constructor(pluginId: string, timeoutMs: number) {
    super(
      `Plugin "${pluginId}" timed out after ${timeoutMs}ms`,
      ErrorCodes.PLUGIN_TIMEOUT,
      { pluginId, timeoutMs },
      [
        'Increase timeout with --timeout flag',
        'Check if plugin is hanging on file operations',
        'Verify plugin configuration is correct'
      ]
    );
  }
}

export class CommitIdMismatchError extends CTDDError {
  constructor(expected: string, received: string) {
    super(
      `Commit ID mismatch: expected "${expected}", got "${received}"`,
      ErrorCodes.COMMIT_ID_MISMATCH,
      { expected, received },
      [
        'Regenerate prompts with current spec',
        'Apply pending deltas before continuing',
        'Check if spec has been modified'
      ]
    );
  }
}

export class PluginConfigError extends CTDDError {
  constructor(pluginPath: string, validationError: string) {
    super(
      `Invalid plugin configuration in ${pluginPath}: ${validationError}`,
      ErrorCodes.PLUGIN_INVALID_CONFIG,
      { pluginPath, validationError },
      [
        'Check plugin JSON syntax',
        'Verify required fields are present',
        'Refer to plugin documentation for correct format'
      ]
    );
  }
}

// Error logger for structured logging
export interface ErrorLogEntry {
  timestamp: string;
  error: {
    name: string;
    message: string;
    code: ErrorCode;
    context?: Record<string, any>;
    suggestions?: string[];
    stack?: string;
  };
  operation?: string;
  userId?: string;
}

export function createErrorLogEntry(
  error: CTDDError | Error,
  operation?: string,
  userId?: string
): ErrorLogEntry {
  const timestamp = new Date().toISOString();

  if (error instanceof CTDDError) {
    return {
      timestamp,
      error: error.toJSON(),
      operation,
      userId
    };
  }

  // Handle regular Error objects
  return {
    timestamp,
    error: {
      name: error.name,
      message: error.message,
      code: ErrorCodes.UNKNOWN_ERROR,
      stack: error.stack
    },
    operation,
    userId
  };
}

// Helper function to wrap operations with error context
export async function withErrorContext<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof CTDDError) {
      // Add additional context to existing CTDD errors
      throw new CTDDError(
        error.message,
        error.code,
        { ...error.context, ...context, operation },
        error.suggestions
      );
    }

    // Wrap unknown errors
    throw new CTDDError(
      `Operation "${operation}" failed: ${error instanceof Error ? error.message : String(error)}`,
      ErrorCodes.UNKNOWN_ERROR,
      { ...context, operation, originalError: error instanceof Error ? error.name : 'Unknown' },
      ['Check logs for more details', 'Verify input parameters', 'Try again with debug output']
    );
  }
}

// Specialized error classes for enhanced type safety

export class CircularReferenceError extends CTDDError {
  constructor(message: string, code: ErrorCode, context?: Record<string, any>) {
    super(
      message,
      code,
      context,
      [
        'Check object references for circular dependencies',
        'Validate JSON structure before processing',
        'Consider flattening deeply nested objects'
      ]
    );
    this.name = 'CircularReferenceError';
  }
}

export class SchemaValidationError extends CTDDError {
  constructor(message: string, code: ErrorCode, context?: Record<string, any>) {
    super(
      message,
      code,
      context,
      [
        'Check that all required fields are present',
        'Verify field types match schema expectations',
        'Consult schema documentation for field requirements'
      ]
    );
    this.name = 'SchemaValidationError';
  }
}