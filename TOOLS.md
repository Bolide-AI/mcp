# BolideAIMCP Tools Reference

This document provides a comprehensive list of all tools available in BolideAIMCP, organized by functionality.

## Tool Categories

### Project Scaffolding Tools

Tools for creating new projects from templates.

| Tool Name | Description |
|-----------|-------------|
| `scaffold_bolide_ai_project` | Create a bolide.ai project directory with assets and artifacts subdirectories. Creates organized directory structure for marketing projects. |

### Utility Tools

Specialized utility tools for development workflows.

| Tool Name | Description |
|-----------|-------------|
| `check_companion_app_status` | Checks whether the companion app is currently running with the same artifact directory or not. Use this tool before launching or stopping the companion app to determine the current state. DO NOT STOP THE APP IF IT IS RUNNING WITH A DIFFERENT ARTIFACT DIRECTORY. |
| `launch_companion_app` | Launches the companion app for capturing screenshots and videos. IMPORTANT: Use check_companion_app_status first to verify no instance with the same artifact directory is running. Unless already created in current session, you MUST create artifact directory before launching the companion app to provide the artifactsDirectory parameter. |
| `stop_companion_app` | Stops any running instances of the companion app. IMPORTANT: Use check_companion_app_status first to verify if the app is running with the same artifact directory before attempting to stop it. DO NOT STOP THE APP IF IT IS RUNNING WITH A DIFFERENT ARTIFACT DIRECTORY. |
| `install_brew_and_ffmpeg` | Installs Homebrew package manager and then installs FFmpeg via Homebrew. This tool handles the complete setup process for video processing dependencies. |

### Artifact Management Tools

Tools for managing artifact directories and organization.

| Tool Name | Description |
|-----------|-------------|
| `create_artifact_directory` | Creates a new artifact directory with screenshots, videos, and posts subfolders. IMPORTANT: You MUST provide the artifactName parameter. Example: create_artifact_directory({ artifactName: "ARTIFACT_NAME_WITHOUT_DATETIME" }) |
| `create_post_artifact` | Stores a post artifact in the given artifact directory. IMPORTANT: You MUST provide the artifactName, fileName, and fileContent parameters. Example: create_post_artifact({ artifactName: "ARTIFACT_NAME", fileName: "FILE_NAME", fileContent: "FILE_CONTENT" }) |

### Asset Management Tools

Tools for managing asset files and organization.

| Tool Name | Description |
|-----------|-------------|
| `create_post_asset` | Creates a post asset file in the project assets directory. IMPORTANT: You MUST provide the name and content parameters. Example: create_post_asset({ name: "FILE_NAME", content: "FILE_CONTENT" }) |
| `create_research_asset` | Creates a research asset file in the project assets directory. IMPORTANT: You MUST provide the name and content parameters. Example: create_research_asset({ name: "FILE_NAME", content: "RESEARCH_CONTENT" }) |

### Content Generation Tools

Tools for generating social media content using AI.

| Tool Name | Description |
|-----------|-------------|
| `analyze_videos` | Analyzes videos using Gemini API via the web API integration. IMPORTANT: You MUST provide the artifactName, videoNames and force parameters. Example: analyze_videos({ artifactName: 'ARTIFACT_NAME_WITH_TIMESTAMP', videoNames: ['video1.mp4', 'video2.mp4'], force: false }) |
| `generate_gif` | Generates a GIF from a video. IMPORTANT: You MUST provide the artifactName, videoName, startTime, and endTime parameters. Example: generate_gif({ artifactName: 'NAME_OF_ARTIFACT_DIRECTORY_WITH_TIMESTAMP', videoName: 'NAME_OF_VIDEO_FILE', startTime: '00:00:00', endTime: '00:00:00' }) |
| `enhance_audio` | Extracts audio from videos using ffmpeg and saves as MP3 files in the same directory. Automatically enhances audio using the web API which integrates with ElevenLabs speech-to-speech conversion with voice ID 29vD33N1CtxCmqQRPOHJ. Requires BOLIDEAI_API_TOKEN and optionally BOLIDEAI_API_URL environment variables. IMPORTANT: You MUST provide the artifactName and videoNames parameters. Example: enhance_audio({ artifactName: 'NAME_OF_ARTIFACT_DIRECTORY_WITH_TIMESTAMP', videoNames: ['video1.mp4', 'video2.mp4'] }) |
| `fetch_reddit_posts` | Fetches Reddit posts from a specified subreddit using the local BolideAI API. Requires BOLIDEAI_API_TOKEN and optionally BOLIDEAI_API_URL environment variables. IMPORTANT: You MUST provide the subreddit parameter. Example: fetch_reddit_posts({ subreddit: 'programming', limit: 10, sort: 'top', timePeriod: 'day' }) |

### Research Tools

Tools for performing research and information gathering.

| Tool Name | Description |
|-----------|-------------|
| `use_perplexity` | Perform search and information gathering using Perplexity AI via web API. IMPORTANT: You MUST provide the query and search_mode parameters as well as display the citations in the response, if provided. Example: use_perplexity({ query: "What is the capital of France?", search_mode: "web" }) |
| `use_openai_deep_research` | Perform deep research using OpenAI o4-mini-deep-research model via web API. First enriches the query with detailed research instructions using GPT-4.1, then conducts comprehensive research. Requires BOLIDEAI_API_TOKEN for authentication. IMPORTANT: You MUST provide the query parameter. Example: use_openai_deep_research({ query: "Economic impact of renewable energy adoption" }) |

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
   create_artifact_directory({ artifactName: "feature-name" })
   check_companion_app_status()
   launch_companion_app({ artifactsDirectory: "/path/to/artifacts/feature-name-timestamp" })
   generate_gif({ artifactName: "feature-name-timestamp", videoName: "video.mov", startTime: "00:00:10", endTime: "00:00:20" })
   create_post_artifact({ artifactName: "feature-name-timestamp", fileName: "post.md", fileContent: "..." })
   ```

3. **Research Workflow**:
   ```
   use_perplexity({ query: "research question", search_mode: "web" })
   use_openai_deep_research({ query: "complex research topic" })
   create_research_asset({ name: "research-findings.md", content: "..." })
   ```

### Parameter Requirements

Many tools require specific parameters:
- **Project scaffolding**: No parameters required
- **Artifact tools**: `artifactName` required for creation, `artifactName`, `fileName`, `fileContent` for post creation
- **Asset tools**: `name`, `content` required
- **Content generation tools**: `artifactName`, `videoNames` required for analysis tools; specific parameters for each tool
- **Launch tools**: `artifactsDirectory` required for launch utility
- **Research tools**: `query` required; `search_mode` for Perplexity

### Environment Variables

Tools can be selectively enabled using environment variables:
- Individual tools: `BOLIDEAI_MCP_TOOL_<TOOL_NAME>=true`
- Tool groups: `BOLIDEAI_MCP_GROUP_<GROUP_NAME>=true`
- Debug mode: `BOLIDEAI_MCP_DEBUG=true`
- API access: `BOLIDEAI_API_TOKEN=your-api-token` (required for research and content generation tools)

Available tool groups:
- `BOLIDEAI_MCP_GROUP_LAUNCH=true` - Launch and utility tools
- `BOLIDEAI_MCP_GROUP_SCAFFOLDING=true` - Project scaffolding and creation tools
- `BOLIDEAI_MCP_GROUP_ARTIFACTS=true` - Artifact management tools
- `BOLIDEAI_MCP_GROUP_ASSET_GENERATORS=true` - Asset management tools
- `BOLIDEAI_MCP_GROUP_CONTENT_GENERATORS=true` - Content generation tools
- `BOLIDEAI_MCP_GROUP_RESEARCH=true` - Research and information gathering tools
- `BOLIDEAI_MCP_GROUP_DIAGNOSTICS=true` - Logging and diagnostics tools

## Notes

- All tools use Zod schema validation for parameters
- Error handling is standardized across all tools
- Tools requiring write operations are marked with `isWriteTool: true`
- Debug tool requires `BOLIDEAI_MCP_DEBUG=true` environment variable
- Content generation and research tools require `BOLIDEAI_API_TOKEN` environment variable
- GIF generation tool requires `ffmpeg` to be installed on the system
- Artifact directories are automatically timestamped when created
- Asset and artifact tools work with the bolide.ai directory structure

## Total Tool Count

This MCP server currently provides **15 tools** across 7 categories for project scaffolding, artifact management, asset management, content generation, research, marketing capture, and system diagnostics.