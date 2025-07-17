/**
 * Common types and utilities shared across tool modules
 *
 * This module provides utility functions used by multiple tool modules.
 *
 * Responsibilities:
 * - Implementing shared tool registration utilities
 * - Standardizing response formatting across tools
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolResponse, ToolResponseContent } from '../types/common.js';

/**
 * Helper function to register a tool with the MCP server
 */
export function registerTool<T extends object>(
  server: McpServer,
  name: string,
  description: string,
  schema: Record<string, z.ZodType>,
  handler: (params: T) => Promise<ToolResponse>,
): void {
  // Create a wrapper handler that matches the signature expected by server.tool
  const wrappedHandler = (
    args: Record<string, unknown>,
    _extra: unknown,
  ): Promise<ToolResponse> => {
    // Assert the type *before* calling the original handler
    // This confines the type assertion to one place
    const typedParams = args as T;
    return handler(typedParams);
  };

  server.tool(name, description, schema, wrappedHandler);
}

/**
 * Helper to create a standard text response content.
 */
export function createTextContent(text: string): ToolResponseContent {
  return { type: 'text', text };
}
