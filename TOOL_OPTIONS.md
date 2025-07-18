# DataRouteMCP Tool Options

This document explains how to configure tool registration in DataRouteMCP to optimise for different workflows and reduce the number of tools presented to LLM clients.

## Overview

DataRouteMCP supports selective tool registration based on environment variables. This allows you to:

1. **Opt-in to individual tools** - Enable only specific tools you need
2. **Enable tool groups** - Enable logical groups of tools for specific workflows
3. **Default "all tools enabled"** - Without any configuration, all tools are enabled (default behaviour)

## Why Use Selective Tool Registration?

- **Reduced context window usage for LLMs** - Only register tools needed for a specific workflow
- **Optimised for different use cases** - Configure for project scaffolding, marketing capture, etc.

## Available Tool Groups and Environment Variables

DataRouteMCP provides workflow-based tool groups that organise tools logically based on common developer workflows.

### Workflow-based Groups

These groups organise tools based on common developer workflows, making it easier to enable just the tools needed for specific tasks:

- **DATAROUTEMCP_GROUP_LAUNCH=true** - Launch and utility tools
  - _e.g., Launch companion app for marketing capture, stop running utilities._
- **DATAROUTEMCP_GROUP_SCAFFOLDING=true** - Project scaffolding and creation tools
  - _e.g., Create marketing project directories and structures._
- **DATAROUTEMCP_GROUP_ARTIFACTS=true** - Artifact management tools
  - _e.g., Create artifact directories with organized structure for screenshots and videos, store post artifacts._
- **DATAROUTEMCP_GROUP_ASSET_GENERATORS=true** - Asset management tools
  - _e.g., Create asset files in the marketing assets directory structure._
- **DATAROUTEMCP_GROUP_CONTENT_GENERATORS=true** - Content generation tools
  - _e.g., Generate social media posts using AI from artifact screenshots and videos._
- **DATAROUTEMCP_GROUP_RESEARCH=true** - Research and information gathering tools
  - _e.g., Perform research using Perplexity AI for information gathering and question answering._
- **DATAROUTEMCP_GROUP_DIAGNOSTICS=true** - Logging and diagnostics tools
  - _e.g., System diagnostics, environment validation._

## Enabling Individual Tools

To enable specific tools rather than entire groups, use the following environment variables. Each tool is enabled by setting its corresponding variable to `true`.

### Project Scaffolding Tools
- **DATAROUTEMCP_TOOL_SCAFFOLD_PROJECT=true** - Create marketing project directories.

### Artifact Management Tools
- **DATAROUTEMCP_TOOL_CREATE_ARTIFACT_DIRECTORY=true** - Create artifact directories with screenshots, videos, and posts subfolders.
- **DATAROUTEMCP_TOOL_CREATE_POST_ARTIFACT=true** - Store post artifacts in artifact directories.

### Asset Management Tools
- **DATAROUTEMCP_TOOL_CREATE_POST_ASSET=true** - Create post asset files in the marketing assets directory.
- **DATAROUTEMCP_TOOL_CREATE_RESEARCH_ASSET=true** - Create research asset files in the marketing assets directory.

### Content Generation Tools
- **DATAROUTEMCP_TOOL_CONTENT_GENERATORS=true** - Analyze videos and generate GIFs using AI.
- **DATAROUTEMCP_TOOL_ENHANCE_AUDIO=true** - Extract and enhance audio from videos using ElevenLabs.
- **DATAROUTEMCP_TOOL_FETCH_REDDIT_POSTS=true** - Fetch Reddit posts from specified subreddits using DataRoute API.

### Research Tools
- **DATAROUTEMCP_TOOL_USE_PERPLEXITY=true** - Perform research and information gathering using Perplexity AI.
- **DATAROUTEMCP_TOOL_USE_OPENAI_DEEP_RESEARCH=true** - Perform deep research using OpenAI o4-mini-deep-research model.

### Utility Tools
- **DATAROUTEMCP_TOOL_CHECK_COMPANION_APP_STATUS=true** - Check whether the companion app is currently running or not.
- **DATAROUTEMCP_TOOL_LAUNCH_COMPANION_APP=true** - Launch simctl.app for capturing screenshots and videos for marketing projects.
- **DATAROUTEMCP_TOOL_STOP_COMPANION_APP=true** - Stop any running instances of the simctl.app companion app.
- **DATAROUTEMCP_TOOL_INSTALL_BREW_AND_FFMPEG=true** - Install Homebrew package manager and FFmpeg for video processing dependencies.

### Diagnostics
- **DATAROUTEMCP_DEBUG=true** - Enable diagnostic tool for DataRouteMCP server.

## Available Tools

DataRouteMCP currently provides **15 tools** across different categories:

### Project Scaffolding Tools  
- `scaffold_marketing_project` - Create a marketing project directory with assets and artifacts subdirectories

### Artifact Management Tools
- `create_artifact_directory` - Create a new artifact directory with screenshots, videos, and posts subfolders under the specified artifacts directory
- `create_post_artifact` - Store a post artifact in the given artifact directory

### Asset Management Tools
- `create_post_asset` - Create post asset files in the marketing/assets/posts directory
- `create_research_asset` - Create research asset files in the marketing/assets/research directory

### Content Generation Tools
- `analyze_videos` - Analyze videos using Gemini to generate detailed descriptions of what the LLM sees in each video
- `generate_gif` - Generate GIFs from video segments using ffmpeg
- `enhance_audio` - Extract and enhance audio from videos using ElevenLabs speech-to-speech conversion
- `fetch_reddit_posts` - Fetch Reddit posts from specified subreddits using DataRoute API

### Research Tools
- `use_perplexity` - Perform research and information gathering using Perplexity AI
- `use_openai_deep_research` - Perform deep research using OpenAI o4-mini-deep-research model

### Utility Tools
- `check_companion_app_status` - Checks whether the companion app is currently running or not
- `launch_companion_app` - Launches simctl.app for marketing screenshot/video capture
- `stop_companion_app` - Stops any running instances of the simctl.app companion app
- `install_brew_and_ffmpeg` - Installs Homebrew package manager and FFmpeg for video processing dependencies

### Diagnostic Tools (Debug Mode Only)
- `diagnostic` - Provides comprehensive system environment information (requires `DATAROUTEMCP_DEBUG=true`)

## Recommended Tool Combinations for Common Use Cases

Workflow-based groups make it easier to enable just the right tools for specific development tasks. Here are some recommended combinations:

### Project Scaffolding

For developers focused on creating new projects and directory structures:

```json
{
  "env": {
    "DATAROUTEMCP_GROUP_SCAFFOLDING": "true"
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
    "DATAROUTEMCP_GROUP_LAUNCH": "true"
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
    "DATAROUTEMCP_GROUP_ARTIFACTS": "true"
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
    "DATAROUTEMCP_GROUP_ASSET_GENERATORS": "true"
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
    "DATAROUTEMCP_GROUP_DIAGNOSTICS": "true"
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
    "DATAROUTEMCP_GROUP_CONTENT_GENERATORS": "true",
    "GOOGLE_API_KEY": "your-gemini-api-key"
  }
}
```

This provides tools for:
1. Analyzing video content using AI
2. AI-powered content creation using Gemini 2.5 Flash
3. Generating GIFs from video segments
4. Enhancing audio quality using ElevenLabs
5. Fetching Reddit posts from specified subreddits

### Complete Marketing Workflow

For a complete marketing content creation workflow:

```json
{
  "env": {
    "DATAROUTEMCP_GROUP_SCAFFOLDING": "true",
    "DATAROUTEMCP_GROUP_LAUNCH": "true",
    "DATAROUTEMCP_GROUP_ARTIFACTS": "true",
    "DATAROUTEMCP_GROUP_ASSET_GENERATORS": "true",
    "DATAROUTEMCP_GROUP_CONTENT_GENERATORS": "true",
    "GOOGLE_API_KEY": "your-gemini-api-key"
  }
}
```

### Individual Tool Selection

To enable only specific tools:

```json
{
      "env": {
      "DATAROUTEMCP_TOOL_SCAFFOLD_PROJECT": "true",
        "DATAROUTEMCP_TOOL_CHECK_COMPANION_APP_STATUS": "true",
        "DATAROUTEMCP_TOOL_LAUNCH_COMPANION_APP": "true",
  "DATAROUTEMCP_TOOL_STOP_COMPANION_APP": "true"
    }
}
```

## Example Cursor/Windsurf Configuration

Here is a fully worked example of how to configure Cursor/Windsurf to use specific tool groups:

```json
{
  "mcpServers": {
    "DataRouteMCP": {
      "command": "npx",
      "args": [
        "-y",
        "dataroutemcp@latest"
      ],
      "env": {
        "DATAROUTEMCP_GROUP_SCAFFOLDING": "true"
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
    "DataRouteMCP": {
      "command": "npx",
      "args": [
        "-y",
        "dataroutemcp@latest"
      ],
      "env": {
        "DATAROUTEMCP_DEBUG": "true"
      }
    }
  }
}
```

With debug mode enabled, you can use the diagnostic tool to troubleshoot issues and get detailed system information.

## Environment Variables Summary

### Required for Content Generation
- `GOOGLE_API_KEY` - Required for AI-powered content generation tools

### Required for Research
- `PERPLEXITY_API_KEY` - Required for Perplexity AI research tools
- `OPENAI_API_KEY` - Required for OpenAI deep research tools

### Required for Audio Enhancement
- `ELEVENLABS_API_KEY` - Required for audio enhancement tools

### Required for Reddit Data Fetching
- `DATAROUTE_API_TOKEN` - Required for Reddit data fetching tools
- `DATAROUTE_API_URL` - Optional, defaults to http://127.0.0.1:8000/api

### Tool Groups
- `DATAROUTEMCP_GROUP_LAUNCH` - Launch and utility tools
- `DATAROUTEMCP_GROUP_SCAFFOLDING` - Project scaffolding tools
- `DATAROUTEMCP_GROUP_ARTIFACTS` - Artifact management tools  
- `DATAROUTEMCP_GROUP_ASSET_GENERATORS` - Asset management tools
- `DATAROUTEMCP_GROUP_CONTENT_GENERATORS` - Content generation tools
- `DATAROUTEMCP_GROUP_RESEARCH` - Research tools
- `DATAROUTEMCP_GROUP_DIAGNOSTICS` - Diagnostic tools

### Individual Tools
- `DATAROUTEMCP_TOOL_SCAFFOLD_PROJECT` - Project scaffolding
- `DATAROUTEMCP_TOOL_CREATE_ARTIFACT_DIRECTORY` - Artifact directory creation
- `DATAROUTEMCP_TOOL_CREATE_POST_ARTIFACT` - Post artifact storage
- `DATAROUTEMCP_TOOL_CREATE_POST_ASSET` - Post asset file creation
- `DATAROUTEMCP_TOOL_CREATE_RESEARCH_ASSET` - Research asset file creation  
- `DATAROUTEMCP_TOOL_CONTENT_GENERATORS` - Content generation tools
- `DATAROUTEMCP_TOOL_ENHANCE_AUDIO` - Audio enhancement tool
- `DATAROUTEMCP_TOOL_FETCH_REDDIT_POSTS` - Reddit data fetching tool
- `DATAROUTEMCP_TOOL_USE_PERPLEXITY` - Research tool
- `DATAROUTEMCP_TOOL_CHECK_COMPANION_APP_STATUS` - Status check utility
- `DATAROUTEMCP_TOOL_LAUNCH_COMPANION_APP` - Launch utility
- `DATAROUTEMCP_TOOL_STOP_COMPANION_APP` - Stop utility
- `DATAROUTEMCP_DEBUG` - Diagnostic tool