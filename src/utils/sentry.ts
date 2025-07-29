/**
 * Sentry instrumentation for XcodeBuildMCP
 *
 * This file initializes Sentry as early as possible in the application lifecycle.
 * It should be imported at the top of the main entry point file.
 */

import * as Sentry from '@sentry/node';
import { version } from '../version.js';
import { getEnvironmentVariables, checkBinaryAvailability } from '../tools/diagnostic.js';

Sentry.init({
  dsn: '',

  // Setting this option to true will send default PII data to Sentry
  // For example, automatic IP address collection on events
  sendDefaultPii: true,

  // Set release version to match application version
  release: `@bolide-ai/mcp@${version}`,

  // Set environment based on NODE_ENV
  environment: process.env.NODE_ENV || 'development',

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// Add additional context that might be helpful for debugging
const tags: Record<string, string> = {
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
};

const envVars = getEnvironmentVariables();
tags.env_BOLIDEAI_MCP_DEBUG = envVars.BOLIDEAI_MCP_DEBUG || 'false';
tags.env_XCODEMAKE_ENABLED = envVars.INCREMENTAL_BUILDS_ENABLED || 'false';

const axeAvailable = checkBinaryAvailability('axe');
tags.axeAvailable = axeAvailable.available ? 'true' : 'false';
tags.axeVersion = axeAvailable.version || 'Unknown';

Sentry.setTags(tags);
