'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import { useChatStore } from '@/lib/store';
import { formatTime } from '@/lib/utils';
import { Chatroom } from '@/types';
import Button from '@/components/ui/button';
import { MessageSquare, Trash2, MoreVertical } from 'lucide-react';
import Link from 'next/link';

interface ChatroomListProps {
  chatrooms: Chatroom[];
}

export default function ChatroomList({ chatrooms }: ChatroomListProps) {

  const { deleteChatroom } = useChatStore();
  const [showOptionsFor, setShowOptionsFor] = useState<string | null>(null);



  const handleDeleteChatroom = (id: string) => {
    deleteChatroom(id);
    setShowOptionsFor(null);
  };

  const toggleOptions = (id: string) => {
    setShowOptionsFor(showOptionsFor === id ? null : id);
  };

  console.log('Chatrooms:', chatrooms);

  return (
    <div className="space-y-2">
      {chatrooms.map((chatroom) => (
        <Link href={`dashboard/chat/${chatroom.id}`} key={chatroom.id}>
          <div
            className="relative bg-card border border-border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer group"
            // onClick={() => handleChatroomClick(chatroom.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{chatroom.title}</h3>
                  {chatroom.lastMessage && (
                    <div className="text-sm text-muted-foreground truncate mt-1">
                      {chatroom.lastMessage}
                    </div>
                  )}
                  {chatroom.lastMessageTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTime(chatroom.lastMessageTime)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-xs text-muted-foreground">
                {chatroom.messages.length} messages
              </div>
              
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOptions(chatroom.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {showOptionsFor === chatroom.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowOptionsFor(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-20">
                      <div className="p-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChatroom(chatroom.id);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Message count indicator */}
          {chatroom.messages.length === 0 && (
            <div className="mt-3 text-center">
              <div className="text-sm text-muted-foreground">Start a conversation</div>
            </div>
          )}
        </div>

        </Link>
      ))}
    </div>
  );
}