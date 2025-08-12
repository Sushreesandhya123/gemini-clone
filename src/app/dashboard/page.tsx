'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useChatStore, useAppStore } from '@/lib/store';
import { debounce } from '@/lib/utils';
import ChatroomList from '@/components/dashboard/ChatroomList';
import CreateChatroomModal from '@/components/dashboard/CreateChatroomModal';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Plus, Search, LogOut, Moon, Sun, User } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { chatrooms, searchQuery, setSearchQuery } = useChatStore();
  const { theme, toggleTheme } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user?.isAuthenticated) {
      router.push('/');
    }
  }, [user, router]);

  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const filteredChatrooms = chatrooms.filter(room =>
    room.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Gemini Chat</h1>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.countryCode} {user.phone}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 max-w-4xl">
        <div className="space-y-6">
          {/* Search and Create */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search chatrooms..."
                leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                onChange={handleSearchChange}
              />
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              <span className="ml-2">New Chat</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Chats</h3>
              <div className="text-2xl font-bold">{chatrooms.length}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Active Chats</h3>
              <div className="text-2xl font-bold">
                {chatrooms.filter(room => room.messages.length > 0).length}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Messages</h3>
              <div className="text-2xl font-bold">
                {chatrooms.reduce((acc, room) => acc + room.messages.length, 0)}
              </div>
            </div>
          </div>

          {/* Chatroom List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Conversations</h2>
            {filteredChatrooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No conversations yet</h3>
                  <div className="text-muted-foreground max-w-sm mx-auto">
                    {searchQuery 
                      ? `No conversations match "${searchQuery}"`
                      : "Create your first conversation to get started with Gemini AI"
                    }
                  </div>
                  {!searchQuery && (
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Chat
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <ChatroomList chatrooms={filteredChatrooms} />
            )}
          </div>
        </div>
      </main>

      {/* Create Chatroom Modal */}
      {showCreateModal && (
        <CreateChatroomModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}