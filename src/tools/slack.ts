import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTool, createTextContent } from './common.js';
import { ComposioService } from '../services/composioService.js';

const SlackFetchConversationHistorySchema = z.object({
  channel: z.string().describe('The ID of the public channel, private channel, direct message, or multi-person direct message to fetch history from.'),
  cursor: z.string().optional().describe('Pagination cursor from `next_cursor` of a previous response to fetch subsequent pages. See Slack\'s pagination documentation for details.'),
  inclusive: z.boolean().optional().describe('Include messages with `latest` or `oldest` timestamps in the results; applies only when `latest` or `oldest` is specified.'),
  latest: z.string().optional().describe('End of the time range of messages to include in results. Accepts a Unix timestamp or a Slack timestamp (e.g., \'1234567890.000000\').'),
  limit: z.number().int().optional().describe('Maximum number of messages to return per page (1-1000). Fewer may be returned if at the end of history or channel has fewer messages.'),
  oldest: z.string().optional().describe('Start of the time range of messages to include in results. Accepts a Unix timestamp or a Slack timestamp (e.g., \'1234567890.000000\').'),
});

const SlackListAllSlackTeamChannelsWithVariousFiltersSchema = z.object({
  channel_name: z.string().optional().describe('Filter channels by name (case-insensitive partial match). If provided, only channels whose names contain this string will be returned.'),
  cursor: z.string().optional().describe('Pagination cursor (from a previous response\'s `next_cursor`) for the next page of results. Omit for the first page.'),
  exclude_archived: z.boolean().optional().describe('Excludes archived channels if true. The API defaults to false (archived channels are included).'),
  limit: z.number().int().default(1).describe('Maximum number of channels to return per page (1 to 1000). Fewer channels may be returned than requested. This schema defaults to 1 if omitted.'),
  types: z.string().optional().describe('Comma-separated list of channel types to include: `public_channel`, `private_channel`, `mpim` (multi-person direct message), `im` (direct message). The API defaults to `public_channel` if this parameter is omitted.'),
});

const SlackSearchForMessagesWithQuerySchema = z.object({
  query: z.string().describe('Search query, supporting modifiers like `in:#channel`, `from:@user`, `has::star:`, or `before:YYYY-MM-DD`.'),
  count: z.number().int().default(1).describe('Number of messages to return per page. Maximum value is 100.'),
  highlight: z.boolean().optional().describe('Enable highlighting of search terms in results.'),
  page: z.number().int().optional().describe('Page number of results to return.'),
  sort: z.string().optional().describe('Sort results by `score` (relevance) or `timestamp` (chronological).'),
  sort_dir: z.string().optional().describe('Sort direction: `asc` (ascending) or `desc` (descending).'),
});

const SlackSendsAMessageToASlackChannelSchema = z.object({
  channel: z.string().describe('The ID or name of the channel, private group, or IM channel to send the message to. Can be an encoded ID (e.g., \'C1234567890\' for a public channel, \'G01234567\' for a private channel, \'D01234567\' for a DM) or a public channel name (e.g., \'#general\').'),
  as_user: z.boolean().optional().describe('Post as the authenticated user instead of as a bot. Defaults to `false`. If `true`, `username`, `icon_emoji`, and `icon_url` are ignored. If `false`, the message is posted as a bot, allowing appearance customization.'),
  attachments: z.string().optional().describe('URL-encoded JSON array of message attachments, a legacy method for rich content. See Slack API documentation for structure.'),
  blocks: z.string().optional().describe('URL-encoded JSON array of layout blocks, the preferred way for rich/interactive messages. See Slack API Block Kit docs for structure.'),
  icon_emoji: z.string().optional().describe('Emoji for bot\'s icon (e.g., \':robot_face:\'). Overrides `icon_url`. Applies if `as_user` is `false`.'),
  icon_url: z.string().optional().describe('Image URL for bot\'s icon (must be HTTPS). Applies if `as_user` is `false`.'),
  link_names: z.boolean().optional().describe('Automatically hyperlink channel names (e.g., #channel) and usernames (e.g., @user) in message text. Defaults to `false` for bot messages.'),
  mrkdwn: z.boolean().optional().describe('Disable Slack\'s markdown for `text` field if `false`. Default `true` (allows *bold*, _italic_, etc.).'),
  parse: z.string().optional().describe('Message text parsing behavior. Default `none` (no special parsing). `full` parses as user-typed (links @mentions, #channels). See Slack API docs for details.'),
  reply_broadcast: z.boolean().optional().describe('If `true` for a threaded reply, also posts to main channel. Defaults to `false`.'),
  text: z.string().optional().describe('Message text content. If not provided, `blocks` or `attachments` must be provided.'),
  thread_ts: z.string().optional().describe('Timestamp of parent message to create a thread reply.'),
  unfurl_links: z.boolean().optional().describe('Enable automatic link unfurling.'),
  unfurl_media: z.boolean().optional().describe('Enable automatic media unfurling.'),
  username: z.string().optional().describe('Bot username displayed in messages. Applies if `as_user` is `false`.'),
});

const SlackUpdatesASlackMessageSchema = z.object({
  channel: z.string().describe('The ID of the channel containing the message to be updated.'),
  ts: z.string().describe('Timestamp of the message to update (string, Unix time with microseconds, e.g., \'1234567890.123456\').'),
  as_user: z.string().optional().describe('Set to `\'true\'` to update as the authenticated user (bots are considered such). Defaults to app/bot identity.'),
  attachments: z.string().optional().describe('URL-encoded JSON array of attachments. Replaces existing attachments if field is provided; use `[]` (empty array string) to clear. Omit field to leave attachments untouched. Required if `text` and `blocks` are absent. See Slack API for format.'),
  blocks: z.string().optional().describe('URL-encoded JSON array of layout blocks. Replaces existing blocks if field is provided; use `[]` (empty array string) to clear. Omit field to leave blocks untouched. Required if `text` and `attachments` are absent. See Slack API for format.'),
  link_names: z.string().optional().describe('Set to `\'true\'` to link channel/user names in `text`. If not provided, Slack\'s default update behavior may override original message\'s linking settings.'),
  parse: z.string().optional().describe('Parse mode for `text`: `\'full\'` (mrkdwn) or `\'none\'` (literal). If not provided, defaults to `\'client\'` behavior, overriding original message\'s `parse` setting.'),
  text: z.string().optional().describe('New message text (plain or mrkdwn). Not required if `blocks` or `attachments` are provided. See Slack formatting rules.'),
});

type SlackFetchConversationHistoryParams = z.infer<typeof SlackFetchConversationHistorySchema>;
type SlackListAllSlackTeamChannelsWithVariousFiltersParams = z.infer<typeof SlackListAllSlackTeamChannelsWithVariousFiltersSchema>;
type SlackSearchForMessagesWithQueryParams = z.infer<typeof SlackSearchForMessagesWithQuerySchema>;
type SlackSendsAMessageToASlackChannelParams = z.infer<typeof SlackSendsAMessageToASlackChannelSchema>;
type SlackUpdatesASlackMessageParams = z.infer<typeof SlackUpdatesASlackMessageSchema>;

export function registerSlackFetchConversationHistoryTool(server: McpServer): void {
  registerTool<SlackFetchConversationHistoryParams>(
    server,
    'slack_fetch_conversation_history',
    'Fetches a chronological list of messages and events from a specified slack conversation, accessible by the authenticated user/bot, with options for pagination and time range filtering.',
    SlackFetchConversationHistorySchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'SLACK_FETCH_CONVERSATION_HISTORY',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Slack tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Slack fetchConversationHistory tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerSlackListAllSlackTeamChannelsWithVariousFiltersTool(server: McpServer): void {
  registerTool<SlackListAllSlackTeamChannelsWithVariousFiltersParams>(
    server,
    'slack_list_all_slack_team_channels',
    'Retrieves public channels, private channels, multi-person direct messages (mpims), and direct messages (ims) from a slack workspace, with options to filter by type and exclude archived channels.',
    SlackListAllSlackTeamChannelsWithVariousFiltersSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'SLACK_LIST_ALL_SLACK_TEAM_CHANNELS_WITH_VARIOUS_FILTERS',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Slack tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Slack listAllSlackTeamChannelsWithVariousFilters tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerSlackSearchForMessagesWithQueryTool(server: McpServer): void {
  registerTool<SlackSearchForMessagesWithQueryParams>(
    server,
    'slack_search_for_messages_with_query',
    'Searches messages in a slack workspace using a query with optional modifiers (e.g., `in:`, `from:`, `has:`, `before:`) across accessible channels, dms, and private groups.',
    SlackSearchForMessagesWithQuerySchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'SLACK_SEARCH_FOR_MESSAGES_WITH_QUERY',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Slack tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Slack searchForMessagesWithQuery tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerSlackSendsAMessageToASlackChannelTool(server: McpServer): void {
  registerTool<SlackSendsAMessageToASlackChannelParams>(
    server,
    'slack_sends_a_message_to_a_slack_channel',
    'Posts a message to a slack channel, direct message, or private group; requires content via `text`, `blocks`, or `attachments`.',
    SlackSendsAMessageToASlackChannelSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Slack tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Slack sendsAMessageToASlackChannel tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerSlackUpdatesASlackMessageTool(server: McpServer): void {
  registerTool<SlackUpdatesASlackMessageParams>(
    server,
    'slack_updates_a_slack_message',
    'Updates a slack message, identified by `channel` id and `ts` timestamp, by modifying its `text`, `attachments`, or `blocks`; provide at least one content field, noting `attachments`/`blocks` are replaced if included (`[]` clears them).',
    SlackUpdatesASlackMessageSchema.shape,
    async (params) => {
      try {
        const response = await ComposioService.callTool({
          toolName: 'SLACK_UPDATES_A_SLACK_MESSAGE',
          parameters: params
        });

        if (response.success) {
          return {
            content: [createTextContent(JSON.stringify(response.result, null, 2))],
            isError: false
          };
        } else {
          return {
            content: [createTextContent(`Error calling Slack tool: ${response.error}${response.details ? `\nDetails: ${response.details}` : ''}`)],
            isError: true
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [createTextContent(`Error calling Slack updatesASlackMessage tool: ${errorMessage}`)],
          isError: true
        };
      }
    },
  );
}

export function registerSlackTools(server: McpServer): void {
  registerSlackFetchConversationHistoryTool(server);
  registerSlackListAllSlackTeamChannelsWithVariousFiltersTool(server);
  registerSlackSearchForMessagesWithQueryTool(server);
  registerSlackSendsAMessageToASlackChannelTool(server);
  registerSlackUpdatesASlackMessageTool(server);
}