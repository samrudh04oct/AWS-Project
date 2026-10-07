import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as content grows up to max-height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed && !isLoading && !disabled) {
      onSendMessage(trimmed);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (unless Shift is pressed for newline)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSendDisabled = !input.trim() || isLoading || disabled;

  return (
    <div className="border-t border-slate-800 bg-slate-900/90 backdrop-blur p-4">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-end gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-2 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all shadow-inner"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isLoading
                ? 'Waiting for AI response...'
                : 'Type your message... (Shift + Enter for newline)'
            }
            disabled={isLoading || disabled}
            className="w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed max-h-44 leading-relaxed"
          />

          <button
            type="submit"
            disabled={isSendDisabled}
            className={`p-2.5 rounded-xl font-medium text-xs flex items-center justify-center transition-all shrink-0 ${
              isSendDisabled
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/20'
            }`}
            title="Send message"
            aria-label="Send message"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 hidden sm:block" />
                <ArrowUp className="w-4 h-4 sm:hidden" />
              </>
            )}
          </button>
        </form>

        <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-slate-500">
          <span>Press Enter to send, Shift + Enter for newline</span>
          <span>Phase 1 • No persistent memory</span>
        </div>
      </div>
    </div>
  );
};

