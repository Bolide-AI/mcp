# Bolide AI MCP

[![npm version](https://badge.fury.io/js/@bolide-ai/mcp.svg)](https://badge.fury.io/js/@bolide-ai/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Bolide AI MCP is a comprehensive ModelContextProtocol (MCP) server that provides tools for marketing automation, content generation, research, and project management. It integrates with various AI services to streamline workflows for developers and marketers.

## Features

- 🚀 **Project Scaffolding** - Create marketing project directories and structures
- 📱 **Marketing Automation** - Capture screenshots and videos using companion app
- 🤖 **AI-Powered Content Generation** - Generate social media posts using Gemini AI
- 🔍 **Research Tools** - Comprehensive research using Perplexity AI and OpenAI
- 📋 **Linear Integration** - Comprehensive Linear project management and issue tracking
- 💬 **Slack Integration** - Complete Slack workspace communication and management
- 📝 **Notion Integration** - Content management and knowledge base operations
- 🛠️ **Diagnostic Tools** - System validation and troubleshooting

## Getting Started

### Quick Start (NPM Package)

For quick testing without local builds:

#### Installation

```bash
npm install -g @bolide-ai/mcp
```

Or use with npx (recommended):

```bash
npx --package=@bolide-ai/mcp bolide-ai-mcp
```

#### Configuration

Configure your MCP client with the following:

```json
{
  "mcpServers": {
    "BolideAI": {
      "command": "npx --package=@bolide-ai/mcp bolide-ai-mcp",
      "env": {
        "BOLIDE_AI_API_KEY": "your-api-key",
      }
    }
  }
}
```

### Development Setup (Local Build)

For development or local builds, follow these detailed steps:

#### 1. Install Prerequisites

**Install Node.js 22+**
```bash
# Download and install from https://nodejs.org/en/download
```

**Clone the repositories**
```bash
git clone https://github.com/Bolide-AI/mcp
```
#### 2. Build the MCP Server

```bash
# In the directory of the cloned repository
npm install && npm run build
```

#### 4. Configure MCP in Cursor

1. In Cursor menu select **Cursor → Settings → Cursor Settings**
2. In the opened window select **Tools & Integrations**
3. Click **New MCP Server**
4. Insert the MCP server configuration, replacing:
   - `<PATH TO MCP DIRECTORY>` with the path to the MCP directory
   - `<BOLIDE_AI_API_TOKEN>` with your BolideAI key (can be generated at [here](https://bolide.ai/settings/api-keys))

```json
{
  "mcpServers": {
    "BolideAI-dev": {
      "type": "stdio",
      "command": "node",
      "args": [
        "--inspect=9999",
        "<PATH TO MCP DIRECTORY>/build/index.js"
      ],
      "env": {
        "BOLIDE_AI_MCP_DEBUG": "true",
        "BOLIDE_AI_API_TOKEN": "<your-api-key-here>"
      }
    }
  }
}
```

5. Make sure the workspace is open in Cursor
6. Launch the application in the simulator

### Start Using Tools

```typescript
// Create a project
scaffold_bolide_ai_project()

// Perform research
use_openai_deep_research({ 
  query: "AI trends in marketing automation 2024" 
})

// Analyze screencast content
analyze_screencasts({ 
  screencastNames: ["demo.mov"],
  force: false
})
```

## Environment Variables

- **`BOLIDE_AI_API_TOKEN`** - Required for research tools
- **`BOLIDE_AI_API_URL`** - Optional, defaults to https://bolide.ai/api

### Tool Configuration

- **`BOLIDE_AI_MCP_DEBUG=true`** - Enable diagnostic tools and detailed logging
- **Tool Groups** - Enable specific tool categories (see [Tool Options](TOOL_OPTIONS.md))
- **Individual Tools** - Enable specific tools only (see [Tool Options](TOOL_OPTIONS.md))

## Available Tools

Bolide AI MCP provides **54 tools** across 8 categories:

### 🚀 Project Scaffolding
- `scaffold_bolide_ai_project` - Create bolide.ai project directory structure

### 📱 Utility Tools  
- `check_companion_app_status` - Check companion app running status
- `launch_companion_app` - Launch Companion App for marketing capture
- `stop_companion_app` - Stop running companion app instances
- `install_brew_and_ffmpeg` - Install Homebrew package manager and FFmpeg

### 🤖 Content Generation
- `analyze_screencasts` - Analyze screencast content using Gemini AI
- `generate_gif` - Convert screencast segments to GIFs
- `enhance_audio` - Extract and enhance audio from screencasts using ElevenLabs

### 🔍 Research Tools
- `use_perplexity` - Research using Perplexity AI
- `use_openai_deep_research` - Deep research using OpenAI o4-mini-deep-research

### 💬 Slack Integration
- `slack_fetch_conversation_history` - Fetch chronological message history from Slack conversations
- `slack_list_all_slack_team_channels` - List all channels, DMs, and group messages in workspace
- `slack_search_for_messages_with_query` - Search messages across workspace with query modifiers
- `slack_sends_a_message_to_a_slack_channel` - Send messages to channels, DMs, or groups
- `slack_updates_a_slack_message` - Update existing messages by channel ID and timestamp

### 📝 Notion Integration
- `notion_add_page_content` - Add content blocks to Notion pages with rich formatting
- `notion_fetch_data` - Fetch pages and databases from Notion workspace
- `notion_create_comment` - Add comments to Notion pages or discussion threads
- `notion_create_database` - Create new Notion databases with defined property schemas
- `notion_create_notion_page` - Create new empty pages in Notion workspace
- `notion_fetch_database` - Fetch database structural metadata (properties, title, etc.)
- `notion_fetch_row` - Retrieve database row properties and metadata
- `notion_insert_row_database` - Create new pages (rows) in specified databases
- `notion_query_database` - Query database for pages (rows) with sorting and pagination
- `notion_retrieve_database_property` - Get details about specific database properties
- `notion_update_page` - Update page properties, icon, cover, or archive status
- `notion_update_row_database` - Update or archive existing database rows
- `notion_update_schema_database` - Update database title, description, and properties
- `notion_append_block_children` - Append child blocks to parent blocks or pages
- `notion_fetch_notion_block` - Retrieve specific blocks by UUID
- `notion_fetch_notion_child_block` - Get paginated list of child blocks
- `notion_notion_update_block` - Update block content and type-specific properties
- `notion_search_notion_page` - Search pages and databases by title

### 📋 Linear Integration
- `linear_create_issue` - Create new Linear issues with comprehensive options
- `linear_update_issue` - Update existing Linear issues (title, description, state, assignee, etc.)
- `linear_create_comment` - Add comments to Linear issues
- `linear_list_issues` - List Linear issues with filtering and pagination
- `linear_list_cycles` - Get all cycles/sprints from Linear
- `linear_get_cycles_by_team_id` - Get team-specific cycles
- `linear_list_states` - Get workflow states for teams
- `linear_list_teams` - Get teams with project filtering
- `linear_list_projects` - List all Linear projects
- `linear_list_users` - List workspace users with pagination

### 🛠️ Diagnostic Tools
- `diagnostic` - System environment validation (debug mode only)

## Research Tools

### Perplexity AI Research

Perform quick research and information gathering:

```typescript
use_perplexity({ 
  query: "Latest trends in AI marketing automation",
  search_mode: "web" // or "academic"
})
```

### OpenAI Deep Research

Conduct comprehensive research with query enrichment:

```typescript
use_openai_deep_research({ 
  query: "Economic impact of renewable energy adoption" 
})
```

The deep research tool:
1. **Enriches** your query using GPT-4.1 with detailed research instructions
2. **Researches** using o4-mini-deep-research with web search and code interpreter
3. **Returns** both enriched instructions and comprehensive findings

## Linear Project Management

Bolide AI MCP provides comprehensive Linear integration for project management and issue tracking. Connect to your Linear workspace through Composio authentication.

### Issue Management

Create and manage Linear issues with full parameter support:

```typescript
// Create a new issue
linear_create_issue({
  project_id: "your-project-id",
  team_id: "your-team-id", 
  title: "Fix login bug on homepage",
  description: "Users report login button unresponsive after v2.3 deployment",
  assignee_id: "user-id",
  priority: 1, // Urgent
  label_ids: ["bug-label-id", "frontend-label-id"]
})

// Update an existing issue
linear_update_issue({
  issue_id: "issue-id",
  state_id: "in-progress-state-id",
  assignee_id: "new-assignee-id"
})

// Add a comment
linear_create_comment({
  issue_id: "issue-id",
  body: "## Update\n\nFixed the authentication flow. Ready for testing."
})
```

### Project Organization

List and organize your Linear workspace:

```typescript
// Get all projects
linear_list_projects()

// Get teams for a project
linear_list_teams({ project_id: "project-id" })

// Get workflow states for a team
linear_list_states({ team_id: "team-id" })

// Get cycles/sprints
linear_list_cycles()
linear_get_cycles_by_team_id({ team_id: "team-id" })
```

### Issue Tracking

List and filter issues across your workspace:

```typescript
// List recent issues
linear_list_issues({ first: 20 })

// Filter by project
linear_list_issues({ 
  project_id: "project-id",
  first: 50 
})

// Filter by assignee
linear_list_issues({ 
  assignee_id: "user-id",
  first: 25 
})
```

## Slack Integration

Bolide AI MCP provides comprehensive Slack integration for workspace communication and management. Connect to your Slack workspace through Composio authentication.

### Channel and Workspace Management

List and explore your Slack workspace:

```typescript
// List all channels (public, private, DMs, group messages)
slack_list_all_slack_team_channels({ 
  types: "public_channel,private_channel,mpim,im",
  limit: 50 
})

// Filter channels by name
slack_list_all_slack_team_channels({ 
  channel_name: "development",
  types: "public_channel,private_channel" 
})

// Exclude archived channels
slack_list_all_slack_team_channels({ 
  exclude_archived: true,
  limit: 100 
})
```

### Message Management

Send and update messages with rich formatting:

```typescript
// Send a simple text message
slack_sends_a_message_to_a_slack_channel({
  channel: "#general",
  text: "Hello team! 👋"
})

// Send message with Slack markdown formatting
slack_sends_a_message_to_a_slack_channel({
  channel: "#development", 
  text: "*Important:* Please review the new deployment process\n• Step 1: Run tests\n• Step 2: Deploy to staging\n• Step 3: Get approval"
})

// Send threaded reply
slack_sends_a_message_to_a_slack_channel({
  channel: "#general",
  text: "This is a reply to the discussion",
  thread_ts: "1234567890.123456"
})

// Update an existing message
slack_updates_a_slack_message({
  channel: "#general",
  ts: "1234567890.123456", 
  text: "Updated message content with *bold* text"
})
```

### Message Search and History

Search and retrieve conversation history:

```typescript
// Search for messages across workspace
slack_search_for_messages_with_query({
  query: "deployment failed",
  count: 20,
  sort: "timestamp"
})

// Search with modifiers
slack_search_for_messages_with_query({
  query: "in:#development from:@john has:link",
  count: 10
})

// Search by date range
slack_search_for_messages_with_query({
  query: "bug report before:2024-01-15",
  count: 25
})

// Fetch conversation history
slack_fetch_conversation_history({
  channel: "C1234567890", // Channel ID
  limit: 100
})

// Fetch history with time range
slack_fetch_conversation_history({
  channel: "C1234567890",
  oldest: "1640995200.000000", // Unix timestamp
  latest: "1641081600.000000",
  limit: 50
})
```

### Advanced Messaging Features

Utilize advanced Slack features:

```typescript
// Send message with custom bot appearance
slack_sends_a_message_to_a_slack_channel({
  channel: "#announcements",
  text: "System maintenance completed successfully",
  username: "System Bot",
  icon_emoji: ":robot_face:"
})

// Send message with link unfurling
slack_sends_a_message_to_a_slack_channel({
  channel: "#sharing",
  text: "Check out this article: https://example.com/article",
  unfurl_links: true,
  unfurl_media: true
})

// Send message and broadcast to channel (for threaded replies)
slack_sends_a_message_to_a_slack_channel({
  channel: "#general",
  text: "Important update for everyone",
  thread_ts: "1234567890.123456",
  reply_broadcast: true
})
```

## Notion Integration

Bolide AI MCP provides comprehensive Notion integration for content management and knowledge base operations. Connect to your Notion workspace through Composio authentication.

### Page and Database Management

Create and manage Notion pages and databases:

```typescript
// Fetch all accessible pages and databases
notion_fetch_data({ 
  get_all: true,
  page_size: 100 
})

// Search for specific pages or databases
notion_search_notion_page({
  query: "project documentation",
  filter_value: "page",
  page_size: 20
})

// Create a new page
notion_create_notion_page({
  parent_id: "page-id",
  title: "New Project Documentation",
  icon: "📋",
  cover: "https://example.com/cover-image.jpg"
})

// Create a new database
notion_create_database({
  parent_id: "page-id",
  title: "Project Tasks",
  properties: [
    { name: "Task", type: "title" },
    { name: "Status", type: "select" },
    { name: "Priority", type: "number" },
    { name: "Due Date", type: "date" }
  ]
})
```

### Content Management

Add and manage content within pages:

```typescript
// Add content blocks to a page
notion_add_page_content({
  parent_block_id: "page-id",
  content_block: {
    block_property: "paragraph",
    content: "This is a new paragraph with **bold** text",
    bold: false,
    italic: false
  }
})

// Append multiple child blocks
notion_append_block_children({
  block_id: "parent-block-id",
  children: [
    {
      type: "paragraph",
      paragraph: { rich_text: [{ text: { content: "First paragraph" } }] }
    },
    {
      type: "bulleted_list_item", 
      bulleted_list_item: { rich_text: [{ text: { content: "List item" } }] }
    }
  ]
})

// Update existing block content
notion_notion_update_block({
  block_id: "block-id",
  block_type: "paragraph",
  content: "Updated paragraph content",
  additional_properties: { color: "blue_background" }
})
```

### Database Operations

Work with Notion databases and their data:

```typescript
// Get database structure and metadata
notion_fetch_database({ database_id: "database-id" })

// Query database for specific entries
notion_query_database({
  database_id: "database-id",
  page_size: 50,
  sorts: [{ property_name: "Due Date", ascending: false }]
})

// Insert new row into database
notion_insert_row_database({
  database_id: "database-id",
  properties: [
    { name: "Task", type: "title", value: "Complete project setup" },
    { name: "Status", type: "select", value: "In Progress" },
    { name: "Priority", type: "number", value: "3" },
    { name: "Due Date", type: "date", value: "2024-12-31T23:59:00.000Z" }
  ]
})

// Update existing database row
notion_update_row_database({
  row_id: "row-id",
  properties: [
    { name: "Status", type: "select", value: "Completed" },
    { name: "Priority", type: "number", value: "1" }
  ]
})

// Update database schema
notion_update_schema_database({
  database_id: "database-id",
  title: "Updated Project Tasks",
  properties: [
    { name: "Status", new_type: "status" },
    { name: "Old Column", remove: true }
  ]
})
```

### Block and Content Retrieval

Navigate and retrieve content from Notion:

```typescript
// Get specific block content
notion_fetch_notion_block({ block_id: "block-id" })

// Get child blocks of a parent
notion_fetch_notion_child_block({
  block_id: "parent-block-id",
  page_size: 100
})

// Get database row details
notion_fetch_row({ page_id: "row-page-id" })

// Get specific database property details
notion_retrieve_database_property({
  database_id: "database-id",
  property_id: "property-name-or-id"
})
```

### Comments and Collaboration

Add comments and collaborate on content:

```typescript
// Add comment to a page
notion_create_comment({
  parent_page_id: "page-id",
  comment: {
    content: "Great work on this documentation! 👍",
    bold: false,
    italic: false
  }
})

// Reply to existing discussion
notion_create_comment({
  discussion_id: "discussion-id", 
  comment: {
    content: "Thanks for the feedback!",
    bold: false,
    italic: false
  }
})
```

### Page Updates and Management

Update page properties and status:

```typescript
// Update page properties
notion_update_page({
  page_id: "page-id",
  properties: {
    "Title": { title: [{ text: { content: "Updated Page Title" } }] },
    "Status": { select: { name: "Published" } }
  },
  icon: { emoji: "✅" },
  cover: { external: { url: "https://example.com/new-cover.jpg" } }
})

// Archive a page
notion_update_page({
  page_id: "page-id",
  archived: true
})
```

## Common Workflows

### Complete Marketing Content Creation

1. **Set up project structure**:
   ```typescript
   scaffold_bolide_ai_project()
   ```

2. **Check app status and capture content**:
   ```typescript
   check_companion_app_status()
   launch_companion_app()
   ```

3. **Enhance audio quality**:
   ```typescript
   enhance_audio({ 
     screencastNames: ["demo.mov"]
   })
   ```

### Research Workflow

1. **Quick research**:
   ```typescript
   use_perplexity({ 
     query: "Your research question",
     search_mode: "web"
   })
   ```

2. **Deep research**:
   ```typescript
   use_openai_deep_research({ 
     query: "Complex research topic requiring comprehensive analysis"
   })
   ```





## Configuration Options

### Selective Tool Registration

Enable only the tools you need to optimize performance:

```json
{
  "env": {
    "BOLIDE_AI_MCP_GROUP_RESEARCH": "true",
    "BOLIDE_AI_MCP_GROUP_CONTENT_GENERATORS": "true",
    "BOLIDE_AI_API_TOKEN": "your-api-key"
  }
}
```

### Available Tool Groups

- `BOLIDE_AI_MCP_GROUP_LAUNCH` - Launch and utility tools
- `BOLIDE_AI_MCP_GROUP_SCAFFOLDING` - Project scaffolding tools
- `BOLIDE_AI_MCP_GROUP_CONTENT_GENERATORS` - Content generation tools
- `BOLIDE_AI_MCP_GROUP_RESEARCH` - Research and information gathering tools
- `BOLIDE_AI_MCP_GROUP_SLACK` - Slack integration tools
- `BOLIDE_AI_MCP_GROUP_LINEAR` - Linear project management tools
- `BOLIDE_AI_MCP_GROUP_NOTION` - Notion integration tools
- `BOLIDE_AI_MCP_GROUP_DIAGNOSTICS` - Diagnostic tools

## Documentation

- [**Tool Reference**](TOOLS.md) - Comprehensive tool documentation
- [**Tool Options**](TOOL_OPTIONS.md) - Configuration and selective tool registration
- [**Contributing**](CONTRIBUTING.md) - Development and contribution guidelines

## System Requirements

### Dependencies

- **Node.js** 22+
- **ffmpeg** (required for GIF generation tools)
- **Companion App**

## Troubleshooting

### Enable Debug Mode

```json
{
  "env": {
    "BOLIDE_AI_MCP_DEBUG": "true"
  }
}
```

### Run Diagnostics

```typescript
diagnostic() // Available in debug mode
```

### Common Issues

1. **Missing API Keys**: Ensure all required environment variables are set
2. **ffmpeg Not Found**: Install ffmpeg using `brew install ffmpeg`
3. **Permission Issues**: Check file system permissions for project directories

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Data Route LLC](https://bolide.ai)

## Support

- 🐛 [Report Issues](https://github.com/BolideAI/mcp/issues)
- 💬 [Support](https://github.com/BolideAI/mcp/discussions)

---

**Bolide AI MCP** - Streamline your marketing automation and research workflows with AI-powered tools.