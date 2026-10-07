import request from 'supertest';
import { app } from '../src/app';
import { bedrockService } from '../src/services/bedrock';

// Mock the BedrockService so tests do not make external AWS calls
jest.mock('../src/services/bedrock', () => ({
  bedrockService: {
    generateResponse: jest.fn(),
    getModelId: jest.fn().mockReturnValue('test-model-id'),
    getRegion: jest.fn().mockReturnValue('us-east-1'),
  },
}));

describe('Backend API - Phase 1 Basic AI Chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return status ok with 200 status code', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /api/chat', () => {
    it('should return 200 and AI response for a valid single message', async () => {
      const mockAiResponse = "Hello! I'm your AI assistant.";
      (bedrockService.generateResponse as jest.Mock).mockResolvedValueOnce(mockAiResponse);

      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello, who are you?' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: mockAiResponse });
      expect(bedrockService.generateResponse).toHaveBeenCalledWith('Hello, who are you?');
    });

    it('should return 200 and AI response for a valid conversation history payload', async () => {
      const mockAiResponse = 'Your name is Alex.';
      (bedrockService.generateResponse as jest.Mock).mockResolvedValueOnce(mockAiResponse);

      const messages = [
        { role: 'user', content: 'My name is Alex.' },
        { role: 'assistant', content: 'Nice to meet you, Alex.' },
        { role: 'user', content: 'What is my name?' },
      ];

      const response = await request(app)
        .post('/api/chat')
        .send({ messages });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: mockAiResponse });
      expect(bedrockService.generateResponse).toHaveBeenCalledWith(messages);
    });

    it('should return 400 when message is empty string', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Message cannot be empty' });
      expect(bedrockService.generateResponse).not.toHaveBeenCalled();
    });

    it('should return 400 when request body is empty object', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Message cannot be empty' });
      expect(bedrockService.generateResponse).not.toHaveBeenCalled();
    });

    it('should return 400 when messages array is empty', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ messages: [] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Message cannot be empty' });
      expect(bedrockService.generateResponse).not.toHaveBeenCalled();
    });

    it('should return 400 when messages array contains invalid items', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ messages: [{ role: 'unknown', content: '' }] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Message cannot be empty' });
      expect(bedrockService.generateResponse).not.toHaveBeenCalled();
    });

    it('should return 500 and safe error message when Bedrock service fails', async () => {
      (bedrockService.generateResponse as jest.Mock).mockRejectedValueOnce(
        new Error('AWS Bedrock connection failed')
      );

      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Explain quantum computing' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Unable to generate a response. Please try again.',
      });
      // Ensure AWS internal error details are not exposed in response body
      expect(response.body).not.toHaveProperty('stack');
    });
  });
});
