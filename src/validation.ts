// src/validation.ts - Circular reference detection and validation utilities
import { CTDDError, ErrorCodes, CircularReferenceError } from './errors.js';

/**
 * Detects circular references in an object
 * @param obj - The object to check
 * @param visited - Set of visited objects (used internally)
 * @param path - Current path for error reporting
 * @returns Array of circular reference paths found
 */
export function detectCircularReferences(
  obj: any,
  visited: WeakSet<object> = new WeakSet(),
  path: string = 'root'
): string[] {
  const circularPaths: string[] = [];

  if (obj === null || typeof obj !== 'object') {
    return circularPaths;
  }

  // Check if we've seen this object before
  if (visited.has(obj)) {
    circularPaths.push(path);
    return circularPaths;
  }

  // Mark this object as visited
  visited.add(obj);

  try {
    // Check arrays
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const nestedPaths = detectCircularReferences(item, visited, `${path}[${index}]`);
        circularPaths.push(...nestedPaths);
      });
    } else {
      // Check object properties
      for (const [key, value] of Object.entries(obj)) {
        const nestedPaths = detectCircularReferences(value, visited, `${path}.${key}`);
        circularPaths.push(...nestedPaths);
      }
    }
  } finally {
    // Remove from visited set when done with this branch
    visited.delete(obj);
  }

  return circularPaths;
}

/**
 * Validates that an object contains no circular references
 * @param obj - Object to validate
 * @param context - Context for error reporting
 * @throws CircularReferenceError if circular references are found
 */
export function validateNoCircularReferences(obj: any, context: string): void {
  const circularPaths = detectCircularReferences(obj);

  if (circularPaths.length > 0) {
    throw new CircularReferenceError(
      `Circular references detected in ${context}`,
      ErrorCodes.CIRCULAR_REFERENCE_DETECTED,
      {
        context,
        circularPaths,
        pathCount: circularPaths.length
      }
    );
  }
}

/**
 * Safe JSON parser that detects circular references before parsing
 * @param text - JSON string to parse
 * @param context - Context for error reporting
 * @returns Parsed object
 */
export function safeJsonParse(text: string, context: string): any {
  let parsed: any;

  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new CTDDError(
      `JSON parsing failed in ${context}: ${e instanceof Error ? e.message : 'Unknown error'}`,
      ErrorCodes.JSON_PARSE_FAILED,
      { context, error: e instanceof Error ? e.message : 'Unknown error' }
    );
  }

  // Check for circular references in parsed object
  validateNoCircularReferences(parsed, context);

  return parsed;
}

/**
 * Enhanced object validation that checks for common issues
 * @param obj - Object to validate
 * @param context - Context for error reporting
 * @param options - Validation options
 */
export function validateObject(
  obj: any,
  context: string,
  options: {
    allowCircular?: boolean;
    maxDepth?: number;
    requiredFields?: string[];
  } = {}
): void {
  const { allowCircular = false, maxDepth = 100, requiredFields = [] } = options;

  // Check for circular references
  if (!allowCircular) {
    validateNoCircularReferences(obj, context);
  }

  // Check maximum depth
  const depth = getObjectDepth(obj);
  if (depth > maxDepth) {
    throw new CTDDError(
      `Object depth exceeds maximum (${depth} > ${maxDepth}) in ${context}`,
      ErrorCodes.OBJECT_DEPTH_EXCEEDED,
      { context, depth, maxDepth }
    );
  }

  // Check required fields
  if (requiredFields.length > 0 && typeof obj === 'object' && obj !== null) {
    const missingFields = requiredFields.filter(field => !(field in obj));
    if (missingFields.length > 0) {
      throw new CTDDError(
        `Missing required fields in ${context}: ${missingFields.join(', ')}`,
        ErrorCodes.MISSING_REQUIRED_FIELDS,
        { context, missingFields, requiredFields }
      );
    }
  }
}

/**
 * Calculate the maximum depth of an object
 * @param obj - Object to measure
 * @param currentDepth - Current depth (used internally)
 * @returns Maximum depth
 */
function getObjectDepth(obj: any, currentDepth: number = 0): number {
  if (obj === null || typeof obj !== 'object') {
    return currentDepth;
  }

  let maxDepth = currentDepth;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const depth = getObjectDepth(item, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  } else {
    for (const value of Object.values(obj)) {
      const depth = getObjectDepth(value, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  }

  return maxDepth;
}