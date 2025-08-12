'use client';

import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-4 py-3 shadow-sm max-w-xs">
        <div className="flex items-center space-x-2 mb-1">
          <Bot className="h-3 w-3" />
          <span className="text-xs font-medium opacity-75">Gemini</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">is typing</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-current rounded-full opacity-60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-current rounded-full opacity-60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}