# BolideAI MCP Tools Reference

This document provides a comprehensive list of all tools available in BolideAI MCP, organized by functionality.

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
| `enhance_audio` | Extracts audio from screencasts using ffmpeg and saves as MP3 files in the same directory. Automatically enhances audio using the web API which integrates with ElevenLabs speech-to-speech conversion with voice ID 29vD33N1CtxCmqQRPOHJ. Requires BOLIDEAI_API_TOKEN and optionally BOLIDEAI_API_URL environment variables. IMPORTANT: You MUST provide the screencastNames parameter. Example: enhance_audio({ screencastNames: ['screencast1.mp4', 'screencast2.mp4'] }) |

### Research Tools

Tools for performing research and information gathering.

| Tool Name | Description |
|-----------|-------------|
| `use_perplexity` | Perform search and information gathering using Perplexity AI via web API. IMPORTANT: You MUST provide the query and search_mode parameters as well as display the citations in the response, if provided. Example: use_perplexity({ query: "What is the capital of France?", search_mode: "web" }) |
| `use_openai_deep_research` | Perform deep research using OpenAI o4-mini-deep-research model via web API. First enriches the query with detailed research instructions using GPT-4.1, then conducts comprehensive research. Requires BOLIDEAI_API_TOKEN for authentication. IMPORTANT: You MUST provide the query parameter. Example: use_openai_deep_research({ query: "Economic impact of renewable energy adoption" }) |

### Notion Integration Tools

Tools for integrating with Notion workspaces.

| Tool Name | Description |
|-----------|-------------|
| `notionAddPageContent` | Appends a single content block to a notion page or a parent block (must be page, toggle, to-do, bulleted/numbered list, callout, or quote); invoke repeatedly to add multiple blocks. |
| `notionFetchData` | Fetches notion items (pages and/or databases) from the notion workspace, always call this action to get page id or database id in the simplest way |

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
| `diagnostic` | Provides comprehensive information about the MCP server environment, available dependencies, and configuration status. Only available when BOLIDEAI_MCP_DEBUG environment variable is set. |

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

### Parameter Requirements

Many tools require specific parameters:
- **Project scaffolding**: No parameters required
- **Content generation tools**: `screencastNames` required for analysis tools; specific parameters for each tool
- **Launch tools**: No parameters required
- **Research tools**: `query` required; `search_mode` for Perplexity
- **Slack tools**: `channel` required for messaging/history; `query` required for search; various optional parameters for filtering and formatting
- **Linear tools**: `project_id` and `team_id` required for issue creation; `issue_id` required for updates/comments; various optional parameters for filtering and pagination

### Environment Variables

Tools can be selectively enabled using environment variables:
- Individual tools: `BOLIDEAI_MCP_TOOL_<TOOL_NAME>=true`
- Tool groups: `BOLIDEAI_MCP_GROUP_<GROUP_NAME>=true`
- Debug mode: `BOLIDEAI_MCP_DEBUG=true`
- API access: `BOLIDEAI_API_TOKEN=your-api-token` (required for research and content generation tools)

Available tool groups:
- `BOLIDEAI_MCP_GROUP_LAUNCH=true` - Launch and utility tools
- `BOLIDEAI_MCP_GROUP_SCAFFOLDING=true` - Project scaffolding and creation tools
- `BOLIDEAI_MCP_GROUP_CONTENT_GENERATORS=true` - Content generation tools
- `BOLIDEAI_MCP_GROUP_RESEARCH=true` - Research and information gathering tools
- `BOLIDEAI_MCP_GROUP_SLACK=true` - Slack integration tools
- `BOLIDEAI_MCP_GROUP_LINEAR=true` - Linear project management tools
- `BOLIDEAI_MCP_GROUP_DIAGNOSTICS=true` - Logging and diagnostics tools

## Notes

- All tools use Zod schema validation for parameters
- Error handling is standardized across all tools
- Tools requiring write operations are marked with `isWriteTool: true`
- Debug tool requires `BOLIDEAI_MCP_DEBUG=true` environment variable
- Content generation and research tools require `BOLIDEAI_API_TOKEN` environment variable
- GIF generation tool requires `ffmpeg` to be installed on the system
- Content generation tools work with screencast files directly
- Slack tools require proper Composio authentication and Slack workspace access
- Linear tools require proper Composio authentication and Linear workspace access

## Total Tool Count

This MCP server currently provides **38 tools** across 8 categories for project scaffolding, content generation, research, marketing capture, Slack integration, Linear project management, Notion integration, and system diagnostics.