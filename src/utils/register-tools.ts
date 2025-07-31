// Import launch tools
import {
  registerCheckCompanionAppStatusTool,
  registerLaunchCompanionAppTool,
  registerStopCompanionAppTool,
  registerInstallBrewAndFfmpegTool,
} from '../tools/launch.js';

// Import diagnostic tool
import { registerDiagnosticTool } from '../tools/diagnostic.js';

// Import scaffold tool
import { registerScaffoldTools } from '../tools/scaffold.js';

// Import content generator tools
import { registerContentGeneratorTools } from '../tools/content-generators.js';

// Import research tools
import { registerResearchTools } from '../tools/research.js';

// Import notion tools
import { registerNotionTools } from '../tools/notion.js';

// Import slack tools
import { registerSlackTools } from '../tools/slack.js';

// Import linear tools
import { registerLinearTools } from '../tools/linear.js';

// Import MCP server
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Import tool group utilities
import { ToolGroup, registerIfEnabled } from './tool-groups.js';

// Define tool registrations with their workflow-based groups
const toolRegistrations = [
  // Launch tools
  {
    register: registerCheckCompanionAppStatusTool,
    groups: [ToolGroup.LAUNCH],
    envVar: 'BOLIDE_AI_MCP_TOOL_CHECK_COMPANION_APP_STATUS',
  },
  {
    register: registerLaunchCompanionAppTool,
    groups: [ToolGroup.LAUNCH],
    envVar: 'BOLIDE_AI_MCP_TOOL_LAUNCH_COMPANION_APP',
  },
  {
    register: registerStopCompanionAppTool,
    groups: [ToolGroup.LAUNCH],
    envVar: 'BOLIDE_AI_MCP_TOOL_STOP_COMPANION_APP',
  },
  {
    register: registerInstallBrewAndFfmpegTool,
    groups: [ToolGroup.LAUNCH],
    envVar: 'BOLIDE_AI_MCP_TOOL_INSTALL_BREW_AND_FFMPEG',
  },

  // Scaffold tool
  {
    register: registerScaffoldTools,
    groups: [ToolGroup.SCAFFOLDING],
    envVar: 'BOLIDE_AI_MCP_TOOL_SCAFFOLD_PROJECT',
  },

  // Content generator tools
  {
    register: registerContentGeneratorTools,
    groups: [ToolGroup.CONTENT_GENERATORS],
    envVar: 'BOLIDE_AI_MCP_TOOL_CONTENT_GENERATORS',
  },

  // Research tools
  {
    register: registerResearchTools,
    groups: [ToolGroup.RESEARCH],
    envVar: 'BOLIDE_AI_MCP_TOOL_USE_PERPLEXITY',
  },

  // Notion tools
  {
    register: registerNotionTools,
    groups: [ToolGroup.NOTION],
    envVar: 'BOLIDE_AI_MCP_TOOL_NOTION',
  },

  // Slack tools
  {
    register: registerSlackTools,
    groups: [ToolGroup.SLACK],
    envVar: 'BOLIDE_AI_MCP_TOOL_SLACK',
  },

  // Linear tools
  {
    register: registerLinearTools,
    groups: [ToolGroup.LINEAR],
    envVar: 'BOLIDE_AI_MCP_TOOL_LINEAR',
  },
];

// Diagnostic tool
const diagnosticTool = {
  register: registerDiagnosticTool,
  groups: [ToolGroup.DIAGNOSTICS],
  envVar: 'BOLIDE_AI_MCP_DEBUG',
};

export function registerTools(server: McpServer): void {
  // Register all tools using the new system
  for (const toolReg of toolRegistrations) {
    registerIfEnabled(server, toolReg);
  }

  // Register diagnostic tool - conditionally based on debug env var
  if (process.env.BOLIDE_AI_MCP_DEBUG) {
    registerIfEnabled(server, diagnosticTool);
  }
}
