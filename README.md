# DataRouteMCP

[![npm version](https://badge.fury.io/js/dataroutemcp.svg)](https://badge.fury.io/js/dataroutemcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

DataRouteMCP is a comprehensive ModelContextProtocol (MCP) server that provides tools for marketing automation, content generation, research, and project management. It integrates with various AI services to streamline workflows for developers and marketers.

## Features

- 🚀 **Project Scaffolding** - Create marketing project directories and structures
- 📱 **Marketing Automation** - Capture screenshots and videos using companion app
- 🎯 **Artifact Management** - Organize marketing materials with structured directories
- 🤖 **AI-Powered Content Generation** - Generate social media posts using Gemini AI
- 🔍 **Research Tools** - Comprehensive research using Perplexity AI and OpenAI
- 📊 **Asset Management** - Organize and manage marketing assets
- 🛠️ **Diagnostic Tools** - System validation and troubleshooting

## Getting Started

### Quick Start (NPM Package)

For quick testing without local builds:

#### Installation

```bash
npm install -g dataroutemcp
```

Or use with npx (recommended):

```bash
npx dataroutemcp@latest
```

#### Configuration

Configure your MCP client with the following:

```json
{
  "mcpServers": {
    "DataRouteMCP": {
      "command": "npx",
      "args": ["-y", "dataroutemcp@latest"],
      "env": {
        "DATAROUTEMCP_GROUP_RESEARCH": "true",
        "OPENAI_API_KEY": "your-openai-api-key",
        "PERPLEXITY_API_KEY": "your-perplexity-api-key"
      }
    }
  }
}
```

### Development Setup (Local Build)

For development or local builds, follow these detailed steps:

#### 1. Install Prerequisites

**Install Node.js 23.11.1**
```bash
# Download and install from https://nodejs.org/en/download
```

**Clone the repositories**
```bash
git clone https://github.com/DataRoute-HQ/dataroute-mcp
git clone https://github.com/DataRoute-HQ/dataroute-companion
```

#### 2. Build and Install Companion App

**Build Companion App in Xcode:**
1. Open the project in Xcode
2. In Xcode menu select **Product → Archive**
3. Wait for the build to complete
4. In the opened window click **Distribute App → Debugging**
5. Wait for packaging
6. In the opened window click **Export** and select any convenient directory
7. Open the created directory in Finder and copy the Companion App to Applications (where all applications are located)

#### 3. Build the MCP Server

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
   - `<DATAROUTE_API_TOKEN>` with your Data Route API key (can be generated at [here](http://dataroute-web-production-kcumuv.laravel.cloud/))

```json
{
  "mcpServers": {
    "dataroutemcp-dev": {
      "type": "stdio",
      "command": "node",
      "args": [
        "--inspect=9999",
        "<PATH TO MCP DIRECTORY>/build/index.js"
      ],
      "env": {
        "DATAROUTEMCP_DEBUG": "true",
        "DATAROUTE_API_TOKEN": "<GEMINI API KEY HERE>"
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
scaffold_marketing_project()

// Perform research
use_openai_deep_research({ 
  query: "AI trends in marketing automation 2024" 
})

// Analyze video content
analyze_videos({ 
  artifactName: "my-project-20240101",
  videoNames: ["demo.mov"],
  force: false
})
```

## Environment Variables

- **`DATAROUTE_API_TOKEN`** - Required
- **`DATAROUTE_API_URL`** - Optional, defaults to https://dataroute-web-production-kcumuv.laravel.cloud/api

### Tool Configuration

- **`DATAROUTEMCP_DEBUG=true`** - Enable diagnostic tools and detailed logging
- **Tool Groups** - Enable specific tool categories (see [Tool Options](TOOL_OPTIONS.md))
- **Individual Tools** - Enable specific tools only (see [Tool Options](TOOL_OPTIONS.md))

## Available Tools

DataRouteMCP provides **15 tools** across 7 categories:

### 🚀 Project Scaffolding
- `scaffold_marketing_project` - Create marketing project directory structure

### 📱 Utility Tools  
- `check_companion_app_status` - Check companion app running status
- `launch_companion_app` - Launch Companion App for marketing capture
- `stop_companion_app` - Stop running companion app instances

### 🎯 Artifact Management
- `create_artifact_directory` - Create organized artifact directories
- `create_post_artifact` - Store post artifacts with metadata

### 📊 Asset Management
- `create_post_asset` - Create marketing asset files
- `create_research_asset` - Create research asset files

### 🤖 Content Generation
- `analyze_videos` - Analyze video content using AI
- `generate_gif` - Convert video segments to GIFs
- `enhance_audio` - Extract and enhance audio from videos using ElevenLabs
- `fetch_reddit_posts` - Fetch Reddit posts from specified subreddits

### 🔍 Research Tools
- `use_perplexity` - Research using Perplexity AI
- `use_openai_deep_research` - Deep research using OpenAI o4-mini-deep-research

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

## Common Workflows

### Complete Marketing Content Creation

1. **Set up project structure**:
   ```typescript
   scaffold_marketing_project()
   ```

2. **Create artifact directory**:
   ```typescript
   create_artifact_directory({ artifactName: "feature-demo" })
   ```

3. **Check app status and capture content**:
   ```typescript
   check_companion_app_status()
   launch_companion_app({ 
     artifactsDirectory: "/path/to/artifacts/feature-demo-20240101" 
   })
   ```

4. **Enhance audio quality**:
   ```typescript
   enhance_audio({ 
     artifactName: "feature-demo-20240101",
     videoNames: ["demo.mov"]
   })
   ```

5. **Store results**:
   ```typescript
   create_post_artifact({ 
     artifactName: "feature-demo-20240101",
     fileName: "final-post.md",
     fileContent: "Generated content..."
   })
   ```

6. **Store research**:
   ```typescript
   create_research_asset({ 
     name: "market-research.md",
     content: "Detailed research findings..."
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

3. **Store research findings**:
   ```typescript
   create_research_asset({ 
     name: "market-analysis.md",
     content: "Research findings and analysis..."
   })
   ```

### Reddit Data Collection

1. **Fetch Reddit posts**:
   ```typescript
   fetch_reddit_posts({ 
     subreddit: "programming",
     limit: 25,
     sort: "top",
     timePeriod: "day"
   })
   ```

2. **Store Reddit data**:
   ```typescript
   create_research_asset({ 
     name: "reddit-programming-trends.md",
     content: "Analysis of top programming posts..."
   })
   ```

## Configuration Options

### Selective Tool Registration

Enable only the tools you need to optimize performance:

```json
{
  "env": {
    "DATAROUTEMCP_GROUP_RESEARCH": "true",
    "DATAROUTEMCP_GROUP_CONTENT_GENERATORS": "true",
    "GOOGLE_API_KEY": "your-api-key",
    "OPENAI_API_KEY": "your-api-key"
  }
}
```

### Available Tool Groups

- `DATAROUTEMCP_GROUP_LAUNCH` - Launch and utility tools
- `DATAROUTEMCP_GROUP_SCAFFOLDING` - Project scaffolding tools
- `DATAROUTEMCP_GROUP_ARTIFACTS` - Artifact management tools
- `DATAROUTEMCP_GROUP_ASSET_GENERATORS` - Asset management tools
- `DATAROUTEMCP_GROUP_CONTENT_GENERATORS` - Content generation tools
- `DATAROUTEMCP_GROUP_RESEARCH` - Research and information gathering tools
- `DATAROUTEMCP_GROUP_DIAGNOSTICS` - Diagnostic tools

## Documentation

- [**Tool Reference**](TOOLS.md) - Comprehensive tool documentation
- [**Tool Options**](TOOL_OPTIONS.md) - Configuration and selective tool registration
- [**Contributing**](CONTRIBUTING.md) - Development and contribution guidelines

## System Requirements

### Dependencies

- **Node.js** 18+ (automatically handled by npx)
- **ffmpeg** (required for GIF generation tools)
- **Companion App**

## Troubleshooting

### Enable Debug Mode

```json
{
  "env": {
    "DATAROUTEMCP_DEBUG": "true"
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
3. **Permission Issues**: Check file system permissions for artifact directories

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Data Route LLC](https://www.dataroute.com/)

## Support

- 🐛 [Report Issues](https://github.com/DataRoute-HQ/dataroute-mcp/issues)
- 💬 [Support](https://github.com/DataRoute-HQ/dataroute-mcp/discussions)

---

**DataRouteMCP** - Streamline your marketing automation and research workflows with AI-powered tools. 