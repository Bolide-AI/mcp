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
import { getWorkspacePath } from '../utils/workspace.js';

const ScaffoldMarketingProjectSchema = z.object({});

type ScaffoldMarketingProjectParams = z.infer<typeof ScaffoldMarketingProjectSchema>;

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

    const marketingFolderExists = workspace.folders.some(
      (folder: any) => folder.path === 'marketing' || folder.path === './marketing',
    );

    if (!marketingFolderExists) {
      workspace.folders.push({ path: 'marketing' });

      writeFileSync(workspaceFilePath, JSON.stringify(workspace, null, 2));
      log('info', `Added marketing folder to workspace file: ${workspaceFile}`);
    } else {
      log('info', 'Marketing folder already exists in workspace file');
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

async function scaffoldMarketingProject(params: ScaffoldMarketingProjectParams): Promise<string> {
  const workspacePath = getWorkspacePath();

  log('info', `Scaffolding marketing project at ${workspacePath}`);

  const marketingPath = join(workspacePath, 'marketing');
  const assetsPath = join(marketingPath, 'assets');
  const artifactsPath = join(marketingPath, 'artifacts');

  const currentFileUrl = import.meta.url;
  const currentFilePath = fileURLToPath(currentFileUrl);

  log('info', `Current file path: ${currentFilePath}`);

  const mcpBuildDir = dirname(currentFilePath);
  const templatePath = join(mcpBuildDir, 'template');

  log('info', `Template path: ${templatePath}`);

  if (existsSync(marketingPath)) {
    throw new ValidationError(`Marketing directory already exists at ${marketingPath}`);
  }

  try {
    await mkdir(marketingPath, { recursive: true });
    await mkdir(assetsPath, { recursive: true });
    await mkdir(artifactsPath, { recursive: true });

    const postsPath = join(assetsPath, 'posts');
    const researchPath = join(assetsPath, 'research');
    await mkdir(postsPath, { recursive: true });
    await mkdir(researchPath, { recursive: true });

    await writeFile(join(assetsPath, '.gitkeep'), '');
    await writeFile(join(artifactsPath, '.gitkeep'), '');
    await writeFile(join(postsPath, '.gitkeep'), '');
    await writeFile(join(researchPath, '.gitkeep'), '');

    await copyTemplateContents(templatePath, marketingPath);

    await updateWorkspaceFile(workspacePath);

    return marketingPath;
  } catch (error) {
    throw new ValidationError(
      `Failed to create marketing project: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function registerScaffoldTools(server: McpServer): void {
  registerTool<ScaffoldMarketingProjectParams>(
    server,
    'scaffold_marketing_project',
    'Create a marketing project directory with assets and artifacts subdirectories. Example: scaffold_marketing_project()',
    ScaffoldMarketingProjectSchema.shape,
    async (params) => {
      try {
        const projectPath = await scaffoldMarketingProject(params);

        const response = {
          success: true,
          projectPath,
          message: `Successfully created marketing project at ${projectPath}`,
          structure: {
            marketing: {
              artifacts: {
                description: 'Directory for intermediate materials (screenshots and video recordings of app functionality)',
              },
              assets: {
                description: 'Directory for final materials (documentation, social media posts, help desk materials, etc.)',
                subdirectories: {
                  posts: {
                    description: 'Directory for social media posts and content',
                  },
                  research: {
                    description: 'Directory for research results',
                  },
                },
              },
            },
          },
          nextSteps: [
            `Navigate to ${projectPath} to start organizing your marketing materials`,
            'Create an artifact directory using the create_artifact_directory({ artifactName: "ARTIFACT_NAME" }) to start capturing screenshots, videos, and generating posts',
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
          `Failed to scaffold marketing project: ${error instanceof Error ? error.message : String(error)}`,
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
