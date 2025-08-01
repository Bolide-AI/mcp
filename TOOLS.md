# Bolide AI MCP Tools Reference

This document provides a comprehensive list of all tools available in Bolide AI MCP, organized by functionality.

## Tool Categories

### Project Scaffolding Tools

Tools for creating new projects from templates.

| Tool Name | Description |
|-----------|-------------|
| `scaffold_bolide_ai_project` | Create a bolide.ai project directory with organized directory structure for marketing projects. |

### Utility Tools

Specialized utility tools for development workflows.

| Tool Name | Description |
|-----------|-------------|
| `check_companion_app_status` | Checks whether the companion app is currently running or not. Use this tool before launching or stopping the companion app to determine the current state. |
| `launch_companion_app` | Launches the companion app for capturing screenshots and videos. IMPORTANT: Use check_companion_app_status first to verify no instance is running. |
| `stop_companion_app` | Stops any running instances of the companion app. IMPORTANT: Use check_companion_app_status first to verify if the app is running before attempting to stop it. |
| `install_brew_and_ffmpeg` | Installs Homebrew package manager and then installs FFmpeg via Homebrew. This tool handles the complete setup process for video processing dependencies. |

### Content Generation Tools

Tools for generating social media content using AI.

| Tool Name | Description |
|-----------|-------------|
| `analyze_screencasts` | Analyzes screencasts using Gemini API via the web API integration. IMPORTANT: You MUST provide the screencastNames and force parameters. Optionally provide customPrompt for specialized analysis. When customPrompt is used, Gemini returns a short file suffix that gets appended to the JSON filename. Example: analyze_screencasts({ screencastNames: ['bug_demo.mp4'], force: false, customPrompt: 'Focus on UI errors and bugs' }) creates `bug_demo_ui-errors.json` |
| `generate_gif` | Generates a GIF from a screencast. IMPORTANT: You MUST provide the screencastName, startTime, and endTime parameters. Example: generate_gif({ screencastName: 'NAME_OF_SCREENCAST_FILE', startTime: '00:00:00', endTime: '00:00:00' }) |
| `enhance_audio` | Extracts audio from screencasts using ffmpeg and saves as MP3 files in the same directory. Automatically enhances audio using the web API which integrates with ElevenLabs speech-to-speech conversion with voice ID 29vD33N1CtxCmqQRPOHJ. Requires BOLIDE_AI_API_TOKEN and optionally BOLIDE_AI_API_URL environment variables. IMPORTANT: You MUST provide the screencastNames parameter. Example: enhance_audio({ screencastNames: ['screencast1.mp4', 'screencast2.mp4'] }) |

### Research Tools

Tools for performing research and information gathering.

| Tool Name | Description |
|-----------|-------------|
| `use_perplexity` | Perform search and information gathering using Perplexity AI via web API. IMPORTANT: You MUST provide the query and search_mode parameters as well as display the citations in the response, if provided. Example: use_perplexity({ query: "What is the capital of France?", search_mode: "web" }) |
| `use_openai_deep_research` | Perform deep research using OpenAI o4-mini-deep-research model via web API. First enriches the query with detailed research instructions using GPT-4.1, then conducts comprehensive research. Requires BOLIDE_AI_API_TOKEN for authentication. IMPORTANT: You MUST provide the query parameter. Example: use_openai_deep_research({ query: "Economic impact of renewable energy adoption" }) |

### Notion Integration Tools

Tools for integrating with Notion workspaces.

| Tool Name | Description |
|-----------|-------------|
| `notion_add_page_content` | Appends a single content block to a notion page or a parent block (must be page, toggle, to-do, bulleted/numbered list, callout, or quote); invoke repeatedly to add multiple blocks. |
| `notion_fetch_data` | Fetches notion items (pages and/or databases) from the notion workspace, always call this action to get page id or database id in the simplest way |
| `notion_create_comment` | Adds a comment to a notion page (via `parent page id`) or to an existing discussion thread (via `discussion id`); cannot create new discussion threads on specific blocks (inline comments). |
| `notion_create_database` | Creates a new notion database as a subpage under a specified parent page with a defined properties schema; use this action exclusively for creating new databases. |
| `notion_create_notion_page` | Creates a new empty page in a notion workspace. |
| `notion_fetch_database` | Fetches a notion database's structural metadata (properties, title, etc.) via its `database id`, not the data entries; `database id` must reference an existing database. |
| `notion_fetch_row` | Retrieves a notion database row's properties and metadata; use a different action for page content blocks. |
| `notion_insert_row_database` | Creates a new page (row) in a specified notion database. |
| `notion_query_database` | Queries a notion database for pages (rows), where rows are pages and columns are properties; ensure sort property names correspond to existing database properties. |
| `notion_retrieve_database_property` | Tool to retrieve a specific property object of a notion database. use when you need to get details about a single database column/property. |
| `notion_update_page` | Tool to update the properties, icon, cover, or archive status of a page. use when you need to modify existing page attributes. |
| `notion_update_row_database` | Updates or archives an existing notion database row (page) using its `row id`, allowing modification of its icon, cover, and/or properties; ensure the target page is accessible and property details (names/ids and values) align with the database schema and specified formats. |
| `notion_update_schema_database` | Updates an existing notion database's title, description, and/or properties; at least one of these attributes must be provided to effect a change. |
| `notion_append_block_children` | Appends new child blocks to a specified parent block or page in notion, ideal for adding content within an existing structure (e.g., list items, toggle content) rather than creating new pages; the parent must be able to accept children. |
| `notion_fetch_notion_block` | Retrieves a notion block (or page, as pages are blocks) using its valid uuid; if the block has children, use a separate action to fetch them. |
| `notion_fetch_notion_child_block` | Retrieves a paginated list of direct, first-level child block objects for a given parent notion block or page id; use block ids from the response for subsequent calls to access deeply nested content. |
| `notion_notion_update_block` | Updates an existing notion block's textual content or type-specific properties (e.g., 'checked' status, 'color'), using its `block id` and the specified `block type`. |
| `notion_search_notion_page` | Searches notion pages and databases by title; an empty query lists all accessible items, useful for discovering ids or as a fallback when a specific query yields no results. |

### Slack Integration Tools

Tools for integrating with Slack workspaces.

| Tool Name | Description |
|-----------|-------------|
| `slack_fetch_conversation_history` | Fetches a chronological list of messages and events from a specified slack conversation, accessible by the authenticated user/bot, with options for pagination and time range filtering. |
| `slack_list_all_slack_team_channels` | Retrieves public channels, private channels, multi-person direct messages (mpims), and direct messages (ims) from a slack workspace, with options to filter by type and exclude archived channels. |
| `slack_search_for_messages_with_query` | Searches messages in a slack workspace using a query with optional modifiers (e.g., `in:`, `from:`, `has:`, `before:`) across accessible channels, dms, and private groups. |
| `slack_sends_a_message_to_a_slack_channel` | Posts a message to a slack channel, direct message, or private group; requires content via `text`, `blocks`, or `attachments`. |
| `slack_updates_a_slack_message` | Updates a slack message, identified by `channel` id and `ts` timestamp, by modifying its `text`, `attachments`, or `blocks`; provide at least one content field, noting `attachments`/`blocks` are replaced if included (`[]` clears them). |

### Linear Integration Tools

Tools for integrating with Linear workspaces for project management and issue tracking.

| Tool Name | Description |
|-----------|-------------|
| `linear_create_issue` | Creates a new issue in a specified Linear project and team, requiring a title and description, and allowing for optional properties like assignee, state, priority, cycle, and due date. |
| `linear_update_issue` | Updates an existing Linear issue using its issue ID; requires at least one other attribute for modification, and all provided entity IDs (for state, assignee, labels, etc.) must be valid. |
| `linear_create_comment` | Creates a new comment on a specified Linear issue with plain text or Markdown content. |
| `linear_list_issues` | Lists non-archived Linear issues; if project ID is not specified, issues from all accessible projects are returned. Can also filter by assignee ID to get issues assigned to a specific user. |
| `linear_list_cycles` | Retrieves all cycles (time-boxed iterations for work) from the Linear account; no filters are applied. |
| `linear_get_cycles_by_team_id` | Retrieves all cycles for a specified Linear team ID; cycles are time-boxed work periods (like sprints) and the team ID must correspond to an existing team. |
| `linear_list_states` | Retrieves all workflow states for a specified team in Linear, representing the stages an issue progresses through in that team's workflow. |
| `linear_list_teams` | Retrieves all teams, including their members, and filters each team's associated projects by the provided project ID. |
| `linear_list_projects` | Retrieves all projects from the Linear account. |
| `linear_list_users` | Lists all users in the Linear workspace with their IDs, names, emails, and active status. |

### Diagnostic Tools

Tools for system diagnostics and environment validation.

| Tool Name | Description |
|-----------|-------------|
| `diagnostic` | Provides comprehensive information about the MCP server environment, available dependencies, and configuration status. Only available when BOLIDE_AI_MCP_DEBUG environment variable is set. |

## Tool Usage Patterns

### Common Workflows

1. **Project Scaffolding**:
   ```
   scaffold_bolide_ai_project()
   ```

2. **Marketing Content Creation**:
   ```
   check_companion_app_status()
   launch_companion_app()
   generate_gif({ screencastName: "screencast.mov", startTime: "00:00:10", endTime: "00:00:20" })
   ```

3. **Research Workflow**:
   ```
   use_perplexity({ query: "research question", search_mode: "web" })
   use_openai_deep_research({ query: "complex research topic" })
   ```

4. **Slack Communication**:
   ```
   slack_list_all_slack_team_channels({ types: "public_channel,private_channel" })
   slack_sends_a_message_to_a_slack_channel({ channel: "#general", text: "Hello team!" })
   slack_search_for_messages_with_query({ query: "in:#development from:@john" })
   ```

5. **Linear Project Management**:
   ```
   linear_list_projects()
   linear_list_teams({ project_id: "project-id" })
   linear_create_issue({ project_id: "project-id", team_id: "team-id", title: "Bug fix", description: "Description" })
   linear_list_issues({ project_id: "project-id", first: 20 })
   ```

6. **Notion Content Management**:
   ```
   notion_fetch_data({ get_all: true })
   notion_create_notion_page({ parent_id: "page-id", title: "New Documentation" })
   notion_add_page_content({ parent_block_id: "page-id", content_block: { content: "Hello world" } })
   notion_create_database({ parent_id: "page-id", title: "Tasks", properties: [{ name: "Task", type: "title" }] })
   notion_insert_row_database({ database_id: "db-id", properties: [{ name: "Task", type: "title", value: "New task" }] })
   ```

### Parameter Requirements

Many tools require specific parameters:
- **Project scaffolding**: No parameters required
- **Content generation tools**: `screencastNames` required for analysis tools; specific parameters for each tool
- **Launch tools**: No parameters required
- **Research tools**: `query` required; `search_mode` for Perplexity
- **Slack tools**: `channel` required for messaging/history; `query` required for search; various optional parameters for filtering and formatting
- **Linear tools**: `project_id` and `team_id` required for issue creation; `issue_id` required for updates/comments; various optional parameters for filtering and pagination
- **Notion tools**: `parent_block_id` or `page_id` required for most operations; `database_id` required for database operations; `block_id` required for block operations; various optional parameters for content formatting and filtering

### Environment Variables

Tools can be selectively enabled using environment variables:
- Individual tools: `BOLIDE_AI_MCP_TOOL_<TOOL_NAME>=true`
- Tool groups: `BOLIDE_AI_MCP_GROUP_<GROUP_NAME>=true`
- Debug mode: `BOLIDE_AI_MCP_DEBUG=true`
- API access: `BOLIDE_AI_API_TOKEN=your-api-token` (required for research and content generation tools)

Available tool groups:
- `BOLIDE_AI_MCP_GROUP_LAUNCH=true` - Launch and utility tools
- `BOLIDE_AI_MCP_GROUP_SCAFFOLDING=true` - Project scaffolding and creation tools
- `BOLIDE_AI_MCP_GROUP_CONTENT_GENERATORS=true` - Content generation tools
- `BOLIDE_AI_MCP_GROUP_RESEARCH=true` - Research and information gathering tools
- `BOLIDE_AI_MCP_GROUP_SLACK=true` - Slack integration tools
- `BOLIDE_AI_MCP_GROUP_LINEAR=true` - Linear project management tools
- `BOLIDE_AI_MCP_GROUP_NOTION=true` - Notion integration tools
- `BOLIDE_AI_MCP_GROUP_DIAGNOSTICS=true` - Logging and diagnostics tools

## Notes

- All tools use Zod schema validation for parameters
- Error handling is standardized across all tools
- Tools requiring write operations are marked with `isWriteTool: true`
- Debug tool requires `BOLIDE_AI_MCP_DEBUG=true` environment variable
- Content generation and research tools require `BOLIDE_AI_API_TOKEN` environment variable
- GIF generation tool requires `ffmpeg` to be installed on the system
- Content generation tools work with screencast files directly
- Slack tools require proper Composio authentication and Slack workspace access
- Linear tools require proper Composio authentication and Linear workspace access
- Notion tools require proper Composio authentication and Notion workspace access

## Total Tool Count

This MCP server currently provides **54 tools** across 8 categories for project scaffolding, content generation, research, marketing capture, Slack integration, Linear project management, Notion integration, and system diagnostics.