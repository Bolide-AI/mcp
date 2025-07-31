# BolideAI MCP

[![npm version](https://badge.fury.io/js/@bolide-ai/mcp.svg)](https://badge.fury.io/js/@bolide-ai/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

BolideAI MCP is a comprehensive ModelContextProtocol (MCP) server that provides tools for marketing automation, content generation, research, and project management. It integrates with various AI services to streamline workflows for developers and marketers.

## Features

- 🚀 **Project Scaffolding** - Create marketing project directories and structures
- 📱 **Marketing Automation** - Capture screenshots and videos using companion app
- 🤖 **AI-Powered Content Generation** - Generate social media posts using Gemini AI
- 🔍 **Research Tools** - Comprehensive research using Perplexity AI and OpenAI
- 📋 **Linear Integration** - Comprehensive Linear project management and issue tracking
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
        "BOLIDEAI_API_KEY": "your-api-key",
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
   - `<BOLIDEAI_API_TOKEN>` with your BolideAI key (can be generated at [here](https://bolide.ai/settings/api-keys))

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
        "BOLIDEAI_MCP_DEBUG": "true",
        "BOLIDEAI_API_TOKEN": "<your-api-key-here>"
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

- **`BOLIDEAI_API_TOKEN`** - Required for research tools
- **`BOLIDEAI_API_URL`** - Optional, defaults to https://bolide.ai/api

### Tool Configuration

- **`BOLIDEAI_MCP_DEBUG=true`** - Enable diagnostic tools and detailed logging
- **Tool Groups** - Enable specific tool categories (see [Tool Options](TOOL_OPTIONS.md))
- **Individual Tools** - Enable specific tools only (see [Tool Options](TOOL_OPTIONS.md))

## Available Tools

BolideAI MCP provides **20+ tools** across 6 categories:

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

BolideAI MCP provides comprehensive Linear integration for project management and issue tracking. Connect to your Linear workspace through Composio authentication.

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
    "BOLIDEAI_MCP_GROUP_RESEARCH": "true",
    "BOLIDEAI_MCP_GROUP_CONTENT_GENERATORS": "true",
    "BOLIDEAI_API_TOKEN": "your-api-key"
  }
}
```

### Available Tool Groups

- `BOLIDEAI_MCP_GROUP_LAUNCH` - Launch and utility tools
- `BOLIDEAI_MCP_GROUP_SCAFFOLDING` - Project scaffolding tools
- `BOLIDEAI_MCP_GROUP_CONTENT_GENERATORS` - Content generation tools
- `BOLIDEAI_MCP_GROUP_RESEARCH` - Research and information gathering tools
- `BOLIDEAI_MCP_GROUP_DIAGNOSTICS` - Diagnostic tools

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
    "BOLIDEAI_MCP_DEBUG": "true"
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

**BolideAI MCP** - Streamline your marketing automation and research workflows with AI-powered tools. 