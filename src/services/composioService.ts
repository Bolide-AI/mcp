/**
 * Composio Service - Generic tool calling service for Composio integration
 *
 * This service handles communication with the BolideAI web API endpoint
 * for making generic Composio tool calls.
 */

import { log } from '../utils/logger.js';
import { BOLIDEAI_API_URL } from '../utils/constants.js';

interface ComposioToolCallParams {
  toolName: string;
  parameters: Record<string, unknown>;
}

interface ComposioToolResponse {
  success: boolean;
  result?: unknown;
  error?: string;
  details?: string;
  status?: number;
}

export class ComposioService {
  private static readonly DEFAULT_TIMEOUT = 30000;
  private static readonly COMPOSIO_ENDPOINT = '/tools/composio/call-mcp-tool';

  /**
   * Call a generic Composio tool through the BolideAI web API
   */
  static async callTool(params: ComposioToolCallParams): Promise<ComposioToolResponse> {
    const { toolName, parameters } = params;
    
    const webApiUrl = process.env.BOLIDEAI_API_URL || BOLIDEAI_API_URL;
    const authToken = process.env.BOLIDEAI_API_TOKEN;

    if (!authToken) {
      return {
        success: false,
        error: 'BOLIDEAI_API_TOKEN environment variable is required for Composio tool calls'
      };
    }

    try {
      const requestBody = {
        tool_name: toolName,
        parameters: parameters
      };

      log('info', `Making Composio tool call via web API: ${toolName} to ${webApiUrl}${this.COMPOSIO_ENDPOINT}`);

      const response = await this.makeHttpRequest(
        webApiUrl + this.COMPOSIO_ENDPOINT, 
        requestBody, 
        authToken
      );

      if (response.ok) {
        const responseData = await response.json();

        log('info', `Composio tool call successful: ${toolName}`);

        return {
          success: responseData.success ?? true,
          result: responseData.result ?? responseData,
          error: responseData.error
        };
      } else {
        const errorBody = await response.text();
        log('error', `Composio tool call failed: ${toolName} - Status ${response.status}: ${errorBody}`);

        return {
          success: false,
          error: 'Web API request failed',
          details: errorBody,
          status: response.status
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      log('error', `Exception during Composio tool call: ${toolName} - ${errorMessage}`);

      return {
        success: false,
        error: 'Internal error during Composio tool call',
        details: errorMessage
      };
    }
  }

  /**
   * Make HTTP request with proper headers and timeout
   */
  private static async makeHttpRequest(url: string, body: object, authToken: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}