import { Router, Request, Response } from 'express';
import { bedrockService } from '../services/bedrock';
import { ChatRequest, ChatResponse, ErrorResponse, HealthResponse, ChatMessage } from '../types/chat';

export const chatRouter = Router();

/**
 * GET /api/health
 * Health check endpoint for verifying service availability.
 */
chatRouter.get('/health', (_req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * POST /api/chat
 * Handles user chat input and forwards conversation to Bedrock.
 */
chatRouter.post('/chat', async (req: Request<unknown, unknown, ChatRequest>, res: Response<ChatResponse | ErrorResponse>) => {
  const { message, messages } = req.body;

  // Validate presence of input
  if (!message && (!messages || !Array.isArray(messages))) {
    return res.status(400).json({
      error: 'Message cannot be empty',
    });
  }

  // Handle single message payload
  if (typeof message === 'string') {
    const trimmed = message.trim();
    if (!trimmed) {
      return res.status(400).json({
        error: 'Message cannot be empty',
      });
    }

    try {
      const reply = await bedrockService.generateResponse(trimmed);
      return res.status(200).json({ message: reply });
    } catch {
      return res.status(500).json({
        error: 'Unable to generate a response. Please try again.',
      });
    }
  }

  // Handle conversation history payload
  if (Array.isArray(messages)) {
    if (messages.length === 0) {
      return res.status(400).json({
        error: 'Message cannot be empty',
      });
    }

    // Validate structure of messages array
    const isValid = messages.every(
      (m: ChatMessage) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    );

    if (!isValid) {
      return res.status(400).json({
        error: 'Message cannot be empty',
      });
    }

    try {
      const reply = await bedrockService.generateResponse(messages);
      return res.status(200).json({ message: reply });
    } catch {
      return res.status(500).json({
        error: 'Unable to generate a response. Please try again.',
      });
    }
  }

  return res.status(400).json({
    error: 'Message cannot be empty',
  });
});
