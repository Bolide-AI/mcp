# BolideAI MCP Tool Options

This document explains how to configure tool registration in BolideAI MCP to optimise for different workflows and reduce the number of tools presented to LLM clients.

## Overview

BolideA IMCP supports selective tool registration based on environment variables. This allows you to:

1. **Opt-in to individual tools** - Enable only specific tools you need
2. **Enable tool groups** - Enable logical groups of tools for specific workflows
3. **Default "all tools enabled"** - Without any configuration, all tools are enabled (default behaviour)

## Why Use Selective Tool Registration?

- **Reduced context window usage for LLMs** - Only register tools needed for a specific workflow
- **Optimised for different use cases** - Configure for project scaffolding, marketing capture, etc.

## Available Tool Groups and Environment Variables

BolideAI MCP provides workflow-based tool groups that organise tools logically based on common developer workflows.

### Workflow-based Groups

These groups organise tools based on common developer workflows, making it easier to enable just the tools needed for specific tasks:

- **BOLIDEAI_MCP_GROUP_LAUNCH=true** - Launch and utility tools
  - _e.g., Launch companion app for marketing capture, stop running utilities._
- **BOLIDEAI_MCP_GROUP_SCAFFOLDING=true** - Project scaffolding and creation tools
  - _e.g., Create marketing project directories and structures._
- **BOLIDEAI_MCP_GROUP_CONTENT_GENERATORS=true** - Content generation tools
  - _e.g., Generate social media posts using AI from captured screenshots and videos._
- **BOLIDEAI_MCP_GROUP_RESEARCH=true** - Research and information gathering tools
  - _e.g., Perform research using Perplexity AI for information gathering and question answering._
- **BOLIDEAI_MCP_GROUP_NOTION=true** - Notion integration tools
  - _e.g., Add content to Notion pages, fetch page and database information._
- **BOLIDEAI_MCP_GROUP_SLACK=true** - Slack integration tools
  - _e.g., Send messages, search conversations, list channels, update messages._
- **BOLIDEAI_MCP_GROUP_LINEAR=true** - Linear project management tools
  - _e.g., Create and manage issues, track projects, organize teams and workflows._
- **BOLIDEAI_MCP_GROUP_DIAGNOSTICS=true** - Logging and diagnostics tools
  - _e.g., System diagnostics, environment validation._

## Enabling Individual Tools

To enable specific tools rather than entire groups, use the following environment variables. Each tool is enabled by setting its corresponding variable to `true`.

### Project Scaffolding Tools
- **BOLIDEAI_MCP_TOOL_SCAFFOLD_PROJECT=true** - Create bolide.ai project directories.

### Content Generation Tools
- **BOLIDEAI_MCP_TOOL_CONTENT_GENERATORS=true** - Analyze screencasts, generate GIFs, and enhance audio using AI.

### Research Tools
- **BOLIDEAI_MCP_TOOL_USE_PERPLEXITY=true** - Perform research and information gathering using Perplexity AI.
- **BOLIDEAI_MCP_TOOL_USE_OPENAI_DEEP_RESEARCH=true** - Perform deep research using OpenAI o4-mini-deep-research model.

### Notion Integration Tools
- **BOLIDEAI_MCP_TOOL_NOTION=true** - Add content to Notion pages and fetch page/database information.

### Slack Integration Tools
- **BOLIDEAI_MCP_TOOL_SLACK=true** - Send messages, search conversations, list channels, and update Slack messages.

### Linear Integration Tools
- **BOLIDEAI_MCP_TOOL_LINEAR=true** - Create and manage Linear issues, track projects, organize teams and workflows, manage cycles, and collaborate on project management tasks.

### Utility Tools
- **BOLIDEAI_MCP_TOOL_CHECK_COMPANION_APP_STATUS=true** - Check whether the companion app is currently running or not.
- **BOLIDEAI_MCP_TOOL_LAUNCH_COMPANION_APP=true** - Launch companion app for capturing screenshots and videos for marketing projects.
- **BOLIDEAI_MCP_TOOL_STOP_COMPANION_APP=true** - Stop any running instances of the companion app.
- **BOLIDEAI_MCP_TOOL_INSTALL_BREW_AND_FFMPEG=true** - Install Homebrew package manager and FFmpeg for video processing dependencies.

### Diagnostics
- **BOLIDEAI_MCP_DEBUG=true** - Enable diagnostic tool for BolideAI MCP server.

## Available Tools

BolideAI MCP currently provides **38 tools** across different categories:

### Project Scaffolding Tools  
- `scaffold_bolide_ai_project` - Create a bolide.ai project directory with organized directory structure

### Content Generation Tools
- `analyze_screencasts` - Analyze screencasts using Gemini API via web API integration
- `generate_gif` - Generate GIFs from screencast segments using ffmpeg
- `enhance_audio` - Extract and enhance audio from screencasts using ElevenLabs speech-to-speech conversion

### Research Tools
- `use_perplexity` - Perform research and information gathering using Perplexity AI
- `use_openai_deep_research` - Perform deep research using OpenAI o4-mini-deep-research model

### Notion Integration Tools
- `notion_add_page_content` - Add content blocks to Notion pages or parent blocks
- `notion_fetch_data` - Fetch pages and databases from Notion workspace

### Slack Integration Tools
- `slack_fetch_conversation_history` - Fetch chronological message history from Slack conversations with pagination and time filtering
- `slack_list_all_slack_team_channels` - List all channels, DMs, and group messages in workspace with filtering options
- `slack_search_for_messages_with_query` - Search messages across workspace with query modifiers and sorting
- `slack_sends_a_message_to_a_slack_channel` - Send messages to channels, DMs, or groups with rich formatting support
- `slack_updates_a_slack_message` - Update existing messages by channel ID and timestamp with content replacement

### Linear Integration Tools
- `linear_create_issue` - Create new Linear issues with comprehensive options for project management
- `linear_update_issue` - Update existing Linear issues (title, description, state, assignee, priority, etc.)
- `linear_create_comment` - Add comments to Linear issues with Markdown support
- `linear_list_issues` - List Linear issues with filtering by project, assignee, and pagination
- `linear_list_cycles` - Get all cycles/sprints from Linear workspace
- `linear_get_cycles_by_team_id` - Get team-specific cycles for sprint management
- `linear_list_states` - Get workflow states for teams to understand issue progression
- `linear_list_teams` - Get teams with project filtering for organization
- `linear_list_projects` - List all Linear projects in the workspace
- `linear_list_users` - List workspace users with pagination for team management

### Utility Tools
- `check_companion_app_status` - Checks whether the companion app is currently running or not
- `launch_companion_app` - Launches companion app for marketing screenshot/video capture
- `stop_companion_app` - Stops any running instances of the companion app
- `install_brew_and_ffmpeg` - Installs Homebrew package manager and FFmpeg for video processing dependencies

### Diagnostic Tools (Debug Mode Only)
- `diagnostic` - Provides comprehensive system environment information (requires `BOLIDEAI_MCP_DEBUG=true`)

## Recommended Tool Combinations for Common Use Cases

Workflow-based groups make it easier to enable just the right tools for specific development tasks. Here are some recommended combinations:

### Project Scaffolding

For developers focused on creating new projects and directory structures:

```json
{
  "env": {
    "BOLIDEAI_MCP_GROUP_SCAFFOLDING": "true"
  }
}
```

This provides tools for:
1. Creating marketing project directories
2. Setting up project structures

### Launch and Utilities

For developers who need to launch applications and manage utilities:

```json
{
  "env": {
    "BOLIDEAI_MCP_GROUP_LAUNCH": "true"
  }
}
```

This provides tools for:
1. Launching simctl for marketing capture
2. Managing running utility applications



### Diagnostics and Troubleshooting

For troubleshooting and system diagnostics:

```json
{
  "env": {
    "BOLIDEAI_MCP_GROUP_DIAGNOSTICS": "true"
  }
}
```

This provides tools for:
1. System environment validation
2. Dependency checking
3. Configuration diagnostics

### Content Generation

For generating social media content from captured artifacts:

```json
{
  "env": {
    "BOLIDEAI_MCP_GROUP_CONTENT_GENERATORS": "true",
    "BOLIDEAI_API_TOKEN": "your-api-token"
  }
}
```

This provides tools for:
1. Analyzing screencast content using Gemini AI via web API
2. Generating GIFs from screencast segments
3. Enhancing audio quality using ElevenLabs

### Complete Marketing Workflow

For a complete marketing content creation workflow:

```json
{
  "env": {
    "BOLIDEAI_MCP_GROUP_SCAFFOLDING": "true",
    "BOLIDEAI_MCP_GROUP_LAUNCH": "true",
    "BOLIDEAI_MCP_GROUP_CONTENT_GENERATORS": "true",
    "BOLIDEAI_MCP_GROUP_RESEARCH": "true",
    "BOLIDEAI_API_TOKEN": "your-api-token"
  }
}
```

### Individual Tool Selection

To enable only specific tools:

```json
{
      "env": {
        "BOLIDEAI_MCP_TOOL_SCAFFOLD_PROJECT": "true",
        "BOLIDEAI_MCP_TOOL_CHECK_COMPANION_APP_STATUS": "true",
        "BOLIDEAI_MCP_TOOL_LAUNCH_COMPANION_APP": "true",
        "BOLIDEAI_MCP_TOOL_STOP_COMPANION_APP": "true"
    }
}
```

## Example Cursor/Windsurf Configuration

Here is a fully worked example of how to configure Cursor/Windsurf to use specific tool groups:

```json
{
  "mcpServers": {
    "BolideAI": {
      "command": "npx",
      "args": ["-y", "@bolide-ai/mcp@latest"],
      "env": {
        "BOLIDEAI_API_TOKEN": "your-api-key",
        "BOLIDEAI_MCP_GROUP_SCAFFOLDING": "true"
      }
    }
  }
}
```

This example configures the MCP client to only enable tools related to project scaffolding and creation.

## Debug Mode

To enable the diagnostic tool and additional debugging information:

```json
{
  "mcpServers": {
    "BolideAI": {
      "command": "npx",
      "args": ["-y", "@bolide-ai/mcp@latest"],
      "env": {
        "BOLIDEAI_API_TOKEN": "your-api-key",
        "BOLIDEAI_MCP_DEBUG": "true"
      }
    }
  }
}
```

With debug mode enabled, you can use the diagnostic tool to troubleshoot issues and get detailed system information.

## Environment Variables Summary

### Required for All API Operations
- `BOLIDEAI_API_TOKEN` - Required for content generation and research tools
- `BOLIDEAI_API_URL` - Optional, defaults to https://bolide.ai/api

### Tool Groups
- `BOLIDEAI_MCP_GROUP_LAUNCH` - Launch and utility tools
- `BOLIDEAI_MCP_GROUP_SCAFFOLDING` - Project scaffolding tools
- `BOLIDEAI_MCP_GROUP_CONTENT_GENERATORS` - Content generation tools
- `BOLIDEAI_MCP_GROUP_RESEARCH` - Research tools
- `BOLIDEAI_MCP_GROUP_NOTION` - Notion integration tools
- `BOLIDEAI_MCP_GROUP_SLACK` - Slack integration tools
- `BOLIDEAI_MCP_GROUP_LINEAR` - Linear project management tools
- `BOLIDEAI_MCP_GROUP_DIAGNOSTICS` - Diagnostic tools

### Individual Tools
- `BOLIDEAI_MCP_TOOL_SCAFFOLD_PROJECT` - Project scaffolding
- `BOLIDEAI_MCP_TOOL_CONTENT_GENERATORS` - Content generation tools (analyze screencasts, generate GIFs, enhance audio)
- `BOLIDEAI_MCP_TOOL_USE_PERPLEXITY` - Perplexity AI research tool
- `BOLIDEAI_MCP_TOOL_USE_OPENAI_DEEP_RESEARCH` - OpenAI deep research tool
- `BOLIDEAI_MCP_TOOL_NOTION` - Notion integration tools
- `BOLIDEAI_MCP_TOOL_SLACK` - Slack integration tools  
- `BOLIDEAI_MCP_TOOL_LINEAR` - Linear project management tools
- `BOLIDEAI_MCP_TOOL_CHECK_COMPANION_APP_STATUS` - Status check utility
- `BOLIDEAI_MCP_TOOL_LAUNCH_COMPANION_APP` - Launch utility
- `BOLIDEAI_MCP_TOOL_STOP_COMPANION_APP` - Stop utility
- `BOLIDEAI_MCP_TOOL_INSTALL_BREW_AND_FFMPEG` - Install development dependencies
- `BOLIDEAI_MCP_DEBUG` - Diagnostic tool