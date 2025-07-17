// Import launch tools
import {
  registerLaunchCompanionAppTool,
  registerStopCompanionAppTool,
  registerInstallBrewAndFfmpegTool,
} from '../tools/launch.js';

// Import diagnostic tool
import { registerDiagnosticTool } from '../tools/diagnostic.js';

// Import scaffold tool
import { registerScaffoldTools } from '../tools/scaffold.js';

// Import artifact tools
import { registerArtifactTools } from '../tools/artifacts.js';

// Import content generator tools
import { registerContentGeneratorTools } from '../tools/content-generators.js';

// Import asset generator tools
import { registerAssetGeneratorTools } from '../tools/assets.js';

// Import research tools
import { registerResearchTools } from '../tools/research.js';

// Import MCP server
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Import tool group utilities
import { ToolGroup, registerIfEnabled } from './tool-groups.js';

// Define tool registrations with their workflow-based groups
const toolRegistrations = [
  // Launch tools
  {
    register: registerLaunchCompanionAppTool,
    groups: [ToolGroup.LAUNCH],
    envVar: 'DATAROUTEMCP_TOOL_LAUNCH_COMPANION_APP',
  },
  {
    register: registerStopCompanionAppTool,
    groups: [ToolGroup.LAUNCH],
    envVar: 'DATAROUTEMCP_TOOL_STOP_COMPANION_APP',
  },
  {
    register: registerInstallBrewAndFfmpegTool,
    groups: [ToolGroup.LAUNCH],
    envVar: 'DATAROUTEMCP_TOOL_INSTALL_BREW_AND_FFMPEG',
  },

  // Scaffold tool
  {
    register: registerScaffoldTools,
    groups: [ToolGroup.SCAFFOLDING],
    envVar: 'DATAROUTEMCP_TOOL_SCAFFOLD_PROJECT',
  },

  // Artifact tools
  {
    register: registerArtifactTools,
    groups: [ToolGroup.ARTIFACTS],
    envVar: 'DATAROUTEMCP_TOOL_CREATE_ARTIFACT_DIRECTORY',
  },

  // Content generator tools
  {
    register: registerContentGeneratorTools,
    groups: [ToolGroup.CONTENT_GENERATORS],
    envVar: 'DATAROUTEMCP_TOOL_CONTENT_GENERATORS',
  },

  // Asset generator tools
  {
    register: registerAssetGeneratorTools,
    groups: [ToolGroup.ASSET_GENERATORS],
    envVar: 'DATAROUTEMCP_TOOL_CREATE_POST_ASSET',
  },

  // Research tools
  {
    register: registerResearchTools,
    groups: [ToolGroup.RESEARCH],
    envVar: 'DATAROUTEMCP_TOOL_USE_PERPLEXITY',
  },
];

// Diagnostic tool
const diagnosticTool = {
  register: registerDiagnosticTool,
  groups: [ToolGroup.DIAGNOSTICS],
  envVar: 'DATAROUTEMCP_DEBUG',
};

export function registerTools(server: McpServer): void {
  // Register all tools using the new system
  for (const toolReg of toolRegistrations) {
    registerIfEnabled(server, toolReg);
  }

  // Register diagnostic tool - conditionally based on debug env var
  if (process.env.DATAROUTEMCP_DEBUG) {
    registerIfEnabled(server, diagnosticTool);
  }
}
