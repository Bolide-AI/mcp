# DataRouteMCP Tools Reference

This document provides a comprehensive list of all tools available in DataRouteMCP, organized by functionality.

## Tool Categories

### Utility Tools

Specialized utility tools for development workflows.

| Tool Name | Description |
|-----------|-------------|
| `check_companion_app_status` | Checks whether the companion app is currently running or not. Use this tool before launching or stopping the companion app to determine the current state |
| `launch_companion_app` | Launches the simctl.app for capturing screenshots and videos for marketing projects with directory parameter. For each launch, use a new directory under the current workspace. Must be a valid full directory path, e.g. /Users/yourname/Documents/workspace/marketing/artifacts/<feature>-<datetime> |
| `stop_companion_app` | Stops any running instances of the simctl.app companion app |
| `install_brew_and_ffmpeg` | Installs Homebrew package manager and then installs FFmpeg via Homebrew. This tool handles the complete setup process for video processing dependencies |

### Scaffold Tools

Tools for creating new projects from templates.

| Tool Name | Description |
|-----------|-------------|
| `scaffold_marketing_project` | Create a marketing project directory with assets and artifacts subdirectories. |

### Artifact Management Tools

Tools for managing artifact directories and organization.

| Tool Name | Description |
|-----------|-------------|
| `create_artifact_directory` | Create a new artifact directory with screenshots, videos, and posts subfolders under the specified artifacts directory. |
| `create_post_artifact` | Stores a post artifact in the given artifact directory. Takes artifactName, fileName, and fileContent parameters. |

### Asset Management Tools

Tools for managing asset files and organization.

| Tool Name | Description |
|-----------|-------------|
| `create_post_asset` | Creates a post asset file in the marketing assets directory. Takes name and content parameters. Creates markdown files in marketing/assets/posts directory. |
| `create_research_asset` | Creates a research asset file in the marketing assets directory. Takes name and content parameters. Creates markdown files in marketing/assets/research directory. |

### Content Generation Tools

Tools for generating social media content using AI.

| Tool Name | Description |
|-----------|-------------|
| `analyze_videos` | Analyzes videos using Gemini to generate detailed descriptions of what the LLM sees in each video. Takes artifact name and array of video file names. Requires GOOGLE_API_KEY environment variable. |
| `generate_gif` | Generates a GIF from a video file using ffmpeg. Takes artifact name, video file name, start timestamp, and end timestamp. Requires ffmpeg to be installed. |
| `enhance_audio` | Extracts audio from videos using ffmpeg and enhances it using ElevenLabs speech-to-speech conversion. Takes artifact name and array of video file names. Requires ELEVENLABS_API_KEY environment variable. |
| `fetch_reddit_posts` | Fetches Reddit posts from a specified subreddit using the local DataRoute API. Takes subreddit name and optional parameters for limit, sort, and time period. Requires DATAROUTE_API_TOKEN environment variable. |

### Research Tools

Tools for performing research and information gathering.

| Tool Name | Description |
|-----------|-------------|
| `use_perplexity` | Performs research and information gathering using Perplexity AI. Takes a query parameter and optional model/system_prompt parameters. Requires PERPLEXITY_API_KEY environment variable. |
| `use_openai_deep_research` | Performs deep research using OpenAI o4-mini-deep-research model. First enriches the query with detailed research instructions using GPT-4.1, then conducts comprehensive research with web search and code interpreter tools. Requires OPENAI_API_KEY environment variable. |

### Diagnostic Tools

Tools for system diagnostics and environment validation.

| Tool Name | Description |
|-----------|-------------|
| `diagnostic` | Provides comprehensive information about the MCP server environment, available dependencies, and configuration status. Only available when DATAROUTEMCP_DEBUG environment variable is set. |

## Tool Usage Patterns

### Common Workflows

1. **Project Scaffolding**:
   ```
   scaffold_marketing_project
   ```

2. **Marketing Content Creation**:
   ```
   create_artifact_directory({ artifactName: "feature-name" })
   check_companion_app_status()
   launch_companion_app({ artifactsDirectory: "/path/to/artifacts/feature-name-timestamp" })
   generate_gif({ artifactName: "feature-name-timestamp", videoName: "video.mov", startTime: "00:00:10", endTime: "00:00:20" })
   create_post_artifact({ artifactName: "feature-name-timestamp", fileName: "post.md", fileContent: "..." })
   ```

### Parameter Requirements

Many tools require specific parameters:
- **Scaffold tools**: No parameters required
- **Artifact tools**: `artifactName` required for creation, `artifactName`, `fileName`, `fileContent` for post creation
- **Asset tools**: `name`, `content` required
- **Content generation tools**: `artifactName`, `screenshotNames`, `videoNames` required
- **Launch tools**: `artifactsDirectory` required for launch utility

### Environment Variables

Tools can be selectively enabled using environment variables:
- Individual tools: `DATAROUTEMCP_TOOL_<TOOL_NAME>=true`
- Tool groups: `DATAROUTEMCP_GROUP_<GROUP_NAME>=true`
- Debug mode: `DATAROUTEMCP_DEBUG=true`
- Content generation: `GOOGLE_API_KEY=your-api-key` (required for AI tools)
- Audio enhancement: `ELEVENLABS_API_KEY=your-api-key` (required for audio enhancement tools)
- Reddit data fetching: `DATAROUTE_API_TOKEN=your-api-token` (required for Reddit tools)

Available tool groups:
- `DATAROUTEMCP_GROUP_LAUNCH=true` - Launch and utility tools
- `DATAROUTEMCP_GROUP_SCAFFOLDING=true` - Project scaffolding and creation tools
- `DATAROUTEMCP_GROUP_ARTIFACTS=true` - Artifact management tools
- `DATAROUTEMCP_GROUP_ASSET_GENERATORS=true` - Asset management tools
- `DATAROUTEMCP_GROUP_CONTENT_GENERATORS=true` - Content generation tools
- `DATAROUTEMCP_GROUP_RESEARCH=true` - Research and information gathering tools
- `DATAROUTEMCP_GROUP_DIAGNOSTICS=true` - Logging and diagnostics tools

## Notes

- All tools use Zod schema validation for parameters
- Error handling is standardized across all tools
- Tools requiring write operations are marked with `isWriteTool: true`
- Debug tool requires `DATAROUTEMCP_DEBUG=true` environment variable
- Content generation tools require `GOOGLE_API_KEY` environment variable
- Research tools require `PERPLEXITY_API_KEY` environment variable
- Deep research tools require `OPENAI_API_KEY` environment variable
- GIF generation tool requires `ffmpeg` to be installed on the system
- Artifact directories are automatically timestamped when created
- Asset and artifact tools work with the marketing directory structure

## Total Tool Count

This MCP server currently provides **15 tools** across 7 categories for project scaffolding, artifact management, asset management, content generation, research, marketing capture, and system diagnostics.