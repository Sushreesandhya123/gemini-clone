'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/lib/store';
import { Chatroom } from '@/types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

interface ChatRoomProps {
  chatroom: Chatroom;
}

export default function ChatRoom({ chatroom }: ChatRoomProps) {
  const { isTyping, loadMoreMessages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatroom.messages, isTyping]);

  const handleScroll = async () => {
    const container = messagesContainerRef.current;
    if (!container || isLoadingMore) return;

    if (container.scrollTop === 0 && chatroom.messages.length > 0) {
      setIsLoadingMore(true);
      const oldScrollHeight = container.scrollHeight;
      
      // Simulate loading delay
      setTimeout(() => {
        loadMoreMessages(chatroom.id);
        
        // Maintain scroll position after loading
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - oldScrollHeight;
          setIsLoadingMore(false);
        }, 100);
      }, 1000);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="text-center py-2">
            <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Loading older messages...</span>
            </div>
          </div>
        )}

        {chatroom.messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3 max-w-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-medium">Start a conversation</h3>
              <div className="text-sm text-muted-foreground">
                Send a message to begin chatting with Gemini AI. I'm here to help with questions, creative tasks, and more!
              </div>
            </div>
          </div>
        ) : (
          <MessageList messages={chatroom.messages} />
        )}

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border bg-card">
        <MessageInput chatroomId={chatroom.id} />
      </div>
    </div>
  );
}