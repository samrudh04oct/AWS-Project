import React from 'react';
import { Bot, RefreshCw, Sparkles } from 'lucide-react';

interface HeaderProps {
  onClearChat?: () => void;
  messageCount?: number;
  serverStatus?: 'checking' | 'connected' | 'disconnected';
}

export const Header: React.FC<HeaderProps> = ({
  onClearChat,
  messageCount = 0,
  serverStatus = 'connected',
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 py-3.5 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-semibold text-slate-100 text-base md:text-lg tracking-tight">
                Long-Term Memory Assistant
              </h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                Phase 1 • AI Chat
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>Foundation Architecture</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-amber-400/90 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Session Context Only (No Long-Term Memory in Phase 1)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Health indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-850 px-2.5 py-1 rounded-md border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === 'connected'
                  ? 'bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse'
                  : serverStatus === 'disconnected'
                  ? 'bg-rose-500 ring-2 ring-rose-500/20'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="capitalize">{serverStatus}</span>
          </div>

          {/* Clear chat button */}
          {messageCount > 0 && (
            <button
              onClick={onClearChat}
              title="Clear current session chat"
              className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-slate-200 bg-slate-850 hover:bg-slate-800 px-2.5 py-1.5 rounded-md border border-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Chat</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

