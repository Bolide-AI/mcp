# Contributing

Contributions are welcome! Here's how you can help improve BolideAIMCP.

## Local development setup

### Prerequisites

In addition to the prerequisites mentioned in the [Getting started](README.md/#getting-started) section of the README, you will also need:

- Node.js (v18 or later)
- npm

#### Optional: Enabling UI Automation

When running locally, you'll need to install AXe for UI automation:

```bash
# Install axe (required for UI automation)
brew tap cameroncooke/axe
brew install axe
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```
4. Start the server:
   ```
   node build/index.js
   ```

### Configure your MCP client

To configure your MCP client to use your local BolideAIMCP server you can use the following configuration:

```json
{
  "mcpServers": {
    "BolideAIMCP": {
      "command": "node",
      "args": [
        "/path_to/BolideAIMCP/build/index.js"
      ]
    }
  }
}
```

### Developing using VS Code

VS Code is especially good for developing BolideAIMCP as it has a built-in way to view MCP client/server logs as well as the ability to configure MCP servers at a project level. It probably has the most comprehensive support for MCP development. 

To make your development workflow in VS Code more efficient:

1.  **Start the MCP Server**: Open the `.vscode/mcp.json` file. You can start the `BolideAI-dev` server either by clicking the `Start` CodeLens that appears above the server definition, or by opening the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`), running `Mcp: List Servers`, selecting `BolideAI-dev`, and starting the server.
2.  **Launch the Debugger**: Press `F5` to attach the Node.js debugger.

Once these steps are completed, you can utilize the tools from the MCP server you are developing within this repository in agent mode.
For more details on how to work with MCP servers in VS Code see: https://code.visualstudio.com/docs/copilot/chat/mcp-servers

### Debugging

You can use MCP Inspector via:

```bash
npm run inspect
```

or if you prefer the explicit command:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

#### Using the diagnostic tool

Running the BolideAIMCP server with the environmental variable `BOLIDEAI_MCP_DEBUG=true` will expose a new diagnostic tool which you can run using MCP Inspector:


```bash
BOLIDEAI_MCP_DEBUG=true npm run inspect
```

Alternatively, you can run the diagnostic tool directly:

```bash
node build/diagnostic-cli.js
```

## Making changes

1. Fork the repository and create a new branch
2. Follow the TypeScript best practices and existing code style
3. Add proper parameter validation and error handling

### Working with Marketing Projects

BolideAIMCP provides tools for marketing automation and content generation. The main workflow involves:

1. **Project scaffolding** - Create marketing directory structures
2. **Artifact management** - Organize screenshots, videos, and posts
3. **Content generation** - Use AI to analyze content and generate posts
4. **Research tools** - Gather information using Perplexity and OpenAI

#### Marketing Project Structure

When you scaffold a marketing project, BolideAIMCP creates:

```
marketing/
├── artifacts/          # Intermediate materials (screenshots, videos)
│   └── feature-name-timestamp/
│       ├── screenshots/
│       ├── videos/
│       └── posts/
└── assets/            # Final materials
    ├── posts/         # Social media posts and content
    └── research/      # Research results and findings
```

## Testing

1. Build the project with `npm run build`
2. Test your changes with MCP Inspector
3. Verify tools work correctly with different MCP clients

## Submitting

1. Run `npm run lint` to check for linting issues (use `npm run lint:fix` to auto-fix)
2. Run `npm run format:check` to verify formatting (use `npm run format` to fix)
3. Update documentation if you've added or modified features
4. Add your changes to the CHANGELOG.md file
5. Push your changes and create a pull request with a clear description
6. Link any related issues

For major changes or new features, please open an issue first to discuss your proposed changes.

## Code of Conduct

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) and community guidelines.
