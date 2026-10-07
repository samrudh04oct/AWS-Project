import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex items-start gap-3 w-full my-3.5 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-medium border ${
          isUser
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
            : 'bg-slate-800 text-indigo-400 border-slate-700 shadow-sm'
        }`}
        aria-label={isUser ? 'User Avatar' : 'Assistant Avatar'}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div
        className={`flex flex-col max-w-[85%] md:max-w-[75%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-sm shadow-sm'
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <span className="text-[11px] text-slate-500 mt-1 px-1 select-none">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};

