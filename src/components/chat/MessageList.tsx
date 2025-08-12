'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { formatTime, copyToClipboard } from '@/lib/utils';
import { useChatStore } from '@/lib/store';
import { Copy, Check, User, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

interface MessageListProps {
  messages: Message[];
}

// Enhanced markdown parser for Gemini responses
const parseMarkdown = (text: string) => {
  if (!text) return '';
  
  return text
    // Code blocks (triple backticks)
    .replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="bold-text">$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em class="italic-text">$1</em>')
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="header-3">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="header-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="header-1">$1</h1>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="blockquote">$1</blockquote>')
    // Unordered lists
    .replace(/^\- (.*$)/gm, '<li class="list-item">$1</li>')
    // @ts-ignore
    .replace(/(<li class="list-item">.*<\/li>)/gs, '<ul class="unordered-list">$1</ul>')
    // Numbered lists
    .replace(/^\d+\. (.*$)/gm, '<li class="numbered-item">$1</li>')
    // @ts-ignore
    .replace(/(<li class="numbered-item">.*<\/li>)/gs, '<ol class="ordered-list">$1</ol>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="link" target="_blank" rel="noopener noreferrer">$1</a>')
    // Line breaks - preserve double line breaks as paragraphs
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
};

export default function MessageList({ messages }: MessageListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { streamingMessageId } = useChatStore();

  const handleCopy = async (message: Message) => {
    try {
      await copyToClipboard(message.content);
      setCopiedId(message.id);
      toast.success('Message copied to clipboard');
      
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  return (
    <div className="space-y-6">
      {messages.map((message) => {
        const isStreaming = streamingMessageId === message.id;
        const formattedContent = message.isUser 
          ? message.content.replace(/\n/g, '<br/>') 
          : parseMarkdown(message.content);

        return (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`group relative max-w-xs sm:max-w-md lg:max-w-2xl xl:max-w-3xl`}>
              {/* Avatar and header */}
              <div className="flex items-start space-x-3 mb-2">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isUser 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                    : 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white'
                }`}>
                  {message.isUser ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-foreground">
                    {message.isUser ? 'You' : 'Gemini AI'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.timestamp)}
                  </span>
                  {isStreaming && (
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-xs text-green-600">generating...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message bubble */}
              <div className={`${
                message.isUser
                  ? 'bg-primary text-primary-foreground ml-11'
                  : 'bg-muted text-foreground ml-11'
              } rounded-2xl px-4 py-3 shadow-sm relative`}>
                
                {/* Image if present */}
                {message.image && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <img
                      src={message.image}
                      alt="Uploaded image"
                      className="max-w-full h-auto rounded-lg border border-border"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                  </div>
                )}
                
                {/* Message content */}
                <div className="prose prose-sm max-w-none">
                  {message.isUser ? (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words m-0">
                      {message.content}
                    </div>
                  ) : (
                    <div 
                      className={`message-content text-sm leading-relaxed ${isStreaming ? 'streaming' : ''}`}
                      dangerouslySetInnerHTML={{ 
                        __html: formattedContent + (isStreaming ? '<span class="cursor">▊</span>' : '')
                      }}
                    />
                  )}
                </div>

                {/* Copy button */}
                {message.content && (
                  <button
                    onClick={() => handleCopy(message)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-full p-1.5 shadow-sm hover:bg-accent text-foreground"
                    title="Copy message"
                  >
                    {copiedId === message.id ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .message-content {
          line-height: 1.7;
        }
        
        .message-content .bold-text {
          font-weight: 600;
          color: hsl(var(--primary));
        }
        
        .message-content .italic-text {
          font-style: italic;
          opacity: 0.8;
        }
        
        .message-content .header-1 {
          font-size: 1.25rem;
          font-weight: 700;
          color: hsl(var(--foreground));
          margin: 1rem 0 0.5rem 0;
          border-bottom: 2px solid hsl(var(--border));
          padding-bottom: 0.25rem;
        }
        
        .message-content .header-2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          margin: 0.875rem 0 0.375rem 0;
        }
        
        .message-content .header-3 {
          font-size: 1rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          margin: 0.75rem 0 0.25rem 0;
        }
        
        .message-content .blockquote {
          border-left: 4px solid hsl(var(--primary));
          background: hsl(var(--muted));
          padding: 0.75rem 1rem;
          margin: 0.75rem 0;
          border-radius: 0.5rem;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        
        .message-content .inline-code {
          background: hsl(var(--muted));
          color: hsl(var(--primary));
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
          font-size: 0.875em;
          border: 1px solid hsl(var(--border));
        }
        
        .message-content .code-block {
          background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%);
          border: 1px solid hsl(var(--border));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 0.75rem 0;
        }
        
        .message-content .code-block code {
          font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          color: hsl(var(--foreground));
        }
        
        .message-content .unordered-list,
        .message-content .ordered-list {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        
        .message-content .list-item,
        .message-content .numbered-item {
          margin: 0.25rem 0;
          color: hsl(var(--foreground));
        }
        
        .message-content .list-item::marker,
        .message-content .numbered-item::marker {
          color: hsl(var(--primary));
        }
        
        .message-content .link {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-decoration-color: hsla(var(--primary), 0.4);
          text-underline-offset: 2px;
          transition: all 0.2s ease;
        }
        
        .message-content .link:hover {
          text-decoration-color: hsl(var(--primary));
          opacity: 0.8;
        }
        
        .cursor {
          color: hsl(var(--primary));
          animation: blink 1s infinite;
          font-weight: bold;
          margin-left: 2px;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        /* Better spacing for paragraphs */
        .message-content br + br {
          display: block;
          margin: 0.5rem 0;
        }
        
        /* Remove default prose margins */
        .message-content p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}