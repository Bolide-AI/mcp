# BolideAIMCP Tool Options

This document explains how to configure tool registration in BolideAIMCP to optimise for different workflows and reduce the number of tools presented to LLM clients.

## Overview

BolideAIMCP supports selective tool registration based on environment variables. This allows you to:

1. **Opt-in to individual tools** - Enable only specific tools you need
2. **Enable tool groups** - Enable logical groups of tools for specific workflows
3. **Default "all tools enabled"** - Without any configuration, all tools are enabled (default behaviour)

## Why Use Selective Tool Registration?

- **Reduced context window usage for LLMs** - Only register tools needed for a specific workflow
- **Optimised for different use cases** - Configure for project scaffolding, marketing capture, etc.

## Available Tool Groups and Environment Variables

BolideAIMCP provides workflow-based tool groups that organise tools logically based on common developer workflows.

### Workflow-based Groups

These groups organise tools based on common developer workflows, making it easier to enable just the tools needed for specific tasks:

- **BOLIDEAI_MCP_GROUP_LAUNCH=true** - Launch and utility tools
  - _e.g., Launch companion app for marketing capture, stop running utilities._
- **BOLIDEAI_MCP_GROUP_SCAFFOLDING=true** - Project scaffolding and creation tools
  - _e.g., Create marketing project directories and structures._
- **BOLIDEAI_MCP_GROUP_ARTIFACTS=true** - Artifact management tools
  - _e.g., Create artifact directories with organized structure for screenshots and videos, store post artifacts._
- **BOLIDEAI_MCP_GROUP_ASSET_GENERATORS=true** - Asset management tools
  - _e.g., Create asset files in the marketing assets directory structure._
- **BOLIDEAI_MCP_GROUP_CONTENT_GENERATORS=true** - Content generation tools
  - _e.g., Generate social media posts using AI from artifact screenshots and videos._
- **BOLIDEAI_MCP_GROUP_RESEARCH=true** - Research and information gathering tools
  - _e.g., Perform research using Perplexity AI for information gathering and question answering._
- **BOLIDEAI_MCP_GROUP_DIAGNOSTICS=true** - Logging and diagnostics tools
  - _e.g., System diagnostics, environment validation._

## Enabling Individual Tools

To enable specific tools rather than entire groups, use the following environment variables. Each tool is enabled by setting its corresponding variable to `true`.

### Project Scaffolding Tools
- **BOLIDEAI_MCP_TOOL_SCAFFOLD_PROJECT=true** - Create bolide.ai project directories.

### Artifact Management Tools
- **BOLIDEAI_MCP_TOOL_CREATE_ARTIFACT_DIRECTORY=true** - Create artifact directories with screenshots, videos, and posts subfolders.
- **BOLIDEAI_MCP_TOOL_CREATE_POST_ARTIFACT=true** - Store post artifacts in artifact directories.

### Asset Management Tools
- **BOLIDEAI_MCP_TOOL_CREATE_POST_ASSET=true** - Create post asset files in the project assets directory.
- **BOLIDEAI_MCP_TOOL_CREATE_RESEARCH_ASSET=true** - Create research asset files in the project assets directory.

### Content Generation Tools
- **BOLIDEAI_MCP_TOOL_CONTENT_GENERATORS=true** - Analyze videos, generate GIFs, enhance audio, and fetch Reddit posts using AI.

### Research Tools
- **BOLIDEAI_MCP_TOOL_USE_PERPLEXITY=true** - Perform research and information gathering using Perplexity AI.
- **BOLIDEAI_MCP_TOOL_USE_OPENAI_DEEP_RESEARCH=true** - Perform deep research using OpenAI o4-mini-deep-research model.

### Utility Tools
- **BOLIDEAI_MCP_TOOL_CHECK_COMPANION_APP_STATUS=true** - Check whether the companion app is currently running or not.
- **BOLIDEAI_MCP_TOOL_LAUNCH_COMPANION_APP=true** - Launch companion app for capturing screenshots and videos for marketing projects.
- **BOLIDEAI_MCP_TOOL_STOP_COMPANION_APP=true** - Stop any running instances of the companion app.
- **BOLIDEAI_MCP_TOOL_INSTALL_BREW_AND_FFMPEG=true** - Install Homebrew package manager and FFmpeg for video processing dependencies.

### Diagnostics
- **BOLIDEAI_MCP_DEBUG=true** - Enable diagnostic tool for BolideAIMCP server.

## Available Tools

BolideAIMCP currently provides **15 tools** across different categories:

### Project Scaffolding Tools  
- `scaffold_bolide_ai_project` - Create a bolide.ai project directory with assets and artifacts subdirectories

### Artifact Management Tools
- `create_artifact_directory` - Create a new artifact directory with screenshots, videos, and posts subfolders
- `create_post_artifact` - Store a post artifact in the given artifact directory

### Asset Management Tools
- `create_post_asset` - Create post asset files in the project assets directory
- `create_research_asset` - Create research asset files in the project assets directory

### Content Generation Tools
- `analyze_videos` - Analyze videos using Gemini API via web API integration
- `generate_gif` - Generate GIFs from video segments using ffmpeg
- `enhance_audio` - Extract and enhance audio from videos using ElevenLabs speech-to-speech conversion
- `fetch_reddit_posts` - Fetch Reddit posts from specified subreddits using BolideAI API

### Research Tools
- `use_perplexity` - Perform research and information gathering using Perplexity AI
- `use_openai_deep_research` - Perform deep research using OpenAI o4-mini-deep-research model

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

### Artifact Management

For managing marketing artifacts and posts:

```json
{
  "env": {
    "BOLIDEAI_MCP_GROUP_ARTIFACTS": "true"
  }
}
```

This provides tools for:
1. Creating artifact directories
2. Storing post artifacts
3. Organizing marketing materials

### Asset Management

For managing marketing assets and files:

```json
{
  "env": {
    "BOLIDEAI_MCP_GROUP_ASSET_GENERATORS": "true"
  }
}
```

This provides tools for:
1. Creating post and research asset files
2. Managing marketing asset directory structure

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
1. Analyzing video content using Gemini AI via web API
2. Generating GIFs from video segments
3. Enhancing audio quality using ElevenLabs
4. Fetching Reddit posts from specified subreddits

### Complete Marketing Workflow

For a complete marketing content creation workflow:

```json
{
  "env": {
    "BOLIDEAI_MCP_GROUP_SCAFFOLDING": "true",
    "BOLIDEAI_MCP_GROUP_LAUNCH": "true",
    "BOLIDEAI_MCP_GROUP_ARTIFACTS": "true",
    "BOLIDEAI_MCP_GROUP_ASSET_GENERATORS": "true",
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
- `BOLIDEAI_API_TOKEN` - Required for content generation, research, and Reddit data fetching tools
- `BOLIDEAI_API_URL` - Optional, defaults to https://bolide.ai/api

### Tool Groups
- `BOLIDEAI_MCP_GROUP_LAUNCH` - Launch and utility tools
- `BOLIDEAI_MCP_GROUP_SCAFFOLDING` - Project scaffolding tools
- `BOLIDEAI_MCP_GROUP_ARTIFACTS` - Artifact management tools  
- `BOLIDEAI_MCP_GROUP_ASSET_GENERATORS` - Asset management tools
- `BOLIDEAI_MCP_GROUP_CONTENT_GENERATORS` - Content generation tools
- `BOLIDEAI_MCP_GROUP_RESEARCH` - Research tools
- `BOLIDEAI_MCP_GROUP_DIAGNOSTICS` - Diagnostic tools

### Individual Tools
- `BOLIDEAI_MCP_TOOL_SCAFFOLD_PROJECT` - Project scaffolding
- `BOLIDEAI_MCP_TOOL_CREATE_ARTIFACT_DIRECTORY` - Artifact directory creation
- `BOLIDEAI_MCP_TOOL_CREATE_POST_ARTIFACT` - Post artifact storage
- `BOLIDEAI_MCP_TOOL_CREATE_POST_ASSET` - Post asset file creation
- `BOLIDEAI_MCP_TOOL_CREATE_RESEARCH_ASSET` - Research asset file creation  
- `BOLIDEAI_MCP_TOOL_CONTENT_GENERATORS` - Content generation tools (analyze videos, generate GIFs, enhance audio, fetch Reddit posts)
- `BOLIDEAI_MCP_TOOL_USE_PERPLEXITY` - Perplexity AI research tool
- `BOLIDEAI_MCP_TOOL_USE_OPENAI_DEEP_RESEARCH` - OpenAI deep research tool
- `BOLIDEAI_MCP_TOOL_CHECK_COMPANION_APP_STATUS` - Status check utility
- `BOLIDEAI_MCP_TOOL_LAUNCH_COMPANION_APP` - Launch utility
- `BOLIDEAI_MCP_TOOL_STOP_COMPANION_APP` - Stop utility
- `BOLIDEAI_MCP_TOOL_INSTALL_BREW_AND_FFMPEG` - Install development dependencies
- `BOLIDEAI_MCP_DEBUG` - Diagnostic tool