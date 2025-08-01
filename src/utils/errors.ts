import { ToolResponse } from '../types/common.js';

/**
 * Error Utilities - Type-safe error hierarchy for the application
 *
 * This utility module defines a structured error hierarchy for the application,
 * providing specialized error types for different failure scenarios. Using these
 * typed errors enables more precise error handling, improves debugging, and
 * provides better error messages to users.
 *
 * Responsibilities:
 * - Providing a base error class (XcodeBuildMCPError) for all application errors
 * - Defining specialized error subtypes for different error categories:
 *   - ValidationError: Parameter validation failures
 *   - SystemError: Underlying system/OS issues
 *   - ConfigurationError: Application configuration problems
 *   - SimulatorError: iOS simulator-specific failures
 *   - AxeError: axe-specific errors
 *
 * The structured hierarchy allows error consumers to handle errors with the
 * appropriate level of specificity using instanceof checks or catch clauses.
 */

/**
 * Custom error types for XcodeBuildMCP
 */

/**
 * Base error class for XcodeBuildMCP errors
 */
export class BolideAIMCPError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BolideAIMCPError';
    // This is necessary for proper inheritance in TypeScript
    Object.setPrototypeOf(this, BolideAIMCPError.prototype);
  }
}

/**
 * Error thrown for API-specific errors
 */
export class APIError extends BolideAIMCPError {
  constructor(
    message: string,
    public statusCode?: number,
    public error?: string,
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Error thrown when validation of parameters fails
 */
export class ValidationError extends BolideAIMCPError {
  constructor(
    message: string,
    public paramName?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown for system-level errors (file access, permissions, etc.)
 */
export class SystemError extends BolideAIMCPError {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'SystemError';
    Object.setPrototypeOf(this, SystemError.prototype);
  }
}

/**
 * Error thrown for configuration issues
 */
export class ConfigurationError extends BolideAIMCPError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Error thrown for axe-specific errors
 */
export class AxeError extends BolideAIMCPError {
  constructor(
    message: string,
    public command?: string, // The axe command that failed
    public axeOutput?: string, // Output from axe
    public simulatorId?: string,
  ) {
    super(message);
    this.name = 'AxeError';
    Object.setPrototypeOf(this, AxeError.prototype);
  }
}

// Helper to create a standard error response
export function createErrorResponse(
  message: string,
  details?: string,
  _errorType: string = 'UnknownError',
): ToolResponse {
  const detailText = details ? `\nDetails: ${details}` : '';
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${message}${detailText}`,
      },
    ],
    isError: true,
  };
}

/**
 * Error class for missing dependencies
 */
export class DependencyError extends ConfigurationError {
  constructor(
    message: string,
    public details?: string,
  ) {
    super(message);
    this.name = 'DependencyError';
    Object.setPrototypeOf(this, DependencyError.prototype);
  }
}
