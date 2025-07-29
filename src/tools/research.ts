/**
 * Research Tools - Tools for performing research and information gathering
 *
 * This module provides research capabilities using external APIs like Perplexity
 * to gather information and answer questions.
 *
 * Responsibilities:
 * - Integrating with Perplexity API for search and research
 * - Handling API authentication and error responses
 * - Formatting research results for consumption
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolResponse } from '../types/common.js';
import { log } from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';
import { registerTool, createTextContent } from './common.js';
import { BOLIDEAI_API_URL } from '../utils/constants.js';

const UsePerplexitySchema = z.object({
    query: z.string().describe('The search query or question to research'),
    search_mode: z.enum(['web', 'academic']).describe(`Controls the search mode used for the request. When set to 'academic', results will prioritize scholarly sources like peer-reviewed papers and academic journals. (default: web)`),
});

const UseOpenAIDeepResearchSchema = z.object({
    query: z.string().describe('The research query or question to investigate deeply'),
});

type UsePerplexityParams = z.infer<typeof UsePerplexitySchema>;
type UseOpenAIDeepResearchParams = z.infer<typeof UseOpenAIDeepResearchSchema>;

/**
 * Use Perplexity API to perform search on a given query
 * @param params Parameters for the Perplexity search
 * @returns Search results from Perplexity
 */
async function usePerplexity(params: UsePerplexityParams): Promise<ToolResponse> {
    const { query, search_mode } = params;

    log('info', `Performing (${search_mode}) search with Perplexity via web API on query: "${query}"`);

    try {
        const webApiUrl = process.env.BOLIDEAI_API_URL || BOLIDEAI_API_URL;
        const authToken = process.env.BOLIDEAI_API_TOKEN;

        if (!authToken) {
            throw new ValidationError('BOLIDEAI_API_TOKEN environment variable is required for Perplexity search via web API');
        }

        const response = await fetch(`${webApiUrl}/tools/perplexity-search`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query,
                search_mode,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            log('error', `Web API error: ${response.status} ${response.statusText} - ${errorText}`);

            if (response.status === 401) {
                throw new ValidationError('Authentication failed. Please check your BOLIDEAI_API_TOKEN.');
            } else if (response.status === 422) {
                throw new ValidationError('Request validation failed. Please check the query and search_mode parameters.');
            } else if (response.status === 429) {
                throw new ValidationError('Rate limit exceeded. Please try again later.');
            } else {
                throw new ValidationError(`Failed to perform search via web API: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();

        if (!data.success) {
            throw new ValidationError(`Perplexity search failed: ${data.error || 'Unknown error'}`);
        }

        const result = data.result;
        const usage = data.usage;
        const model = data.model;
        const citations = data.citations || [];

        log('info', `Search completed successfully via web API. Response length: ${result.length} characters`);

        if (usage) {
            log(
                'info',
                `Token usage - Prompt: ${usage.prompt_tokens}, Completion: ${usage.completion_tokens}, Total: ${usage.total_tokens}`,
            );
        }

        // Format the response with metadata
        const formattedResponse = [
            `# Search Results for: "${query}"`,
            '',
            result,
            '',
            '---',
            '## Citations',
            citations.join('\n'),
            '',
            '---',
            `*Search powered by Perplexity AI (${model}) via Web API*`,
        ].join('\n');

        return {
            success: true,
            message: 'Successfully performed search with Perplexity via web API',
            content: [createTextContent(formattedResponse)],
            nextSteps: [
                `Display the search results with citations. IMPORTANT: IF CITATIONS ARE PROVIDED, DISPLAY THEM IN THE RESPONSE.`,
                `Create a research asset file. Example: create_research_asset({ name: "FILE_NAME", content: "RESEARCH_CONTENT" })`,
            ],
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log('error', `Perplexity search via web API failed: ${errorMessage}`);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error occurred',
                        },
                        null,
                        2,
                    ),
                },
            ],
        };
    }
}

async function useOpenAIDeepResearch(params: UseOpenAIDeepResearchParams): Promise<ToolResponse> {
    const { query } = params;

    log('info', `Performing deep research with OpenAI o4-mini-deep-research via web API on query: "${query}"`);

    try {
        const webApiUrl = process.env.BOLIDEAI_API_URL || BOLIDEAI_API_URL;
        const authToken = process.env.BOLIDEAI_API_TOKEN;

        if (!authToken) {
            throw new ValidationError('BOLIDEAI_API_TOKEN environment variable is required for OpenAI deep research via web API');
        }

        const response = await fetch(`${webApiUrl}/tools/openai-deep-research`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            log('error', `Web API error: ${response.status} ${response.statusText} - ${errorText}`);

            if (response.status === 401) {
                throw new ValidationError('Authentication failed. Please check your BOLIDEAI_API_TOKEN.');
            } else if (response.status === 422) {
                throw new ValidationError('Request validation failed. Please check the query parameter.');
            } else if (response.status === 429) {
                throw new ValidationError('Rate limit exceeded. Please try again later.');
            } else {
                throw new ValidationError(`Failed to perform deep research via web API: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();

        if (!data.success) {
            throw new ValidationError(`OpenAI deep research failed: ${data.error || 'Unknown error'}`);
        }

        const result = data.result;
        const enrichedQuery = data.enriched_query;
        const model = data.model;

        log('info', `Deep research completed successfully via web API. Response length: ${result.length} characters`);

        const formattedResponse = [
            `# Deep Research Results for: "${query}"`,
            '',
            '## Enriched Research Instructions',
            enrichedQuery,
            '',
            '---',
            '',
            '## Research Findings',
            result,
            '',
            '---',
            `*Deep research powered by OpenAI ${model} via Web API*`,
        ].join('\n');

        return {
            success: true,
            message: 'Successfully performed deep research with OpenAI o4-mini-deep-research via web API',
            content: [createTextContent(formattedResponse)],
            nextSteps: [
                `Create a research asset file. Example: create_research_asset({ name: "FILE_NAME", content: "RESEARCH_CONTENT" })`,
            ],
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log('error', `OpenAI deep research via web API failed: ${errorMessage}`);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error occurred',
                        },
                        null,
                        2,
                    ),
                },
            ],
        };
    }
}

/**
 * Register all research tools with the MCP server
 * @param server The MCP server instance
 */
export function registerResearchTools(server: McpServer): void {
    registerTool(
        server,
        'use_perplexity',
        'Perform search and information gathering using Perplexity AI via web API. IMPORTANT: You MUST provide the query and search_mode parameters as well as display the citations in the response, if provided. Example: use_perplexity({ query: "What is the capital of France?", search_mode: "web" })',
        UsePerplexitySchema.shape,
        usePerplexity,
    );

    registerTool(
        server,
        'use_openai_deep_research',
        'Perform deep research using OpenAI o4-mini-deep-research model via web API. First enriches the query with detailed research instructions using GPT-4.1, then conducts comprehensive research. Requires BOLIDEAI_API_TOKEN for authentication. IMPORTANT: You MUST provide the query parameter. Example: use_openai_deep_research({ query: "Economic impact of renewable energy adoption" })',
        UseOpenAIDeepResearchSchema.shape,
        useOpenAIDeepResearch,
    );

    log('info', 'Research tools registered successfully');
}
