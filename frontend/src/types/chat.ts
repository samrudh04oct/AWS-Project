export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface ChatApiRequest {
  message?: string;
  messages?: Array<{
    role: MessageRole;
    content: string;
  }>;
}

export interface ChatApiResponse {
  message: string;
}

export interface ChatApiError {
  error: string;
}
