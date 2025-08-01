import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool, createTextContent } from './common.js';
import { ComposioService } from '../services/composioService.js';

// Simplified input schema for user convenience
const NotionRichTextInputSchema = z.object({
  block_property: z.string().default('paragraph').describe('The block property of the block to be added. Possible properties are `paragraph`, `heading_1`, `heading_2`, `heading_3`, `callout`, `to_do`, `toggle`, `quote`, `bulleted_list_item`, `numbered_list_item`. Other properties possible are `file`, `image`, `video` (link required).'),
  content: z.string().describe('The textual content of the rich text object. Required for paragraph, heading_1, heading_2, heading_3, callout, to_do, toggle, quote.'),
  link: z.string().optional().describe('The URL of the rich text object or the file to be uploaded or image/video link'),
  bold: z.boolean().default(false).describe('Indicates if the text is bold.'),
  italic: z.boolean().default(false).describe('Indicates if the text is italic.'),
  underline: z.boolean().default(false).describe('Indicates if the text is underlined.'),
  strikethrough: z.boolean().default(false).describe('Indicates if the text has strikethrough.'),
  code: z.boolean().default(false).describe('Indicates if the text is formatted as code.'),
  color: z.string().default('default').describe('The color of the text background or text itself.'),
});

const NotionAddPageContentSchema = z.object({
  parent_block_id: z.string().describe('Identifier of the parent page or block to which the new content block will be added. This parent must be capable of having child blocks. Obtain valid IDs using other Notion actions or API calls.'),
  content_block: NotionRichTextInputSchema.describe('Include these fields in the json: {\'content\': \'Some words\', \'link\': \'https://random-link.com\'. For content styling, refer to https://developers.notion.com/reference/rich-text.'),
  after: z.string().optional().describe('Identifier of an existing block. The new content block will be appended immediately after this block. If omitted or null, the new block is appended to the end of the parent\'s children list.'),
});

const NotionFetchDataSchema = z.object({
  get_all: z.boolean().default(false).describe('If true, fetches both pages and databases accessible to the Notion integration. Only one of get_pages, get_databases, or get_all can be true.'),
  get_databases: z.boolean().default(false).describe('If true, fetches all databases accessible to the Notion integration. Only one of get_pages, get_databases, or get_all can be true.'),
  get_pages: z.boolean().default(false).describe('If true, fetches all pages accessible to the Notion integration. Only one of get_pages, get_databases, or get_all can be true.'),
  page_size: z.number().int().min(1).max(100).default(100).describe('The maximum number of items to retrieve. Must be between 1 and 100, inclusive. Defaults to 100. Note: this action currently only fetches the first page of results, so `page_size` effectively sets the maximum number of items returned.'),
  query: z.string().optional().describe('An optional search query to filter pages and/or databases by their title or content. If not provided (None or empty string), all accessible items matching the selected type (pages, databases, or both) are returned.'),
});

// Proper Notion API rich text schema
const NotionRichTextSchema = z.object({
  type: z.literal('text').describe('The type of rich text object, always "text"'),
  text: z.object({
    content: z.string().describe('The textual content of the rich text object'),
    link: z.object({
      url: z.string().url().describe('The URL for the link')
    }).optional().describe('Link object if this text should be a hyperlink')
  }).describe('The text content and optional link'),
  annotations: z.object({
    bold: z.boolean().default(false).describe('Whether the text is bold'),
    italic: z.boolean().default(false).describe('Whether the text is italic'),
    strikethrough: z.boolean().default(false).describe('Whether the text has strikethrough'),
    underline: z.boolean().default(false).describe('Whether the text is underlined'),
    code: z.boolean().default(false).describe('Whether the text is formatted as code'),
    color: z.string().default('default').describe('The color of the text')
  }).optional().describe('Text formatting annotations'),
  plain_text: z.string().optional().describe('The plain text content without formatting'),
  href: z.string().optional().describe('The URL if this text is a link')
});

// Property schema for database operations
const PropertySchemaSchema = z.object({
  name: z.string().describe('Name of the property'),
  type: z.enum(['title', 'rich_text', 'number', 'select', 'multi_select', 'date', 'people', 'files', 'checkbox', 'url', 'email', 'phone_number', 'formula', 'relation', 'rollup', 'status', 'created_time', 'created_by', 'last_edited_time', 'last_edited_by']).describe('The type of the property, which determines the kind of data it will store. Valid types are defined by the PropertyType enum.'),
});

// Property values schema for database row operations
const PropertyValuesSchema = z.object({
  name: z.string().describe('Name of the property'),
  type: z.enum(['title', 'rich_text', 'number', 'select', 'multi_select', 'date', 'people', 'files', 'checkbox', 'url', 'email', 'phone_number', 'formula', 'relation', 'rollup', 'status', 'created_time', 'created_by', 'last_edited_time', 'last_edited_by']).describe('Type of the property. Type of the propertytitle, rich_text, number, select, multi_select, date, people, files, checkbox url, email, phone_number, formula, created_by, created_time, last_edited_by, last_edited_time'),
  value: z.string().describe('Value of the property, it will be dependent on the type of the property\nFor types --> value should be\n- title, rich_text - text ex. "Hello World" (IMPORTANT: max 2000 characters, longer text will be truncated)\n- number - number ex. 23.4\n- select - select ex. "India"\n- multi_select - multi_select comma separated values ex. "India,USA"\n- date - format ex. "2021-05-11T11:00:00.000-04:00",\n- people - comma separated ids of people ex. "123,456" (will be converted to array of user objects)\n- relation - comma separated ids of related pages ex. "123,456" (will be converted to array of relation objects)\n- url - a url.\n- files - comma separated urls\n- checkbox - "True" or "False"\n'),
});

// Sort schema for database queries
const SortSchema = z.object({
  property_name: z.string().describe('Database column to sort by.'),
  ascending: z.boolean().describe('True = ASC, False = DESC.'),
});

// Property schema update for database schema updates
const PropertySchemaUpdateSchema = z.object({
  name: z.string().describe('Name of the property'),
  new_type: z.string().optional().describe('Default is None, If None the type remains the same. New Type of the property title, rich_text, number, select, multi_select, date, people, files, checkbox url, email, phone_number, formula, created_by, created_time, last_edited_by, last_edited_time'),
  remove: z.boolean().default(false).describe('Remove the property'),
  rename: z.string().optional().describe('New name of the property, default is None. If None, the name remains the same.'),
});

// Existing schemas
const NotionCreateCommentSchema = z.object({
  comment: NotionRichTextInputSchema.describe('Content of the comment as a NotionRichText object. Simplest form: {\'content\': \'Looks good!\'} (optional styling fields: bold, italic, link, etc.). Do NOT wrap this in a list or use Notion API block JSON.'),
  discussion_id: z.string().optional().describe('The ID of an existing discussion thread to which the comment will be added. This is required if `parent_page_id` is not provided.'),
  parent_page_id: z.string().optional().describe('The ID of the Notion page where the comment will be added. This is required if `discussion_id` is not provided. Page IDs can be obtained using other Notion actions that fetch page details or list pages.'),
});

const NotionCreateDatabaseSchema = z.object({
  parent_id: z.string().describe('Identifier of the existing Notion page that will contain the new database. This ID must be a valid UUID corresponding to a page within the Notion workspace. It can often be obtained using search functionalities or the `NOTION_FETCH_DATA` action.'),
  title: z.string().describe('The desired title for the new database. This text will be automatically converted into Notion\'s rich text format when the database is created.'),
  properties: z.array(PropertySchemaSchema).describe('A list defining the schema (columns) for the new database. Each item in the list is an object representing a property and must specify at least its \'name\' (how it will appear in Notion) and \'type\' (the kind of data it will hold). Refer to the `PropertySchema` model for full structure details. At least one property of type \'title\' is generally required. Common supported property types include: \'title\', \'rich_text\', \'number\', \'select\', \'multi_select\', \'status\', \'date\', \'people\', \'files\', \'checkbox\', \'url\', \'email\', \'phone_number\'. Other types like \'formula\', \'relation\', \'rollup\', \'created_time\', \'created_by\', \'last_edited_time\', \'last_edited_by\' might also be supported.'),
});

const NotionCreateNotionPageSchema = z.object({
  parent_id: z.string().describe('The UUID of the parent page or database under which the new page will be created. This ID must correspond to an existing page or database in the Notion workspace. Use other Notion actions (e.g., for searching or fetching data) to obtain valid parent IDs.'),
  title: z.string().describe('The title of the new page to be created.'),
  cover: z.string().optional().describe('The URL of an image to be used as the cover for the new page. The URL must be publicly accessible.'),
  icon: z.string().optional().describe('An emoji to be used as the icon for the new page. Must be a single emoji character.'),
});

const NotionFetchDatabaseSchema = z.object({
  database_id: z.string().describe('The unique identifier of the Notion database whose metadata (structure, properties) is to be retrieved. To obtain a list of `database_id` values and corresponding database titles, use the \'NOTION_FETCH_DATA\' action (or a similar action designed for listing/discovering databases). Note: Linked databases are not supported; the ID must reference an actual database, not a linked database.'),
});

const NotionFetchRowSchema = z.object({
  page_id: z.string().describe('The UUID of the Notion page (which represents a row in a database) to retrieve. Each row in a Notion database is a page. You can obtain `page_id` values by using an action that lists database pages (e.g., `NOTION_FETCH_DATA`) to get available page IDs and their titles.'),
});

const NotionInsertRowDatabaseSchema = z.object({
  database_id: z.string().describe('Identifier (UUID) of the Notion database where the new page (row) will be inserted. This ID must correspond to an existing database accessible to the integration. Use the `NOTION_FETCH_DATA` action to find available database IDs.'),
  properties: z.array(PropertyValuesSchema).default([]).describe('Property values for the new page. IMPORTANT: This field requires a LIST of objects, not a dictionary. Each object in the list defines a property and must include: `name` (the exact name of the property as it appears in Notion), `type` (the property\'s data type), and `value` (the property\'s value, formatted as a string according to its type).\n\nCORRECT FORMAT EXAMPLE (a list of property objects):\n[\n  {"name": "Title", "type": "title", "value": "My new task"},\n  {"name": "Status", "type": "select", "value": "In Progress"},\n  {"name": "Tags", "type": "multi_select", "value": "Work,Personal"},\n  {"name": "Due Date", "type": "date", "value": "2024-06-01T12:00:00.000-04:00"},\n  {"name": "Completed", "type": "checkbox", "value": "False"}\n]\n\nINCORRECT FORMAT (e.g., a dictionary instead of a list):\n{\n  "Title": "My new task",\n  "Status": "In Progress"\n}\n\nValue formatting rules by property type:\n- `title` or `rich_text`: Plain text string (maximum 2000 characters).\n- `number`: String representation of a number (e.g., "23.4").\n- `select`: The name of an existing option for the select property (e.g., "In Progress").\n- `multi_select`: Comma-separated string of existing option names (e.g., "Work,Personal").\n- `date`: ISO 8601 formatted date string (e.g., "2024-06-01T12:00:00.000-04:00").\n- `people`: Comma-separated string of Notion user IDs.\n- `checkbox`: String "True" or "False".\n- `url`: A valid URL string.\n- `files`: Comma-separated string of URLs.\nProperties defined in the database schema but omitted from this list will be initialized with default or empty values. Ensure that property names and types correctly match the target database schema.'),
  child_blocks: z.array(NotionRichTextSchema).default([]).describe('A list of `NotionRichText` objects defining content blocks (e.g., paragraphs, headings) to append to the new page\'s body. If omitted, the page body will be empty.'),
  cover: z.string().optional().describe('URL of an external image to set as the page cover. The URL must point to a publicly accessible image.'),
  icon: z.string().optional().describe('Emoji to be used as the page icon. Must be a single emoji character.'),
});

const NotionQueryDatabaseSchema = z.object({
  database_id: z.string().describe('Identifier of the Notion database to query. To discover available database IDs and their corresponding titles, you can use an action like `NOTION_FETCH_DATA` or inspect the database in Notion.'),
  page_size: z.number().int().default(2).describe('The maximum number of items (pages or rows) to return in a single response. Defaults to 2. The actual number of items returned may be less than this value.'),
  sorts: z.array(SortSchema).optional().describe('List of sort rules. Each item must use the keys \'property_name\' and \'ascending\'.\nExample: [{\'property_name\': \'Due\', \'ascending\': False}]'),
  start_cursor: z.string().optional().describe('An opaque cursor for pagination, used to retrieve the next set of results. This value is obtained from the `next_cursor` field in a previous response. If omitted, retrieves results from the beginning.'),
});

const NotionRetrieveDatabasePropertySchema = z.object({
  database_id: z.string().describe('Identifier for the database.'),
  property_id: z.string().describe('Identifier for the property. This can be the property ID or the property name.'),
});

const NotionUpdatePageSchema = z.object({
  page_id: z.string().describe('Identifier for the Notion page to be updated.'),
  archived: z.boolean().optional().describe('Set to true to archive the page (i.e., send to trash). Set to false to restore a page from trash. Defaults to false.'),
  cover: z.object({
    type: z.literal('external').optional(),
    external: z.object({
      url: z.string().url()
    }).optional()
  }).optional().describe('An external file object for the page cover. Only external file objects are supported for covers.'),
  icon: z.object({
    type: z.enum(['emoji', 'external', 'file']).optional(),
    emoji: z.string().optional(),
    external: z.object({
      url: z.string().url()
    }).optional(),
    file: z.object({
      url: z.string().url(),
      expiry_time: z.string().optional()
    }).optional()
  }).optional().describe('A page icon object. Can be an emoji object with type "emoji" and emoji field, an external file object with type "external", or a file object with type "file".'),
  properties: z.record(z.string(), z.any()).optional().describe('An object containing the property values to update for the page. The keys are the names or IDs of the property and the values are property value objects. If a page property ID is not included, then it is not changed.'),
});

const NotionUpdateRowDatabaseSchema = z.object({
  row_id: z.string().describe('Identifier (UUID) of the database row (page) to be updated. This ID must be a valid UUID string (e.g., \'59833787-2cf9-4fdf-8782-e53db20768a5\') corresponding to an existing Notion page. In Notion, database rows are treated as pages.'),
  properties: z.array(PropertyValuesSchema).default([]).describe('A list of property values to update for the page. Each item in this list defines a specific property (by its name or ID) and the new value it should take. The format of the `value` depends on the property\'s type; refer to the main action documentation for detailed formatting guidelines. Properties not included in this list will retain their current values.'),
  cover: z.string().optional().describe('URL of an external image to be used as the cover for the page (e.g., \'https://google.com/image.png\').'),
  icon: z.string().optional().describe('The emoji to be used as the icon for the page. Must be a single emoji character (e.g., \'😻\', \'🤔\').'),
  delete_row: z.boolean().default(false).describe('If true, the row (page) will be archived, effectively deleting it from the active view. If false, the row will be updated with other provided data.'),
});

const NotionUpdateSchemaDatabaseSchema = z.object({
  database_id: z.string().describe('Identifier of the Notion database to update. Use the `NOTION_FETCH_DATA` action or similar tools to get available database IDs and their titles.'),
  title: z.string().optional().describe('New title for the database. If this field is not provided or is set to `None` (the default value), the database\'s existing title will remain unchanged.'),
  description: z.string().optional().describe('New description for the database. If this field is not provided or is set to `None` (the default value), the database\'s existing description will remain unchanged.'),
  properties: z.array(PropertySchemaUpdateSchema).default([]).describe('List of property updates. Each item must include at least the \'name\' of the column to change plus one of: \'new_type\', \'rename\', or \'remove\'. Example:\n[\n  {\'name\': \'Status\', \'new_type\': \'select\'},\n  {\'name\': \'Priority\', \'remove\': true}\n]'),
});

// Block schema for Notion API blocks - using z.lazy to handle recursion
const NotionBlockSchema: z.ZodType<any> = z.lazy(() => z.object({
  object: z.literal('block').describe('The object type, always "block"'),
  type: z.enum([
    'paragraph',
    'heading_1',
    'heading_2', 
    'heading_3',
    'bulleted_list_item',
    'numbered_list_item',
    'to_do',
    'toggle',
    'code',
    'quote',
    'callout',
    'divider',
    'image',
    'video',
    'file',
    'bookmark',
    'embed',
    'equation',
    'table_of_contents',
    'breadcrumb',
    'column_list',
    'column',
    'link_to_page',
    'synced_block',
    'template',
    'child_page',
    'child_database'
  ]).describe('The type of block being created'),
  paragraph: z.object({
    rich_text: z.array(NotionRichTextSchema).default([]).describe('Rich text content for paragraph blocks'),
    color: z.string().default('default').optional().describe('Text color'),
    children: z.array(NotionBlockSchema).default([]).optional().describe('Child blocks')
  }).optional(),
  heading_1: z.object({
    rich_text: z.array(NotionRichTextSchema).default([]).describe('Rich text content for heading 1 blocks'),
    color: z.string().default('default').optional().describe('Text color'),
    is_toggleable: z.boolean().default(false).optional().describe('Whether the heading is toggleable')
  }).optional(),
  heading_2: z.object({
    rich_text: z.array(NotionRichTextSchema).default([]).describe('Rich text content for heading 2 blocks'),
    color: z.string().default('default').optional().describe('Text color'),
    is_toggleable: z.boolean().default(false).optional().describe('Whether the heading is toggleable')
  }).optional(),
  heading_3: z.object({
    rich_text: z.array(NotionRichTextSchema).default([]).describe('Rich text content for heading 3 blocks'),
    color: z.string().default('default').optional().describe('Text color'),
    is_toggleable: z.boolean().default(false).optional().describe('Whether the heading is toggleable')
  }).optional(),
  bulleted_list_item: z.object({
    rich_text: z.array(NotionRichTextSchema).default([]).describe('Rich text content for bulleted list items'),
    color: z.string().default('default').optional().describe('Text color'),
    children: z.array(NotionBlockSchema).default([]).optional().describe('Child blocks')
  }).optional(),
  numbered_list_item: z.object({
    rich_text: z.array(NotionRichTextSchema).default([]).describe('Rich text content for numbered list items'),
    color: z.string().default('default').optional().describe('Text color'),
    children: z.array(NotionBlockSchema).default([]).optional().describe('Child blocks')
  }).optional(),
  to_do: z.object({
    rich_text: z.array(NotionRichTextSchema).default([]).describe('Rich text content for to-do items'),
    checked: z.boolean().default(false).optional().describe('Whether the to-do item is checked'),
    color: z.string().default('default').optional().describe('Text color'),
    children: z.array(NotionBlockSchema).default([]).optional().describe('Child blocks')
  }).optional(),
  toggle: z.object({
    rich_text: z.array(NotionRichTextSchema).default([]).describe('Rich text content for toggle blocks'),
    color: z.string().default('default').optional().describe('Text color'),
    children: z.array(NotionBlockSchema).default([]).optional().describe('Child blocks')
  }).optional(),
  code: z.object({
    rich_text: z.array(NotionRichTextSchema).default([]).describe('Rich text content for code blocks'),
    language: z.string().default('plain text').optional().describe('Programming language for syntax highlighting'),
    caption: z.array(NotionRichTextSchema).default([]).optional().describe('Caption for the code block')
  }).optional(),
  quote: z.object({
    rich_text: z.array(NotionRichTextSchema).default([]).describe('Rich text content for quote blocks'),
    color: z.string().default('default').optional().describe('Text color'),
    children: z.array(NotionBlockSchema).default([]).optional().describe('Child blocks')
  }).optional(),
  callout: z.object({
    rich_text: z.array(NotionRichTextSchema).default([]).describe('Rich text content for callout blocks'),
    icon: z.object({
      type: z.enum(['emoji', 'external', 'file']).describe('Type of icon'),
      emoji: z.string().optional().describe('Emoji character if type is emoji'),
      external: z.object({ url: z.string() }).optional().describe('External URL if type is external'),
      file: z.object({ url: z.string() }).optional().describe('File URL if type is file')
    }).optional().describe('Icon for the callout'),
    color: z.string().default('default').optional().describe('Background color'),
    children: z.array(NotionBlockSchema).default([]).optional().describe('Child blocks')
  }).optional(),
  divider: z.object({}).optional().describe('Divider blocks have no properties'),
  image: z.object({
    type: z.enum(['external', 'file']).describe('Type of image source'),
    external: z.object({ url: z.string() }).optional().describe('External image URL'),
    file: z.object({ url: z.string() }).optional().describe('File image URL'),
    caption: z.array(NotionRichTextSchema).default([]).optional().describe('Caption for the image')
  }).optional(),
  bookmark: z.object({
    url: z.string().describe('URL to bookmark'),
    caption: z.array(NotionRichTextSchema).default([]).optional().describe('Caption for the bookmark')
  }).optional(),
  embed: z.object({
    url: z.string().describe('URL to embed'),
    caption: z.array(NotionRichTextSchema).default([]).optional().describe('Caption for the embed')
  }).optional(),
  equation: z.object({
    expression: z.string().describe('LaTeX equation expression')
  }).optional(),
  table_of_contents: z.object({
    color: z.string().default('default').optional().describe('Text color')
  }).optional(),
  link_to_page: z.object({
    type: z.enum(['page_id', 'database_id']).describe('Type of link target'),
    page_id: z.string().optional().describe('Page ID if linking to a page'),
    database_id: z.string().optional().describe('Database ID if linking to a database')
  }).optional()
}).describe('A Notion block object conforming to the Notion API block structure'));

const NotionAppendBlockChildrenSchema = z.object({
  block_id: z.string().describe('Identifier of the parent block or page to which new child blocks will be appended. To find available page IDs and their titles, the `NOTION_FETCH_DATA` action can be utilized.'),
  children: z.array(NotionBlockSchema).describe('A list of block objects to be added as children to the parent block. Each block object must conform to Notion\'s block structure. A maximum of 100 blocks can be appended in a single request. For blocks that allow children, up to two levels of nesting are supported in a single request.'),
  after: z.string().optional().describe('An optional ID of an existing child block. If provided, the new blocks will be inserted directly after this specified block. If omitted, new blocks are appended to the end of the parent\'s children list.'),
});

const NotionFetchNotionBlockSchema = z.object({
  block_id: z.string().describe('The unique UUID identifier for the Notion block to be retrieved. This can be the ID of a standard block or a page. To find block or page IDs, you might use actions that list page content or search for blocks/pages.'),
});

const NotionFetchNotionChildBlockSchema = z.object({
  block_id: z.string().describe('Identifier (UUID) of the parent Notion block or page whose children are to be fetched. This ID can be for a block or a page (as pages are blocks). To obtain relevant IDs and their titles, consider using actions like \'NOTION_FETCH_DATA\' or other actions that list pages or database content.'),
  page_size: z.number().int().optional().describe('The maximum number of child blocks to return in a single response. The actual number of results may be lower if there are fewer child blocks available or if the end of the list is reached. Maximum allowed value is 100. If unspecified, Notion\'s default page size will be used.'),
  start_cursor: z.string().optional().describe('An opaque string. If provided, the response will list blocks starting from the position indicated by this cursor. If omitted, the first page of results is returned. Essential for paginating through a large number of child blocks.'),
});

// Schema for additional properties that can be applied to blocks when updating
const NotionBlockAdditionalPropertiesSchema = z.object({
  // Common properties for text-based blocks
  color: z.string().optional().describe('Text or background color (e.g., \'blue\', \'red_background\')'),
  
  // Heading-specific properties
  is_toggleable: z.boolean().optional().describe('Whether heading blocks are toggleable'),
  
  // To-do specific properties
  checked: z.boolean().optional().describe('Whether to-do items are checked'),
  
  // Code block specific properties
  language: z.string().optional().describe('Programming language for code blocks (e.g., \'javascript\', \'python\')'),
  
  // Callout specific properties
  icon: z.object({
    type: z.enum(['emoji', 'external', 'file']).describe('Type of icon'),
    emoji: z.string().optional().describe('Emoji character if type is emoji'),
    external: z.object({ url: z.string() }).optional().describe('External URL if type is external'),
    file: z.object({ url: z.string() }).optional().describe('File URL if type is file')
  }).optional().describe('Icon for callout blocks'),
  
  // Image/media specific properties
  caption: z.array(NotionRichTextSchema).optional().describe('Caption for media blocks'),
  
  // Link/bookmark specific properties
  url: z.string().optional().describe('URL for bookmark or embed blocks'),
  
  // Equation specific properties
  expression: z.string().optional().describe('LaTeX expression for equation blocks'),
  
  // Table of contents specific properties
  // (uses color which is already defined above)
  
  // Link to page specific properties
  page_id: z.string().optional().describe('Page ID for link_to_page blocks'),
  database_id: z.string().optional().describe('Database ID for link_to_page blocks')
}).describe('Additional properties for block updates, specific to the block type being updated');

const NotionNotionUpdateBlockSchema = z.object({
  block_id: z.string().describe('Identifier of the Notion block to be updated. To find a block\'s ID, other Notion actions that list or retrieve blocks can be used. For updating content within a page (which is also a block), its ID can be obtained using actions like `NOTION_FETCH_DATA` to get page IDs and titles.'),
  block_type: z.string().describe('The type of the block to update. Must be one of the supported types: \'paragraph\', \'heading_1\', \'heading_2\', \'heading_3\', \'bulleted_list_item\', \'numbered_list_item\', \'to_do\', \'toggle\'. The content structure and available `additional_properties` depend on this type.'),
  content: z.string().describe('The new text content for the block. This is primarily used for text-based blocks like paragraphs, headings, and list items.'),
  additional_properties: NotionBlockAdditionalPropertiesSchema.optional().describe('A dictionary of additional properties to apply to the block, specific to its type. These are merged into the block type\'s data object (e.g., into the \'paragraph\' or \'to_do\' object). Examples include `is_toggleable` (boolean) for heading blocks, `checked` (boolean) for \'to_do\' blocks, or `color` (string, e.g., \'blue_background\') for blocks supporting it. Only provide properties relevant to the specified block_type.'),
});

const NotionSearchNotionPageSchema = z.object({
  query: z.string().default('').describe('The text to search for in page and database titles. If an empty string is provided, all pages and databases accessible to the integration will be returned.'),
  filter_property: z.string().default('object').describe('The property to filter the search results by. Currently, the only supported value is `object`, which filters by the type specified in `filter_value`. Defaults to `object`.'),
  filter_value: z.string().default('page').optional().describe('Filters the search results by object type. Valid values are `page` or `database`. Defaults to `page`.'),
  page_size: z.number().int().min(1).max(100).default(2).optional().describe('The number of items to include in the response. Must be an integer between 1 and 100, inclusive. Defaults to 2.'),
  start_cursor: z.string().optional().describe('An opaque cursor value returned in a previous response. If provided, the API will return results starting after this cursor, enabling pagination. If `None` or an empty string, results start from the beginning.'),
  timestamp: z.string().optional().describe('The timestamp field to sort the results by. Currently, the only supported value is `last_edited_time`. If provided, `direction` must also be specified.'),
  direction: z.string().optional().describe('Specifies the sort direction for the results. Required if `timestamp` is provided. Valid values are `ascending` or `descending`.'),
});

type NotionAddPageContentParams = z.infer<typeof NotionAddPageContentSchema>;
type NotionFetchDataParams = z.infer<typeof NotionFetchDataSchema>;
type NotionCreateCommentParams = z.infer<typeof NotionCreateCommentSchema>;
type NotionCreateDatabaseParams = z.infer<typeof NotionCreateDatabaseSchema>;
type NotionCreateNotionPageParams = z.infer<typeof NotionCreateNotionPageSchema>;
type NotionFetchDatabaseParams = z.infer<typeof NotionFetchDatabaseSchema>;
type NotionFetchRowParams = z.infer<typeof NotionFetchRowSchema>;
type NotionInsertRowDatabaseParams = z.infer<typeof NotionInsertRowDatabaseSchema>;
type NotionQueryDatabaseParams = z.infer<typeof NotionQueryDatabaseSchema>;
type NotionRetrieveDatabasePropertyParams = z.infer<typeof NotionRetrieveDatabasePropertySchema>;
type NotionUpdatePageParams = z.infer<typeof NotionUpdatePageSchema>;
type NotionUpdateRowDatabaseParams = z.infer<typeof NotionUpdateRowDatabaseSchema>;
type NotionUpdateSchemaDatabaseParams = z.infer<typeof NotionUpdateSchemaDatabaseSchema>;
type NotionAppendBlockChildrenParams = z.infer<typeof NotionAppendBlockChildrenSchema>;
type NotionFetchNotionBlockParams = z.infer<typeof NotionFetchNotionBlockSchema>;
type NotionFetchNotionChildBlockParams = z.infer<typeof NotionFetchNotionChildBlockSchema>;
type NotionNotionUpdateBlockParams = z.infer<typeof NotionNotionUpdateBlockSchema>;
type NotionSearchNotionPageParams = z.infer<typeof NotionSearchNotionPageSchema>;

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

export function registerNotionCreateCommentTool(server: McpServer): void {
  registerTool<NotionCreateCommentParams>(
    server,
    'notion_create_comment',
    'Adds a comment to a notion page (via `parent page id`) or to an existing discussion thread (via `discussion id`); cannot create new discussion threads on specific blocks (inline comments).',
    NotionCreateCommentSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_CREATE_COMMENT',
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
          content: [createTextContent(`Error calling Notion createComment tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionCreateDatabaseTool(server: McpServer): void {
  registerTool<NotionCreateDatabaseParams>(
    server,
    'notion_create_database',
    'Creates a new notion database as a subpage under a specified parent page with a defined properties schema; use this action exclusively for creating new databases.',
    NotionCreateDatabaseSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_CREATE_DATABASE',
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
          content: [createTextContent(`Error calling Notion createDatabase tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionCreateNotionPageTool(server: McpServer): void {
  registerTool<NotionCreateNotionPageParams>(
    server,
    'notion_create_notion_page',
    'Creates a new empty page in a notion workspace.',
    NotionCreateNotionPageSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_CREATE_NOTION_PAGE',
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
          content: [createTextContent(`Error calling Notion createNotionPage tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionFetchDatabaseTool(server: McpServer): void {
  registerTool<NotionFetchDatabaseParams>(
    server,
    'notion_fetch_database',
    'Fetches a notion database\'s structural metadata (properties, title, etc.) via its `database id`, not the data entries; `database id` must reference an existing database.',
    NotionFetchDatabaseSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_FETCH_DATABASE',
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
          content: [createTextContent(`Error calling Notion fetchDatabase tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionFetchRowTool(server: McpServer): void {
  registerTool<NotionFetchRowParams>(
    server,
    'notion_fetch_row',
    'Retrieves a notion database row\'s properties and metadata; use a different action for page content blocks.',
    NotionFetchRowSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_FETCH_ROW',
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
          content: [createTextContent(`Error calling Notion fetchRow tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionInsertRowDatabaseTool(server: McpServer): void {
  registerTool<NotionInsertRowDatabaseParams>(
    server,
    'notion_insert_row_database',
    'Creates a new page (row) in a specified notion database.',
    NotionInsertRowDatabaseSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_INSERT_ROW_DATABASE',
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
          content: [createTextContent(`Error calling Notion insertRowDatabase tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionQueryDatabaseTool(server: McpServer): void {
  registerTool<NotionQueryDatabaseParams>(
    server,
    'notion_query_database',
    'Queries a notion database for pages (rows), where rows are pages and columns are properties; ensure sort property names correspond to existing database properties.',
    NotionQueryDatabaseSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_QUERY_DATABASE',
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
          content: [createTextContent(`Error calling Notion queryDatabase tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionRetrieveDatabasePropertyTool(server: McpServer): void {
  registerTool<NotionRetrieveDatabasePropertyParams>(
    server,
    'notion_retrieve_database_property',
    'Tool to retrieve a specific property object of a notion database. use when you need to get details about a single database column/property.',
    NotionRetrieveDatabasePropertySchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_RETRIEVE_DATABASE_PROPERTY',
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
          content: [createTextContent(`Error calling Notion retrieveDatabaseProperty tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionUpdatePageTool(server: McpServer): void {
  registerTool<NotionUpdatePageParams>(
    server,
    'notion_update_page',
    'Tool to update the properties, icon, cover, or archive status of a page. use when you need to modify existing page attributes.',
    NotionUpdatePageSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_UPDATE_PAGE',
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
          content: [createTextContent(`Error calling Notion updatePage tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionUpdateRowDatabaseTool(server: McpServer): void {
  registerTool<NotionUpdateRowDatabaseParams>(
    server,
    'notion_update_row_database',
    'Updates or archives an existing notion database row (page) using its `row id`, allowing modification of its icon, cover, and/or properties; ensure the target page is accessible and property details (names/ids and values) align with the database schema and specified formats.',
    NotionUpdateRowDatabaseSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_UPDATE_ROW_DATABASE',
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
          content: [createTextContent(`Error calling Notion updateRowDatabase tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionUpdateSchemaDatabaseTool(server: McpServer): void {
  registerTool<NotionUpdateSchemaDatabaseParams>(
    server,
    'notion_update_schema_database',
    'Updates an existing notion database\'s title, description, and/or properties; at least one of these attributes must be provided to effect a change.',
    NotionUpdateSchemaDatabaseSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_UPDATE_SCHEMA_DATABASE',
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
          content: [createTextContent(`Error calling Notion updateSchemaDatabase tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionAppendBlockChildrenTool(server: McpServer): void {
  registerTool<NotionAppendBlockChildrenParams>(
    server,
    'notion_append_block_children',
    'Appends new child blocks to a specified parent block or page in Notion, ideal for adding content within an existing structure (e.g., list items, toggle content) rather than creating new pages; the parent must be able to accept children. Creates and appends new children blocks to the parent block_id specified. Blocks can be parented by other blocks, pages, or databases. Up to 100 block children can be appended in a single request.',
    NotionAppendBlockChildrenSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_APPEND_BLOCK_CHILDREN',
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
          content: [createTextContent(`Error calling Notion appendBlockChildren tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionFetchNotionBlockTool(server: McpServer): void {
  registerTool<NotionFetchNotionBlockParams>(
    server,
    'notion_fetch_notion_block',
    'Retrieves a notion block (or page, as pages are blocks) using its valid uuid; if the block has children, use a separate action to fetch them.',
    NotionFetchNotionBlockSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_FETCH_NOTION_BLOCK',
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
          content: [createTextContent(`Error calling Notion fetchNotionBlock tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionFetchNotionChildBlockTool(server: McpServer): void {
  registerTool<NotionFetchNotionChildBlockParams>(
    server,
    'notion_fetch_notion_child_block',
    'Retrieves a paginated list of direct, first-level child block objects for a given parent notion block or page id; use block ids from the response for subsequent calls to access deeply nested content.',
    NotionFetchNotionChildBlockSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_FETCH_NOTION_CHILD_BLOCK',
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
          content: [createTextContent(`Error calling Notion fetchNotionChildBlock tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionNotionUpdateBlockTool(server: McpServer): void {
  registerTool<NotionNotionUpdateBlockParams>(
    server,
    'notion_notion_update_block',
    'Updates an existing notion block\'s textual content or type-specific properties (e.g., \'checked\' status, \'color\'), using its `block id` and the specified `block type`.',
    NotionNotionUpdateBlockSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_NOTION_UPDATE_BLOCK',
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
          content: [createTextContent(`Error calling Notion notionUpdateBlock tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionSearchNotionPageTool(server: McpServer): void {
  registerTool<NotionSearchNotionPageParams>(
    server,
    'notion_search_notion_page',
    'Searches notion pages and databases by title; an empty query lists all accessible items, useful for discovering ids or as a fallback when a specific query yields no results.',
    NotionSearchNotionPageSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'NOTION_SEARCH_NOTION_PAGE',
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
          content: [createTextContent(`Error calling Notion searchNotionPage tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerNotionTools(server: McpServer): void {
  // registerNotionAddPageContentTool(server);
  registerNotionFetchDataTool(server);
  registerNotionCreateCommentTool(server);
  registerNotionCreateDatabaseTool(server);
  registerNotionCreateNotionPageTool(server);
  registerNotionFetchDatabaseTool(server);
  registerNotionFetchRowTool(server);
  registerNotionInsertRowDatabaseTool(server);
  registerNotionQueryDatabaseTool(server);
  registerNotionRetrieveDatabasePropertyTool(server);
  registerNotionUpdatePageTool(server);
  registerNotionUpdateRowDatabaseTool(server);
  registerNotionUpdateSchemaDatabaseTool(server);
  registerNotionAppendBlockChildrenTool(server);
  registerNotionFetchNotionBlockTool(server);
  registerNotionFetchNotionChildBlockTool(server);
  registerNotionNotionUpdateBlockTool(server);
  registerNotionSearchNotionPageTool(server);
}
