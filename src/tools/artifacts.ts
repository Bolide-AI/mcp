import { z } from 'zod';
import { existsSync, writeFileSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { registerTool } from './common.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { log } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';
import { getWorkspacePath } from '../utils/workspace.js';
import { PROJECT_NAME } from '../utils/constants.js';

const CreateArtifactDirectorySchema = z.object({
  artifactName: z
    .string()
    .describe(
      'Name of the artifact directory to create, e.g. "chat", "settings", "user profile", etc. IMPORTANT: DO NOT INCLUDE DATETIME',
    ),
});

const CreatePostArtifactSchema = z.object({
  artifactName: z.string().describe('Name of the artifact directory where the post will be stored'),
  fileName: z.string().describe('Name of the post file to create'),
  fileContent: z.string().describe('Content of the post file'),
});

type CreateArtifactDirectoryParams = z.infer<typeof CreateArtifactDirectorySchema>;
type CreatePostArtifactParams = z.infer<typeof CreatePostArtifactSchema>;

async function createArtifactDirectory(params: CreateArtifactDirectoryParams): Promise<string> {
  const { artifactName } = params;

  const workspacePath = getWorkspacePath();

  const artifactsDirectory = join(workspacePath, PROJECT_NAME, 'artifacts');

  if (!existsSync(artifactsDirectory)) {
    throw new ValidationError(`Artifacts directory does not exist at ${artifactsDirectory}`);
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);
  const timestampedArtifactName = `${artifactName}-${timestamp}`;

  log('info', `Creating artifact directory ${timestampedArtifactName} at ${artifactsDirectory}`);

  const artifactPath = join(artifactsDirectory, timestampedArtifactName);
  const subfolders = ['screenshots', 'videos', 'posts', 'gifs'];

  if (existsSync(artifactPath)) {
    throw new ValidationError(`Artifact directory already exists at ${artifactPath}`);
  }

  try {
    await mkdir(artifactPath, { recursive: true });

    for (const subfolder of subfolders) {
      const subfolderPath = join(artifactPath, subfolder);
      await mkdir(subfolderPath, { recursive: true });
      await writeFile(join(subfolderPath, '.gitkeep'), '');
    }

    return artifactPath;
  } catch (error) {
    throw new ValidationError(
      `Failed to create artifact directory: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function createPostArtifact(params: CreatePostArtifactParams): Promise<string> {
  const { artifactName, fileName, fileContent } = params;

  const workspacePath = getWorkspacePath();

  const artifactsDirectory = join(workspacePath, PROJECT_NAME, 'artifacts');

  if (!existsSync(artifactsDirectory)) {
    throw new ValidationError(`Artifacts directory does not exist at ${artifactsDirectory}`);
  }

  const artifactPath = join(artifactsDirectory, artifactName);

  if (!existsSync(artifactPath)) {
    throw new ValidationError(`Artifact directory does not exist at ${artifactPath}`);
  }

  const postsPath = join(artifactPath, 'posts');

  if (!existsSync(postsPath)) {
    try {
      await mkdir(postsPath, { recursive: true });
      log('info', `Created posts directory at ${postsPath}`);
    } catch (error) {
      throw new ValidationError(
        `Failed to create posts directory: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const filePath = join(postsPath, fileName);

  if (existsSync(filePath)) {
    throw new ValidationError(`Post file already exists at ${filePath}`);
  }

  try {
    writeFileSync(filePath, fileContent, 'utf8');
    log('info', `Successfully created post artifact at ${filePath}`);
    return filePath;
  } catch (error) {
    throw new ValidationError(
      `Failed to create post artifact: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function registerArtifactTools(server: McpServer): void {
  registerTool<CreateArtifactDirectoryParams>(
    server,
    'create_artifact_directory',
    'Creates a new artifact directory with screenshots, videos, and posts subfolders. IMPORTANT: You MUST provide the artifactName parameter. Example: create_artifact_directory({ artifactName: "ARTIFACT_NAME_WITHOUT_DATETIME" })',
    CreateArtifactDirectorySchema.shape,
    async (params) => {
      try {
        const artifactPath = await createArtifactDirectory(params);

        const response = {
          success: true,
          artifactPath,
          message: `Successfully created artifact directory at ${artifactPath}`,
          artifactName: params.artifactName,
          structure: {
            [artifactPath]: {
              screenshots: 'Directory for screenshot artifacts',
              videos: 'Directory for video artifacts',
              posts: 'Directory for post artifacts',
            },
          },
          nextSteps: [
            `Navigate to ${artifactPath} to start organizing your artifacts`,
            'Launch the companion app to start capturing screenshots and videos',
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
          `Failed to create artifact directory: ${error instanceof Error ? error.message : String(error)}`,
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

  registerTool<CreatePostArtifactParams>(
    server,
    'create_post_artifact',
    'Stores a post artifact in the given artifact directory. IMPORTANT: You MUST provide the artifactName, fileName, and fileContent parameters. Example: create_post_artifact({ artifactName: "ARTIFACT_NAME", fileName: "FILE_NAME", fileContent: "FILE_CONTENT" })',
    CreatePostArtifactSchema.shape,
    async (params) => {
      try {
        const filePath = await createPostArtifact(params);

        const response = {
          success: true,
          filePath,
          message: `Successfully created post artifact at ${filePath}`,
          artifactName: params.artifactName,
          fileName: params.fileName,
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
          `Failed to create post artifact: ${error instanceof Error ? error.message : String(error)}`,
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
