import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool, createTextContent } from './common.js';
import { ComposioService } from '../services/composioService.js';

const NotionAddPageContentSchema = z.object({
  parent_block_id: z.string().describe('Identifier of the parent page or block to which the new content block will be added. This parent must be capable of having child blocks. Obtain valid IDs using other Notion actions or API calls.'),
  content_block: z.object({
    block_property: z.string().default('paragraph').describe('The block property of the block to be added. Possible properties are `paragraph`, `heading_1`, `heading_2`, `heading_3`, `callout`, `to_do`, `toggle`, `quote`, `bulleted_list_item`, `numbered_list_item`. Other properties possible are `file`, `image`, `video` (link required).'),
    content: z.string().optional().describe('The textual content of the rich text object. Required for paragraph, heading_1, heading_2, heading_3, callout, to_do, toggle, quote.'),
    link: z.string().optional().describe('The URL of the rich text object or the file to be uploaded or image/video link'),
    bold: z.boolean().default(false).describe('Indicates if the text is bold.'),
    italic: z.boolean().default(false).describe('Indicates if the text is italic.'),
    underline: z.boolean().default(false).describe('Indicates if the text is underlined.'),
    strikethrough: z.boolean().default(false).describe('Indicates if the text has strikethrough.'),
    code: z.boolean().default(false).describe('Indicates if the text is formatted as code.'),
    color: z.string().default('default').describe('The color of the text background or text itself.'),
  }).describe('Include these fields in the json: {\'content\': \'Some words\', \'link\': \'https://random-link.com\'. For content styling, refer to https://developers.notion.com/reference/rich-text.'),
  after: z.string().optional().describe('Identifier of an existing block. The new content block will be appended immediately after this block. If omitted, the new block is appended to the end of the parent\'s children list.'),
});

const NotionFetchDataSchema = z.object({
  get_all: z.boolean().default(false).describe('If true, fetches both pages and databases accessible to the Notion integration. Only one of get_pages, get_databases, or get_all can be true.'),
  get_databases: z.boolean().default(false).describe('If true, fetches all databases accessible to the Notion integration. Only one of get_pages, get_databases, or get_all can be true.'),
  get_pages: z.boolean().default(false).describe('If true, fetches all pages accessible to the Notion integration. Only one of get_pages, get_databases, or get_all can be true.'),
  page_size: z.number().int().min(1).max(100).default(100).describe('The maximum number of items to retrieve. Must be between 1 and 100, inclusive. Defaults to 100. Note: this action currently only fetches the first page of results, so page_size effectively sets the maximum number of items returned.'),
  query: z.string().optional().describe('An optional search query to filter pages and/or databases by their title or content. If not provided (None or empty string), all accessible items matching the selected type (pages, databases, or both) are returned.'),
});

type NotionAddPageContentParams = z.infer<typeof NotionAddPageContentSchema>;
type NotionFetchDataParams = z.infer<typeof NotionFetchDataSchema>;

export function registerNotionAddPageContentTool(server: McpServer): void {
  registerTool<NotionAddPageContentParams>(
    server,
    'notion_add_page_content',
    'Appends a single content block to a notion page or a parent block (must be page, toggle, to-do, bulleted/numbered list, callout, or quote); invoke repeatedly to add multiple blocks.',
    NotionAddPageContentSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_ADD_PAGE_CONTENT',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Notion tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Notion addPageContent tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionFetchDataTool(server: McpServer): void {
  registerTool<NotionFetchDataParams>(
    server,
    'notion_fetch_data',
    'Fetches notion items (pages and/or databases) from the notion workspace, always call this action to get page id or database id in the simplest way',
    NotionFetchDataSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_FETCH_DATA',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Notion tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Notion fetchData tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionTools(server: McpServer): void {
  registerNotionAddPageContentTool(server);
  registerNotionFetchDataTool(server);
}
