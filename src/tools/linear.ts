import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool, createTextContent } from './common.js';
import { ComposioService } from '../services/composioService.js';

// Zod schemas for Linear tools based on linear.json

const LinearCreateIssueSchema = z.object({
  project_id: z.string().describe('Identifier of the project to which this issue will be associated.'),
  team_id: z.string().describe('Identifier of the team responsible for this issue.'),
  title: z.string().describe('The title of the new issue.'),
  description: z.string().describe('A detailed description of the issue, which can include markdown formatting.'),
  assignee_id: z.string().optional().describe('Identifier of the user to assign to this issue.'),
  cycle_id: z.string().optional().describe('Identifier of the cycle (sprint) to assign this issue to. Cycles are time-bound periods used to organize and prioritize work. Only applicable if the team has cycles feature enabled.'),
  due_date: z.string().optional().describe('The target completion date for the issue, formatted as \'YYYY,MM,DD,hh,mm,ss\'. For example: \'2024,10,27,12,58,00\'.'),
  estimate: z.number().int().default(0).describe('The estimated complexity or effort for the issue, represented as a numerical point value (e.g., 1, 2, 3, 5, 8). The specific scale used (e.g., Fibonacci, Linear, T-shirt sizes mapped to numbers) is defined by the team\'s settings. This field only applies if the estimates feature is enabled for the team. A value of 0 typically means no estimate has been set.'),
  label_ids: z.array(z.string()).default([]).describe('A list of identifiers for labels to be added to this issue.'),
  parent_id: z.string().optional().describe('Identifier of an existing issue to set as the parent of this new issue, creating a sub-issue relationship.'),
  priority: z.number().int().min(0).max(4).default(0).describe('Priority of the issue. 0 (No), 1 (Urgent), 2 (High), 3 (Normal), 4 (Low).'),
  state_id: z.string().optional().describe('Identifier of the workflow state to assign to the issue (e.g., backlog, to do, in progress, done).'),
});

const LinearUpdateIssueSchema = z.object({
  issue_id: z.string().describe('Identifier of the issue to update.'),
  assignee_id: z.string().optional().describe('Identifier of the user to assign to the issue.'),
  description: z.string().optional().describe('New Markdown description for the issue.'),
  due_date: z.string().optional().describe('New due date in \'YYYY,MM,DD,hh,mm,ss\' format (e.g., \'2024,10,27,12,58,00\').'),
  estimate: z.number().int().optional().describe('New time estimate in minutes.'),
  label_ids: z.array(z.string()).optional().describe('List of label identifiers to set; replaces all existing labels. An empty list removes all labels.'),
  parent_id: z.string().optional().describe('Identifier of an existing issue to set as parent.'),
  priority: z.number().int().min(0).max(4).optional().describe('Priority: 0 (No), 1 (Urgent), 2 (High), 3 (Normal), 4 (Low).'),
  project_id: z.string().optional().describe('Identifier of the project to associate with the issue.'),
  state_id: z.string().optional().describe('Identifier of the new state (e.g., To Do, In Progress, Done).'),
  team_id: z.string().optional().describe('Identifier of the team to associate with the issue.'),
  title: z.string().optional().describe('New title for the issue.'),
});

const LinearCreateCommentSchema = z.object({
  issue_id: z.string().describe('Identifier of the existing Linear issue for the comment.'),
  body: z.string().describe('Non-empty comment content, in plain text or Markdown.'),
});

const LinearListIssuesSchema = z.object({
  after: z.string().optional().describe('Cursor for pagination. Use the `endCursor` from the previous response\'s `page_info` to fetch the next set of issues.'),
  assignee_id: z.string().optional().describe('ID of the user to filter issues by assignee. If provided, only issues assigned to this user will be returned.'),
  first: z.number().int().min(1).max(250).default(10).describe('Number of issues to return.'),
  project_id: z.string().optional().describe('ID of the project to filter issues by. If provided, only issues belonging to this project will be returned.'),
});

const LinearListCyclesSchema = z.object({
  // No parameters required for listing all cycles
});

const LinearGetCyclesByTeamIdSchema = z.object({
  team_id: z.string().describe('The team\'s unique identifier.'),
});

const LinearListStatesSchema = z.object({
  team_id: z.string().describe('Unique identifier of the team.'),
});

const LinearListTeamsSchema = z.object({
  project_id: z.string().describe('The unique identifier of a project. This ID is used to filter the list of projects associated with each retrieved team. If a team is not associated with this project ID, its \'projects\' list in the response will be empty.'),
});

const LinearListProjectsSchema = z.object({
  // No parameters required for listing all projects
});

const LinearListUsersSchema = z.object({
  after: z.string().optional().describe('Cursor for pagination. Use the `endCursor` from the previous response\'s `page_info` to fetch the next set of users.'),
  first: z.number().int().min(1).max(250).default(50).describe('Number of users to return.'),
});

// Type inference for parameters
type LinearCreateIssueParams = z.infer<typeof LinearCreateIssueSchema>;
type LinearUpdateIssueParams = z.infer<typeof LinearUpdateIssueSchema>;
type LinearCreateCommentParams = z.infer<typeof LinearCreateCommentSchema>;
type LinearListIssuesParams = z.infer<typeof LinearListIssuesSchema>;
type LinearListCyclesParams = z.infer<typeof LinearListCyclesSchema>;
type LinearGetCyclesByTeamIdParams = z.infer<typeof LinearGetCyclesByTeamIdSchema>;
type LinearListStatesParams = z.infer<typeof LinearListStatesSchema>;
type LinearListTeamsParams = z.infer<typeof LinearListTeamsSchema>;
type LinearListProjectsParams = z.infer<typeof LinearListProjectsSchema>;
type LinearListUsersParams = z.infer<typeof LinearListUsersSchema>;

// Tool registration functions

export function registerLinearCreateIssueTool(server: McpServer): void {
  registerTool<LinearCreateIssueParams>(
    server,
    'linear_create_issue',
    'Creates a new issue in a specified linear project and team, requiring a title and description, and allowing for optional properties like assignee, state, priority, cycle, and due date.',
    LinearCreateIssueSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'LINEAR_CREATE_LINEAR_ISSUE',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Linear tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Linear createIssue tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerLinearUpdateIssueTool(server: McpServer): void {
  registerTool<LinearUpdateIssueParams>(
    server,
    'linear_update_issue',
    'Updates an existing linear issue using its `issue id`; requires at least one other attribute for modification, and all provided entity ids (for state, assignee, labels, etc.) must be valid.',
    LinearUpdateIssueSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'LINEAR_UPDATE_ISSUE',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Linear tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Linear updateIssue tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerLinearCreateCommentTool(server: McpServer): void {
  registerTool<LinearCreateCommentParams>(
    server,
    'linear_create_comment',
    'Creates a new comment on a specified linear issue.',
    LinearCreateCommentSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'LINEAR_CREATE_LINEAR_COMMENT',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Linear tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Linear createComment tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerLinearListIssuesTool(server: McpServer): void {
  registerTool<LinearListIssuesParams>(
    server,
    'linear_list_issues',
    'Lists non-archived linear issues; if project id is not specified, issues from all accessible projects are returned. can also filter by assignee id to get issues assigned to a specific user.',
    LinearListIssuesSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'LINEAR_LIST_LINEAR_ISSUES',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Linear tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Linear listIssues tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerLinearListCyclesTool(server: McpServer): void {
  registerTool<LinearListCyclesParams>(
    server,
    'linear_list_cycles',
    'Retrieves all cycles (time-boxed iterations for work) from the linear account; no filters are applied.',
    LinearListCyclesSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'LINEAR_LIST_LINEAR_CYCLES',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Linear tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Linear listCycles tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerLinearGetCyclesByTeamIdTool(server: McpServer): void {
  registerTool<LinearGetCyclesByTeamIdParams>(
    server,
    'linear_get_cycles_by_team_id',
    'Retrieves all cycles for a specified linear team id; cycles are time-boxed work periods (like sprints) and the team id must correspond to an existing team.',
    LinearGetCyclesByTeamIdSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'LINEAR_GET_CYCLES_BY_TEAM_ID',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Linear tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Linear getCyclesByTeamId tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerLinearListStatesTool(server: McpServer): void {
  registerTool<LinearListStatesParams>(
    server,
    'linear_list_states',
    'Retrieves all workflow states for a specified team in linear, representing the stages an issue progresses through in that team\'s workflow.',
    LinearListStatesSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'LINEAR_LIST_LINEAR_STATES',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Linear tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Linear listStates tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerLinearListTeamsTool(server: McpServer): void {
  registerTool<LinearListTeamsParams>(
    server,
    'linear_list_teams',
    'Retrieves all teams, including their members, and filters each team\'s associated projects by the provided project id.',
    LinearListTeamsSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'LINEAR_LIST_LINEAR_TEAMS',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Linear tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Linear listTeams tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerLinearListProjectsTool(server: McpServer): void {
  registerTool<LinearListProjectsParams>(
    server,
    'linear_list_projects',
    'Retrieves all projects from the linear account.',
    LinearListProjectsSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'LINEAR_LIST_LINEAR_PROJECTS',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Linear tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Linear listProjects tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerLinearListUsersTool(server: McpServer): void {
  registerTool<LinearListUsersParams>(
    server,
    'linear_list_users',
    'Lists all users in the linear workspace with their ids, names, emails, and active status.',
    LinearListUsersSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'LINEAR_LIST_LINEAR_USERS',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Linear tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Linear listUsers tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

// Main registration function
export function registerLinearTools(server: McpServer): void {
  registerLinearCreateIssueTool(server);
  registerLinearUpdateIssueTool(server);
  registerLinearCreateCommentTool(server);
  registerLinearListIssuesTool(server);
  registerLinearListCyclesTool(server);
  registerLinearGetCyclesByTeamIdTool(server);
  registerLinearListStatesTool(server);
  registerLinearListTeamsTool(server);
  registerLinearListProjectsTool(server);
  registerLinearListUsersTool(server);
}