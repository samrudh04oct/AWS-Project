import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { Message } from './types/chat';

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Verify backend health on mount
  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          if (isMounted) setServerStatus('connected');
        } else {
          if (isMounted) setServerStatus('disconnected');
        }
      } catch {
        if (isMounted) setServerStatus('disconnected');
      }
    };

    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      // 1. Create and append user message
      const userMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'user',
        content: trimmed,
        timestamp: formatTimestamp(),
      };

      const updatedHistory = [...messages, userMessage];
      setMessages(updatedHistory);
      setIsLoading(true);
      setError(null);

      // 2. Prepare payload including in-session conversation context
      const payloadMessages = updatedHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: payloadMessages,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data?.error || 'Unable to generate a response. Please try again.';
          setError(errorMessage);
          setServerStatus('disconnected');
          return;
        }

        // 3. Append assistant response
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: 'assistant',
          content: data.message || '',
          timestamp: formatTimestamp(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setServerStatus('connected');
      } catch (err: unknown) {
        console.error('Network or chat API error:', err);
        setError('Unable to reach the backend server. Please check that the server is running.');
        setServerStatus('disconnected');
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <Header
        onClearChat={handleClearChat}
        messageCount={messages.length}
        serverStatus={serverStatus}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSelectPrompt={handleSendMessage}
          onDismissError={() => setError(null)}
        />
      </main>

      {/* Bottom Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={serverStatus === 'disconnected' && messages.length === 0}
      />
    </div>
  );
}

export default App;
