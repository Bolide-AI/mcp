#!/usr/bin/env node

/**
 * Bolide AI MCP - Main entry point
 *
 * This file serves as the entry point for the Bolide AI MCP server, importing and registering
 * all tool modules with the MCP server. It follows the platform-specific approach for Xcode tools.
 *
 * Responsibilities:
 * - Creating and starting the MCP server
 * - Registering all platform-specific tool modules
 * - Configuring server options and logging
 * - Handling server lifecycle events
 */

// Import Sentry instrumentation
import './utils/sentry.js';

// Import server components
import { createServer, startServer } from './server/server.js';

// Import utilities
import { log } from './utils/logger.js';

// Import version
import { version } from './version.js';
import { registerTools } from './utils/register-tools.js';

/**
 * Main function to start the server
 */
async function main(): Promise<void> {
  try {
    // Create the server
    const server = createServer();

    // Register tools
    registerTools(server);

    // Start the server
    await startServer(server);

    // Clean up on exit
    process.on('SIGTERM', async () => {
      await server.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      await server.close();
      process.exit(0);
    });

    // Log successful startup
    log('info', `BolideAI MCP server (version ${version}) started successfully`);
  } catch (error) {
    console.error('Fatal error in main():', error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error('Unhandled exception:', error);
  // Give Sentry a moment to send the error before exiting
  setTimeout(() => process.exit(1), 1000);
});
