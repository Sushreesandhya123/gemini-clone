'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useChatStore, useAppStore } from '@/lib/store';
import ChatRoom from '@/components/chat/ChatRoom';
import Button from '@/components/ui/button';
import { ArrowLeft, Moon, Sun, MoreVertical, Trash2 } from 'lucide-react';

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id } = React.use(params); // ✅ unwrap the Promise
  const router = useRouter();
  const { user } = useAuthStore();
  const { chatrooms, setCurrentChatroom, deleteChatroom } = useChatStore();
  const { theme, toggleTheme } = useAppStore();
  const [showOptions, setShowOptions] = useState(false);

  const chatroom = chatrooms.find(room => room.id === id);

  useEffect(() => {
    if (!user?.isAuthenticated) {
      router.push('/');
      return;
    }

    if (!chatroom) {
      router.push('/dashboard');
      return;
    }

    setCurrentChatroom(id);

    return () => {
      setCurrentChatroom(null);
    };
  }, [user, chatroom, id, router, setCurrentChatroom]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleDeleteChatroom = () => {
    deleteChatroom(id);
    router.push('/dashboard');
  };

  if (!user || !chatroom) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-semibold truncate max-w-xs sm:max-w-md">
                {chatroom.title}
              </h1>
              <div className="text-xs text-muted-foreground">
                {chatroom.messages.length} messages
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {showOptions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowOptions(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-20">
                    <div className="p-1">
                      <button
                        onClick={handleDeleteChatroom}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Conversation</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Room */}
      <ChatRoom chatroom={chatroom} />
    </div>
  );
}
