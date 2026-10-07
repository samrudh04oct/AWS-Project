import {
  BedrockRuntimeClient,
  ConverseCommand,
  Message as BedrockMessage,
} from '@aws-sdk/client-bedrock-runtime';
import { ChatMessage } from '../types/chat';

export class BedrockService {
  private client: BedrockRuntimeClient;
  private modelId: string;
  private region: string;

  constructor(client?: BedrockRuntimeClient, modelId?: string, region?: string) {
    this.region = region || process.env.AWS_REGION || 'us-east-1';
    this.modelId = modelId || process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';
    // AWS SDK automatically resolves credentials using the standard provider chain
    this.client = client || new BedrockRuntimeClient({ region: this.region });
  }

  /**
   * Generates a conversational AI response via Amazon Bedrock.
   * Supports either a single message string or full conversation history.
   *
   * In future phases, this modular service will integrate:
   * retrieveMemory() -> extractMemory() -> generateResponseWithMemory()
   */
  public async generateResponse(input: string | ChatMessage[]): Promise<string> {
    const messages: ChatMessage[] = typeof input === 'string'
      ? [{ role: 'user', content: input }]
      : input;

    if (!messages || messages.length === 0) {
      throw new Error('Message input cannot be empty');
    }

    // Map internal chat messages to Bedrock Converse format
    const bedrockMessages: BedrockMessage[] = messages.map((m) => ({
      role: m.role,
      content: [{ text: m.content }],
    }));

    try {
      const command = new ConverseCommand({
        modelId: this.modelId,
        messages: bedrockMessages,
        inferenceConfig: {
          maxTokens: 2048,
          temperature: 0.7,
        },
      });

      const response = await this.client.send(command);

      const responseText = response.output?.message?.content?.[0]?.text;

      if (!responseText) {
        throw new Error('Bedrock returned an empty response content');
      }

      return responseText;
    } catch (error: unknown) {
      // Log detailed error context for backend debugging without exposing credentials to client
      const err = error as Error;
      console.error('[BedrockService] Error executing ConverseCommand:', {
        name: err.name,
        message: err.message,
        modelId: this.modelId,
        region: this.region,
      });
      throw error;
    }
  }

  public getModelId(): string {
    return this.modelId;
  }

  public getRegion(): string {
    return this.region;
  }
}

// Export default singleton instance
export const bedrockService = new BedrockService();
