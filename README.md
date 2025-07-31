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

Bolide AI MCP provides **38 tools** across 8 categories:

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