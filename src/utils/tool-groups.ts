/**
 * Tool Groups Configuration
 *
 * This file defines the groups of tools and provides utilities to determine
 * which tools should be enabled based on environment variables.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { log } from './logger.js';

// Tool group definitions
export enum ToolGroup {
  // Workflow-based groups
  // Launch and utility tools
  LAUNCH = 'BOLIDE_AI_MCP_GROUP_LAUNCH',

  // Project scaffolding and creation tools
  SCAFFOLDING = 'BOLIDE_AI_MCP_GROUP_SCAFFOLDING',

  // Logging and diagnostics
  DIAGNOSTICS = 'BOLIDE_AI_MCP_GROUP_DIAGNOSTICS',

  // Content generation tools
  CONTENT_GENERATORS = 'BOLIDE_AI_MCP_GROUP_CONTENT_GENERATORS',

  // Research tools
  RESEARCH = 'BOLIDE_AI_MCP_GROUP_RESEARCH',

  // Notion integration tools
  NOTION = 'BOLIDE_AI_MCP_GROUP_NOTION',

  // Slack integration tools
  SLACK = 'BOLIDE_AI_MCP_GROUP_SLACK',

  // Linear integration tools
  LINEAR = 'BOLIDE_AI_MCP_GROUP_LINEAR',
}

// Map tool registration functions to their respective groups and individual env var names
export interface ToolRegistration {
  register: (server: McpServer) => void;
  groups: ToolGroup[];
  envVar: string;
}

// Check if selective tool registration is enabled by checking if any tool or group env vars are set
export function isSelectiveToolsEnabled(): boolean {
  // Check if any tool-specific environment variables are set
  const hasToolEnvVars = Object.keys(process.env).some(
    (key) => key.startsWith('BOLIDE_AI_MCP_TOOL_') && process.env[key] === 'true',
  );

  // Check if any group-specific environment variables are set
  const hasGroupEnvVars = Object.keys(process.env).some(
    (key) => key.startsWith('BOLIDE_AI_MCP_GROUP_') && process.env[key] === 'true',
  );

  const isEnabled = hasToolEnvVars || hasGroupEnvVars;
  return isEnabled;
}

// Check if a specific tool should be enabled
export function isToolEnabled(toolEnvVar: string): boolean {
  // If selective tools mode is not enabled, all tools are enabled by default
  if (!isSelectiveToolsEnabled()) {
    return true;
  }

  const isEnabled = process.env[toolEnvVar] === 'true';
  return isEnabled;
}

// Check if a tool group should be enabled
export function isGroupEnabled(group: ToolGroup): boolean {
  // If selective tools mode is not enabled, all groups are enabled by default
  if (!isSelectiveToolsEnabled()) {
    return true;
  }

  // In selective mode, group must be explicitly enabled
  const isEnabled = process.env[group] === 'true';
  return isEnabled;
}

// Check if a tool should be registered based on its groups and individual env var
export function shouldRegisterTool(toolReg: ToolRegistration): boolean {
  // If selective tools mode is not enabled, register all tools
  if (!isSelectiveToolsEnabled()) {
    return true;
  }

  // Check if the tool is enabled individually
  if (isToolEnabled(toolReg.envVar)) {
    return true;
  }

  // Check if any of the tool's groups are enabled
  const enabledByGroup = toolReg.groups.some((group) => isGroupEnabled(group));
  return enabledByGroup;
}

// List all enabled tool groups (for debugging purposes)
export function listEnabledGroups(): string[] {
  if (!isSelectiveToolsEnabled()) {
    return Object.values(ToolGroup);
  }

  return Object.values(ToolGroup).filter((group) => isGroupEnabled(group as ToolGroup));
}

// Helper to register a tool if it's enabled
export function registerIfEnabled(server: McpServer, toolReg: ToolRegistration): void {
  const shouldRegister = shouldRegisterTool(toolReg);

  if (shouldRegister) {
    if (process.env.BOLIDE_AI_MCP_DEBUG === 'true') {
      log('debug', `Registering tool: ${toolReg.envVar}`);
    }
    toolReg.register(server);
  } else {
    if (process.env.BOLIDE_AI_MCP_DEBUG === 'true') {
      log('debug', `Skipping tool: ${toolReg.envVar} (not enabled)`);
    }
  }
}
