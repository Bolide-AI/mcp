/**
 * Command Utilities - Generic command execution utilities
 *
 * This utility module provides functions for executing shell commands.
 * It serves as a foundation for other utility modules that need to execute commands.
 *
 * Responsibilities:
 * - Executing shell commands with proper argument handling
 * - Managing process spawning, output capture, and error handling
 */

import { spawn, ChildProcess } from 'child_process';
import { log } from './logger.js';
import { promisify } from 'util';
import { exec } from 'child_process';

/**
 * Command execution response interface
 */
export interface CommandResponse {
  success: boolean;
  output: string;
  error?: string;
  process: ChildProcess;
}

export const execPromise = promisify(exec);

/**
 * Execute a command
 * @param command An array of command and arguments
 * @param logPrefix Prefix for logging
 * @param useShell Whether to use shell execution (true) or direct execution (false)
 * @param env Additional environment variables
 * @param detached Whether to run the command detached without waiting for stdio
 * @returns Promise resolving to command response with the process
 */
export async function executeCommand(
  command: string[],
  logPrefix?: string,
  useShell: boolean = true,
  env?: Record<string, string>,
  detached: boolean = false,
): Promise<CommandResponse> {
  // Properly escape arguments for shell
  let escapedCommand = command;
  if (useShell) {
    // For shell execution, we need to format as ['sh', '-c', 'full command string']
    const commandString = command
      .map((arg) => {
        // If the argument contains spaces or special characters, wrap it in quotes
        // Ensure existing quotes are escaped
        if (/[\s,"'=]/.test(arg) && !/^".*"$/.test(arg)) {
          // Check if needs quoting and isn't already quoted
          return `"${arg.replace(/(["\\])/g, '\\$1')}"`; // Escape existing quotes and backslashes
        }
        return arg;
      })
      .join(' ');

    escapedCommand = ['sh', '-c', commandString];
  }

  // Log the actual command that will be executed
  const displayCommand =
    useShell && escapedCommand.length === 3 ? escapedCommand[2] : escapedCommand.join(' ');
  log('info', `Executing ${logPrefix || ''} command: ${displayCommand}`);

  return new Promise((resolve, reject) => {
    const executable = escapedCommand[0];
    const args = escapedCommand.slice(1);

    const spawnOptions: any = {
      stdio: ['ignore', 'pipe', 'pipe'],
    };

    if (env) {
      spawnOptions.env = { ...process.env, ...env };
    }

    if (detached) {
      spawnOptions.detached = true;
      spawnOptions.stdio = 'ignore';
    }

    const childProcess = spawn(executable, args, spawnOptions);

    if (detached) {
      childProcess.unref();
      const response: CommandResponse = {
        success: true,
        output: '',
        process: childProcess,
      };
      resolve(response);
      return;
    }

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    childProcess.on('close', (code) => {
      const success = code === 0;
      const response: CommandResponse = {
        success,
        output: stdout,
        error: success ? undefined : stderr,
        process: childProcess,
      };

      resolve(response);
    });

    childProcess.on('error', (err) => {
      reject(err);
    });
  });
}
