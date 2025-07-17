import { z } from 'zod';
import { existsSync, writeFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { registerTool } from './common.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { log } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';
import { getWorkspacePath } from '../utils/workspace.js';

const CreatePostAssetSchema = z.object({
  name: z.string().describe('Name of the post asset file to create'),
  content: z
    .string()
    .describe(
      'Text content to store in the post asset. IMPORTANT: Use only post body, do not include title.',
    ),
});

const CreateResearchAssetSchema = z.object({
  name: z.string().describe('Name of the research asset file to create'),
  content: z
    .string()
    .describe(
      'Research content to store in the research asset.',
    ),
});

type CreatePostAssetParams = z.infer<typeof CreatePostAssetSchema>;
type CreateResearchAssetParams = z.infer<typeof CreateResearchAssetSchema>;

async function createPostAsset(params: CreatePostAssetParams): Promise<string> {
  const { name, content } = params;

  const workspacePath = getWorkspacePath();

  const assetsDirectory = join(workspacePath, 'marketing', 'assets');

  log('info', `Creating post asset ${name} in ${assetsDirectory}`);

  if (!existsSync(assetsDirectory)) {
    await mkdir(assetsDirectory, { recursive: true });

    log('info', `Created assets directory at ${assetsDirectory}`);
  }

  const postsDirectory = join(assetsDirectory, 'posts');

  if (!existsSync(postsDirectory)) {
    try {
      await mkdir(postsDirectory, { recursive: true });
      log('info', `Created posts directory at ${postsDirectory}`);
    } catch (error) {
      throw new ValidationError(
        `Failed to create posts directory: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const fileName = name.endsWith('.md') ? name : `${name}.md`;
  const filePath = join(postsDirectory, fileName);

  if (existsSync(filePath)) {
    throw new ValidationError(`Post asset already exists at ${filePath}`);
  }

  try {
    writeFileSync(filePath, content, 'utf8');

    log('info', `Successfully created post asset at ${filePath}`);

    return filePath;
  } catch (error) {
    throw new ValidationError(
      `Failed to create post asset: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function createResearchAsset(params: CreateResearchAssetParams): Promise<string> {
  const { name, content } = params;

  const workspacePath = getWorkspacePath();

  const assetsDirectory = join(workspacePath, 'marketing', 'assets');

  log('info', `Creating research asset ${name} in ${assetsDirectory}`);

  if (!existsSync(assetsDirectory)) {
    await mkdir(assetsDirectory, { recursive: true });

    log('info', `Created assets directory at ${assetsDirectory}`);
  }

  const researchDirectory = join(assetsDirectory, 'research');

  if (!existsSync(researchDirectory)) {
    try {
      await mkdir(researchDirectory, { recursive: true });
      log('info', `Created research directory at ${researchDirectory}`);
    } catch (error) {
      throw new ValidationError(
        `Failed to create research directory: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const fileName = name.endsWith('.md') ? name : `${name}.md`;
  const filePath = join(researchDirectory, fileName);

  if (existsSync(filePath)) {
    throw new ValidationError(`Research asset already exists at ${filePath}`);
  }

  try {
    writeFileSync(filePath, content, 'utf8');

    log('info', `Successfully created research asset at ${filePath}`);

    return filePath;
  } catch (error) {
    throw new ValidationError(
      `Failed to create research asset: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function registerAssetGeneratorTools(server: McpServer): void {
  registerTool<CreatePostAssetParams>(
    server,
    'create_post_asset',
    'Creates a post asset file in the marketing assets directory. IMPORTANT: You MUST provide the name and content parameters. Example: create_post_asset({ name: "FILE_NAME", content: "FILE_CONTENT" })',
    CreatePostAssetSchema.shape,
    async (params) => {
      try {
        const filePath = await createPostAsset(params);

        const response = {
          success: true,
          filePath,
          message: `Successfully created post asset at ${filePath}`,
          name: params.name,
          textLength: params.content.length,
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
          `Failed to create post asset: ${error instanceof Error ? error.message : String(error)}`,
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

  registerTool<CreateResearchAssetParams>(
    server,
    'create_research_asset',
    'Creates a research asset file in the marketing assets directory. IMPORTANT: You MUST provide the name and content parameters. Example: create_research_asset({ name: "FILE_NAME", content: "RESEARCH_CONTENT" })',
    CreateResearchAssetSchema.shape,
    async (params) => {
      try {
        const filePath = await createResearchAsset(params);

        const response = {
          success: true,
          filePath,
          message: `Successfully created research asset at ${filePath}`,
          name: params.name,
          textLength: params.content.length,
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
          `Failed to create research asset: ${error instanceof Error ? error.message : String(error)}`,
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
