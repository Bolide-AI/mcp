import { z } from 'zod';
import { existsSync } from 'fs';
import { mkdir, copyFile, readdir, stat, writeFile } from 'fs/promises';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { registerTool } from './common.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { log } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';
import { getWorkspacePath, getProjectPath } from '../utils/workspace.js';
import { PROJECT_NAME } from '../utils/constants.js';

const ScaffoldBolideAIProjectSchema = z.object({});

type ScaffoldBolideAIProjectParams = z.infer<typeof ScaffoldBolideAIProjectSchema>;

async function updateWorkspaceFile(workspacePath: string): Promise<void> {
  const workspaceFiles = glob.sync('*.code-workspace', { cwd: workspacePath });

  if (workspaceFiles.length === 0) {
    log('info', 'No .code-workspace file found, skipping workspace update');
    return;
  }

  const workspaceFile = workspaceFiles[0];
  const workspaceFilePath = join(workspacePath, workspaceFile);

  log('info', `Found workspace file: ${workspaceFile}`);

  try {
    const workspaceContent = readFileSync(workspaceFilePath, 'utf8');
    const workspace = JSON.parse(workspaceContent);

    if (!workspace.folders) {
      workspace.folders = [];
    }

    const rootFolderExists = workspace.folders.some((folder: any) => folder.path === '.');

    if (rootFolderExists) {
      log('info', 'Workspace was initialized with a root folder, skipping workspace update');

      return;
    }

    const projectFolderExists = workspace.folders.some(
      (folder: any) => folder.path === PROJECT_NAME || folder.path === `./${PROJECT_NAME}`,
    );

    if (!projectFolderExists) {
      workspace.folders.push({ path: PROJECT_NAME });

      writeFileSync(workspaceFilePath, JSON.stringify(workspace, null, 2));
      log('info', `Added project folder to workspace file: ${workspaceFile}`);
    } else {
      log('info', 'Project folder already exists in workspace file');
    }
  } catch (error) {
    log(
      'error',
      `Failed to update workspace file: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function copyTemplateContents(templatePath: string, targetPath: string): Promise<void> {
  if (!existsSync(templatePath)) {
    log('info', `Template directory not found at ${templatePath}, skipping template copy`);
    return;
  }

  try {
    const items = await readdir(templatePath);

    for (const item of items) {
      const sourcePath = join(templatePath, item);
      const targetItemPath = join(targetPath, item);

      const itemStats = await stat(sourcePath);

      if (itemStats.isDirectory()) {
        await mkdir(targetItemPath, { recursive: true });
        await copyTemplateContents(sourcePath, targetItemPath);
      } else {
        await copyFile(sourcePath, targetItemPath);
        log('info', `Copied template file: ${item}`);
      }
    }
  } catch (error) {
    log(
      'error',
      `Failed to copy template contents: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

async function scaffoldProject(params: ScaffoldBolideAIProjectParams): Promise<string> {
  const workspacePath = getWorkspacePath();

  log('info', `Scaffolding project at ${workspacePath}`);

  const projectPath = getProjectPath();
  const callsPath = join(projectPath, 'calls');
  const dictationPath = join(projectPath, 'dictation');
  const gifsPath = join(projectPath, 'gifs');
  const screencastsPath = join(projectPath, 'screencasts');
  const screenshotsPath = join(projectPath, 'screenshots');

  const currentFileUrl = import.meta.url;
  const currentFilePath = fileURLToPath(currentFileUrl);

  log('info', `Current file path: ${currentFilePath}`);

  const mcpBuildDir = dirname(currentFilePath);
  const templatePath = join(mcpBuildDir, 'template');

  log('info', `Template path: ${templatePath}`);

  if (existsSync(projectPath)) {
    throw new ValidationError(`Project directory already exists at ${projectPath}`);
  }

  try {
    await mkdir(projectPath, { recursive: true });
    await mkdir(callsPath, { recursive: true });
    await mkdir(dictationPath, { recursive: true });
    await mkdir(gifsPath, { recursive: true });
    await mkdir(screencastsPath, { recursive: true });
    await mkdir(screenshotsPath, { recursive: true });

    await writeFile(join(callsPath, '.gitkeep'), '');
    await writeFile(join(dictationPath, '.gitkeep'), '');
    await writeFile(join(gifsPath, '.gitkeep'), '');
    await writeFile(join(screencastsPath, '.gitkeep'), '');
    await writeFile(join(screenshotsPath, '.gitkeep'), '');

    await copyTemplateContents(templatePath, projectPath);

    await updateWorkspaceFile(workspacePath);

    return projectPath;
  } catch (error) {
    throw new ValidationError(
      `Failed to create project: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function registerScaffoldTools(server: McpServer): void {
  registerTool<ScaffoldBolideAIProjectParams>(
    server,
    'scaffold_bolide_ai_project',
    'Create a bolide.ai project directory with calls, dictation, gifs, screencasts, and screenshots subdirectories. Example: scaffold_bolide_ai_project()',
    ScaffoldBolideAIProjectSchema.shape,
    async (params) => {
      try {
        const projectPath = await scaffoldProject(params);

        const response = {
          success: true,
          projectPath,
          message: `Successfully created project at ${projectPath}`,
          structure: {
            [PROJECT_NAME]: {
              calls: {
                description: 'Directory for call recordings',
              },
              dictation: {
                description: 'Directory for dictation recordings',
              },
              gifs: {
                description: 'Directory for generated GIFs',
              },
              screencasts: {
                description: 'Directory for screencast recordings',
              },
              screenshots: {
                description: 'Directory for screenshot recordings',
              },
            },
          },
          nextSteps: [
            `Navigate to ${projectPath} to start organizing your project materials`
          ],
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        log(
          'error',
          `Failed to scaffold project: ${error instanceof Error ? error.message : String(error)}`,
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error occurred',
                },
                null,
                2,
              ),
            },
          ],
        };
      }
    },
  );
}
