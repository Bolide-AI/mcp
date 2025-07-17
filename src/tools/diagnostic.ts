/**
 * Diagnostic Tool - Provides comprehensive information about the MCP server environment
 *
 * This module provides a diagnostic tool that reports on the server environment,
 * available dependencies, and configuration status. It's only registered when
 * the XCODEBUILDMCP_DEBUG environment variable is set.
 *
 * Responsibilities:
 * - Reporting on Node.js and system environment
 * - Checking for required dependencies (xcodebuild, axe, etc.)
 * - Reporting on environment variables that affect server behavior
 * - Providing detailed information for debugging and troubleshooting
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolResponse } from '../types/common.js';
import { log } from '../utils/logger.js';
import { version } from '../version.js';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { ToolGroup, isSelectiveToolsEnabled, listEnabledGroups } from '../utils/tool-groups.js';
import { COMPANION_APP_CONTENTS_PATH } from '../utils/constants.js';

// Constants
const LOG_PREFIX = '[Diagnostic]';

/**
 * Check if a binary is available at the given path
 * @param binaryPath The full path to the binary to check
 * @returns Object with availability status and optional version string
 */
export function checkBinaryAvailability(binaryPath: string): {
  available: boolean;
  version?: string;
} {
  try {
    const stats = fs.statSync(binaryPath);

    if (stats.isFile()) {
      try {
        fs.accessSync(binaryPath, fs.constants.F_OK | fs.constants.X_OK);
        return {
          available: true,
          version: 'Available (version info not available)',
        };
      } catch {
        return { available: false };
      }
    }
  } catch {
    return { available: false };
  }

  return { available: false };
}

/**
 * Get information about the environment variables
 */
export function getEnvironmentVariables(): Record<string, string | undefined> {
  const relevantVars = [
    'DATAROUTEMCP_DEBUG',
    'INCREMENTAL_BUILDS_ENABLED',
    'PATH',
    'DEVELOPER_DIR',
    'HOME',
    'USER',
    'TMPDIR',
    'NODE_ENV',
    'SENTRY_DISABLED',
  ];

  const envVars: Record<string, string | undefined> = {};

  // Add standard environment variables
  for (const varName of relevantVars) {
    envVars[varName] = process.env[varName];
  }

  // Add all tool and group environment variables for debugging
  Object.keys(process.env).forEach((key) => {
    if (
      key.startsWith('DATAROUTEMCP_TOOL_') ||
      key.startsWith('DATAROUTEMCP_GROUP_') ||
      key.startsWith('DATAROUTEMCP_')
    ) {
      envVars[key] = process.env[key];
    }
  });

  return envVars;
}

/**
 * Get system information
 */
function getSystemInfo(): Record<string, string> {
  return {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpus: `${os.cpus().length} x ${os.cpus()[0]?.model || 'Unknown'}`,
    memory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`,
    hostname: os.hostname(),
    username: os.userInfo().username,
    homedir: os.homedir(),
    tmpdir: os.tmpdir(),
  };
}

/**
 * Get Node.js information
 */
function getNodeInfo(): Record<string, string> {
  return {
    version: process.version,
    execPath: process.execPath,
    pid: process.pid.toString(),
    ppid: process.ppid.toString(),
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    argv: process.argv.join(' '),
  };
}

/**
 * Get information about tool groups and their status
 */
export function getToolGroupsInfo(): Record<string, unknown> {
  const selectiveMode = isSelectiveToolsEnabled();
  const enabledGroups = listEnabledGroups();

  const toolGroups: Record<string, { enabled: boolean; envVar: string }> = {};

  // Add information about each tool group
  for (const group of Object.values(ToolGroup)) {
    const isEnabled = process.env[group] === 'true';
    toolGroups[group] = {
      enabled: isEnabled,
      envVar: group,
    };
  }

  return {
    selectiveMode,
    enabledGroups,
    groups: toolGroups,
  };
}

/**
 * Get a list of individually enabled tools via environment variables
 */
function getIndividuallyEnabledTools(): string[] {
  return Object.keys(process.env)
    .filter((key) => key.startsWith('DATAROUTEMCP_TOOL_') && process.env[key] === 'true')
    .map((key) => key.replace('DATAROUTEMCP_TOOL_', ''));
}

/**
 * Run the diagnostic tool and return the results
 * @returns Promise resolving to ToolResponse with diagnostic information
 */
export async function runDiagnosticTool(): Promise<ToolResponse> {
  log('info', `${LOG_PREFIX}: Running diagnostic tool`);

  // Get environment variables
  const envVars = getEnvironmentVariables();

  // Get system information
  const systemInfo = getSystemInfo();

  // Get Node.js information
  const nodeInfo = getNodeInfo();

  // Get tool groups information
  const toolGroupsInfo = getToolGroupsInfo();

  // Get individually enabled tools
  const individuallyEnabledTools = getIndividuallyEnabledTools();

  // Compile the diagnostic information
  const diagnosticInfo = {
    serverVersion: version,
    timestamp: new Date().toISOString(),
    system: systemInfo,
    node: nodeInfo,
    environmentVariables: envVars,
    companionApp: checkBinaryAvailability(COMPANION_APP_CONTENTS_PATH),
    toolGroups: toolGroupsInfo as {
      selectiveMode: boolean;
      enabledGroups: string[];
      groups: Record<string, { enabled: boolean; envVar: string }>;
    },
    individuallyEnabledTools,
  };

  // Format the diagnostic information as a nicely formatted text response
  const formattedOutput = [
    `# DataRouteMCP Diagnostic Report`,
    `\nGenerated: ${diagnosticInfo.timestamp}`,
    `Server Version: ${diagnosticInfo.serverVersion}`,

    `\n## System Information`,
    ...Object.entries(diagnosticInfo.system).map(([key, value]) => `- ${key}: ${value}`),

    `\n## Node.js Information`,
    ...Object.entries(diagnosticInfo.node).map(([key, value]) => `- ${key}: ${value}`),

    `\n## Environment Variables`,
    ...Object.entries(diagnosticInfo.environmentVariables)
      .filter(([key]) => key !== 'PATH' && key !== 'PYTHONPATH') // These are too long, handle separately
      .map(([key, value]) => `- ${key}: ${value || '(not set)'}`),

    `\n### PATH`,
    `\`\`\``,
    `${diagnosticInfo.environmentVariables.PATH || '(not set)'}`.split(':').join('\n'),
    `\`\`\``,

    `\n## Tools Status`,

    `\n### Tool Groups Status`,
    ...(diagnosticInfo.toolGroups.selectiveMode
      ? Object.entries(diagnosticInfo.toolGroups.groups).map(([group, info]) => {
          // Extract the group name without the prefix for display purposes
          const displayName = group.replace('DATAROUTEMCP_GROUP_', '');
          return `- ${displayName}: ${info.enabled ? '✅ Enabled' : '❌ Disabled'} (Set with ${info.envVar}=true)`;
        })
      : ['- All tool groups are enabled (selective mode is disabled).']),

    `\n### Individually Enabled Tools`,
    ...(diagnosticInfo.toolGroups.selectiveMode
      ? diagnosticInfo.individuallyEnabledTools.length > 0
        ? diagnosticInfo.individuallyEnabledTools.map(
            (tool) => `- ${tool}: ✅ Enabled (via DATAROUTEMCP_TOOL_${tool}=true)`,
          )
        : ['- No tools are individually enabled via environment variables.']
      : ['- All tools are enabled (selective mode is disabled).']),

    `\n## Utility Availability Summary`,
    `- Companion App: ${diagnosticInfo.companionApp.available ? '\u2705 Available' : '\u274c Not available'}`,

    `\n## Sentry`,
    `- Sentry enabled: ${diagnosticInfo.environmentVariables.SENTRY_DISABLED !== 'true' ? '✅ Yes' : '❌ No'}`,

    `\n## Troubleshooting Tips`,
    `- Ensure companion app is installed`,
    `- To enable specific tool groups, set the appropriate environment variables (e.g., \`export DATAROUTEMCP_GROUP_DISCOVERY=true\`)`,
    `- If you're having issues with environment variables, make sure to use the correct prefix:`,
    `  - Use \`DATAROUTEMCP_GROUP_NAME=true\` to enable a tool group`,
    `  - Use \`DATAROUTEMCP_TOOL_NAME=true\` to enable an individual tool`,
    `  - Common mistake: Using \`DATAROUTEMCP_ASSETS=true\` instead of \`DATAROUTEMCP_GROUP_ASSETS=true\``,
  ].join('\n');

  return {
    content: [
      {
        type: 'text',
        text: formattedOutput,
      },
    ],
  };
}

/**
 * Registers the diagnostic tool with the dispatcher.
 * This tool is only registered when the DATAROUTEMCP_DEBUG environment variable is set.
 * @param server The McpServer instance.
 */
export function registerDiagnosticTool(server: McpServer): void {
  server.tool(
    'diagnostic',
    'Provides comprehensive information about the MCP server environment, available dependencies, and configuration status.',
    {
      enabled: z.boolean().optional().describe('Optional: dummy parameter to satisfy MCP protocol'),
    },
    async (): Promise<ToolResponse> => {
      return runDiagnosticTool();
    },
  );
}
