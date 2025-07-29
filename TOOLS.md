# BolideAIMCP Tools Reference

This document provides a comprehensive list of all tools available in BolideAIMCP, organized by functionality.

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
| `analyze_videos` | Analyzes videos using Gemini API via the web API integration. IMPORTANT: You MUST provide the videoNames and force parameters. Example: analyze_videos({ videoNames: ['video1.mp4', 'video2.mp4'], force: false }) |
| `generate_gif` | Generates a GIF from a video. IMPORTANT: You MUST provide the videoName, startTime, and endTime parameters. Example: generate_gif({ videoName: 'NAME_OF_VIDEO_FILE', startTime: '00:00:00', endTime: '00:00:00' }) |
| `enhance_audio` | Extracts audio from videos using ffmpeg and saves as MP3 files in the same directory. Automatically enhances audio using the web API which integrates with ElevenLabs speech-to-speech conversion with voice ID 29vD33N1CtxCmqQRPOHJ. Requires BOLIDEAI_API_TOKEN and optionally BOLIDEAI_API_URL environment variables. IMPORTANT: You MUST provide the videoNames parameter. Example: enhance_audio({ videoNames: ['video1.mp4', 'video2.mp4'] }) |

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
   check_companion_app_status()
   launch_companion_app()
   generate_gif({ videoName: "video.mov", startTime: "00:00:10", endTime: "00:00:20" })
   ```

3. **Research Workflow**:
   ```
   use_perplexity({ query: "research question", search_mode: "web" })
   use_openai_deep_research({ query: "complex research topic" })
   ```

### Parameter Requirements

Many tools require specific parameters:
- **Project scaffolding**: No parameters required
- **Content generation tools**: `videoNames` required for analysis tools; specific parameters for each tool
- **Launch tools**: No parameters required
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
- Content generation tools work with video files directly

## Total Tool Count

This MCP server currently provides **10 tools** across 5 categories for project scaffolding, content generation, research, marketing capture, and system diagnostics.