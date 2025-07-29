/**
 * Launch Tools - Tools for launching and stopping companion app
 *
 * This module provides tools for launching and stopping companion app.
 *
 * Responsibilities:
 * - Launching companion app for project capture
 * - Stopping running companion app instances
 */

import { log } from '../utils/logger.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolResponse } from '../types/common.js';
import { executeCommand, execPromise } from '../utils/command.js';
import {
  COMPANION_APP_NAME,
  COMPANION_APP_PATH,
  COMPANION_APP_CONTENTS_PATH,
  PROJECT_NAME,
} from '../utils/constants.js';
import { getProjectPath } from '../utils/workspace.js';

export function registerCheckCompanionAppStatusTool(server: McpServer): void {
  server.tool(
    'check_companion_app_status',
    'Checks whether the companion app is currently running with the same project directory or not. Use this tool before launching or stopping the companion app to determine the current state. DO NOT STOP THE APP IF IT IS RUNNING WITH A DIFFERENT PROJECT DIRECTORY.',
    {},
    async (): Promise<ToolResponse> => {
      log('info', 'Checking companion app status');

      try {
        const checkProcesses = async (): Promise<string[]> => {
          try {
            const result = await execPromise(`pgrep -l "${COMPANION_APP_NAME}"`, {
              encoding: 'utf8',
            });
            return result.stdout
              .trim()
              .split('\n')
              .filter((line) => line.length > 0);
          } catch {
            return [];
          }
        };

        const getWindowTitle = async (): Promise<string | null> => {
          try {
            const result = await execPromise(
              `osascript -e 'tell application "System Events" to get name of every window of application process "${COMPANION_APP_NAME}"'`,
              { encoding: 'utf8' }
            );
            const windowNames = result.stdout.trim();

            log('info', `Window names: ${windowNames}`);

            if (windowNames && windowNames !== 'missing value') {
              return windowNames.split(', ').filter((name) => name.includes(COMPANION_APP_NAME))[0];
            }
            return null;
          } catch {
            return null;
          }
        };

        const extractProjectPath = (windowTitle: string): string | null => {
          const match = windowTitle.trim().match(new RegExp(`${COMPANION_APP_NAME} \\((.+)\\)`));
          if (match) {
            const fullPath = match[1];
            const pathParts = fullPath.split('/');
            const projectIndex = pathParts.findIndex(part => part === PROJECT_NAME);
            if (projectIndex > 0) {
              return pathParts.slice(0, projectIndex + 1).join('/');
            }
            return fullPath;
          }
          return null;
        };

        const projectPath = getProjectPath();

        const runningProcesses = await checkProcesses();

        if (runningProcesses.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'Companion app status: NOT RUNNING\n\nNo companion app processes found. The app can be safely launched.',
              },
            ],
          };
        }

        const windowTitle = await getWindowTitle();

        log('info', `Window title: ${windowTitle}`);

        const runningProjectPath = windowTitle ? extractProjectPath(windowTitle) : null;

        if (runningProjectPath) {
          const isSameProject = runningProjectPath === projectPath;
          
          if (isSameProject) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Companion app status: RUNNING WITH SAME PROJECT\n\nFound ${runningProcesses.length} running companion app processes:\n${runningProcesses.join('\n')}\n\nCurrent project directory: ${projectPath}\nRunning project directory: ${runningProjectPath}\nWindow title: ${windowTitle}\n\nThe app is currently active with the same project directory. Use stop_companion_app to terminate before launching a new instance.`,
                },
              ],
            };
          } else {
            return {
              content: [
                {
                  type: 'text',
                  text: `Companion app status: RUNNING WITH DIFFERENT PROJECT\n\nFound ${runningProcesses.length} running companion app processes:\n${runningProcesses.join('\n')}\n\nCurrent project directory: ${projectPath}\nRunning project directory: ${runningProjectPath}\nWindow title: ${windowTitle}\n\nThe app is currently active with a different project directory. DO NOT STOP this instance - it belongs to another project.`,
                },
              ],
            };
          }
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `Companion app status: RUNNING\n\nFound ${runningProcesses.length} running companion app processes:\n${runningProcesses.join('\n')}\n\nThe app is currently active but project directory could not be determined. Use stop_companion_app to terminate before launching a new instance.`,
              },
            ],
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log('error', `Error checking companion app status: ${errorMessage}`);
        return {
          content: [
            {
              type: 'text',
              text: `Failed to check companion app status: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );
}

export function registerLaunchCompanionAppTool(server: McpServer): void {
  server.tool(
    'launch_companion_app',
    `Launches the companion app for capturing screenshots and videos. IMPORTANT: Use check_companion_app_status first to verify no instance with the same project directory is running. DO NOT STOP THE APP IF IT IS RUNNING WITH A DIFFERENT PROJECT DIRECTORY. Example: launch_companion_app()`,
    {},
    async (): Promise<ToolResponse> => {
      log('info', 'Launching companion app');

      try {
        const projectPath = getProjectPath();

        const command = [COMPANION_APP_CONTENTS_PATH, '-p', projectPath];
        const result = await executeCommand(command, 'Launch companion app', true, undefined, true);

        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Launch companion app failed: ${result.error}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `Companion app launched successfully with project directory: ${projectPath}`,
            },
            {
              type: 'text',
              text: `The companion app will:
  1. Allow you to start / stop screenshot capture for project artifacts
2. Allow you to start / stop video recording for project artifacts
3. Save all project artifacts to: ${projectPath}

Next Steps:
  1. User may request to stop the companion app at any time`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log('error', `Error during launch companion app operation: ${errorMessage} `);
        return {
          content: [
            {
              type: 'text',
              text: `Launch companion app failed: ${errorMessage} `,
            },
          ],
        };
      }
    },
  );
}

export function registerStopCompanionAppTool(server: McpServer): void {
  server.tool(
    'stop_companion_app',
    'Stops any running instances of the companion app. IMPORTANT: Use check_companion_app_status first to verify if the app is running with the same project directory before attempting to stop it. DO NOT STOP THE APP IF IT IS RUNNING WITH A DIFFERENT PROJECT DIRECTORY.',
    {},
    async (): Promise<ToolResponse> => {
      log('info', 'Stopping companion app');

      const results: string[] = [];

      try {
        const checkProcesses = async (): Promise<string[]> => {
          try {
            const result = await execPromise(`pgrep -l "${COMPANION_APP_NAME}"`, {
              encoding: 'utf8',
            });
            return result.stdout
              .trim()
              .split('\n')
              .filter((line) => line.length > 0);
          } catch {
            return [];
          }
        };

        const runningProcessesBefore = await checkProcesses();

        if (runningProcessesBefore.length === 0) {
          results.push('No running simctl processes found - nothing to stop');
          return {
            content: [
              {
                type: 'text',
                text: results.join('\n'),
              },
            ],
          };
        }

        results.push(
          `Found ${runningProcessesBefore.length} running simctl processes: ${runningProcessesBefore.join(', ')}`,
        );

        let processesRemaining = await checkProcesses();

        if (processesRemaining.length > 0) {
          try {
            await execPromise(`pkill -f "${COMPANION_APP_NAME}"`, { encoding: 'utf8' });
            results.push('Attempted to kill processes using pkill');
            await new Promise((resolve) => setTimeout(resolve, 500));
            processesRemaining = await checkProcesses();
          } catch (error) {
            results.push(`pkill command completed`);
          }
        }

        if (processesRemaining.length > 0) {
          try {
            await execPromise(`osascript -e 'tell application "${COMPANION_APP_NAME}" to quit'`, {
              encoding: 'utf8',
            });
            results.push('Attempted to quit application using osascript');
            await new Promise((resolve) => setTimeout(resolve, 500));
            processesRemaining = await checkProcesses();
          } catch (error) {
            results.push(`osascript quit command completed`);
          }
        }

        if (processesRemaining.length > 0) {
          try {
            await execPromise(`pkill -9 -f "${COMPANION_APP_PATH}"`, { encoding: 'utf8' });
            results.push('Attempted force kill using full app path');
            await new Promise((resolve) => setTimeout(resolve, 500));
            processesRemaining = await checkProcesses();
          } catch (error) {
            results.push(`Force kill command completed`);
          }
        }

        const runningProcessesAfter = await checkProcesses();

        if (runningProcessesAfter.length === 0) {
          results.push('All simctl processes successfully stopped');
        } else {
          results.push(
            `Warning: ${runningProcessesAfter.length} simctl processes still running: ${runningProcessesAfter.join(', ')}`,
          );
        }

        return {
          content: [
            {
              type: 'text',
              text: results.join('\n'),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log('error', `Error during stop simctl app operation: ${errorMessage}`);
        return {
          content: [
            {
              type: 'text',
              text: `Stop simctl app failed: ${errorMessage}\n${results.join('\n')}`,
            },
          ],
        };
      }
    },
  );
}

export function registerInstallBrewAndFfmpegTool(server: McpServer): void {
  server.tool(
    'install_brew_and_ffmpeg',
    'Installs Homebrew package manager and then installs FFmpeg via Homebrew. This tool handles the complete setup process for video processing dependencies.',
    {},
    async (): Promise<ToolResponse> => {
      log('info', 'Installing Homebrew and FFmpeg');

      try {
        log('info', 'Step 1: Installing Homebrew...');

        const brewInstallCommand = [
          '/bin/bash',
          '-c',
          'curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash',
        ];

        const brewResult = await executeCommand(brewInstallCommand, 'Install Homebrew', false);

        if (!brewResult.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Homebrew installation failed: ${brewResult.error}`,
              },
            ],
          };
        }

        log('info', 'Step 2: Installing FFmpeg via Homebrew...');

        const ffmpegInstallCommand = ['brew', 'install', 'ffmpeg'];
        const ffmpegResult = await executeCommand(ffmpegInstallCommand, 'Install FFmpeg');

        if (!ffmpegResult.success) {
          return {
            content: [
              {
                type: 'text',
                text: `FFmpeg installation failed: ${ffmpegResult.error}. Homebrew was installed successfully.`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: 'Successfully installed Homebrew and FFmpeg!',
            },
            {
              type: 'text',
              text: `Installation completed:
1. ✅ Homebrew package manager installed
2. ✅ FFmpeg video processing tool installed

You can now use FFmpeg for video processing tasks. The system is ready for video capture and processing workflows.`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log('error', `Error during Homebrew and FFmpeg installation: ${errorMessage}`);
        return {
          content: [
            {
              type: 'text',
              text: `Installation failed: ${errorMessage}`,
            },
          ],
        };
      }
    },
  );
}
