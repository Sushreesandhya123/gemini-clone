import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, ChatState, AppState, Message, Chatroom } from '@/types';
import toast from 'react-hot-toast';
import { generateId } from "@/lib/utils";
import { geminiService } from '@/lib/gemini';

// Auth Store (unchanged)
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      step: 'phone',
      tempPhone: '',
      tempCountryCode: '',
      
      login: async (phone: string, countryCode: string) => {
        set({ isLoading: true, tempPhone: phone, tempCountryCode: countryCode });
        
        // Simulate API call
        setTimeout(() => {
          set({ step: 'otp', isLoading: false });
          toast.success('OTP sent successfully!');
        }, 1500);
      },
      
      verifyOTP: async (otp: string) => {
        set({ isLoading: true });
        
        // Simulate OTP verification
        setTimeout(() => {
          const { tempPhone, tempCountryCode } = get();
          set({
            user: {
              id: Math.random().toString(36),
              phone: tempPhone,
              countryCode: tempCountryCode,
              isAuthenticated: true,
            },
            step: 'authenticated',
            isLoading: false,
          });
          toast.success('Login successful!');
        }, 1000);
      },
      
      logout: () => {
        set({
          user: null,
          step: 'phone',
          tempPhone: '',
          tempCountryCode: '',
        });
        toast.success('Logged out successfully!');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Chat Store with Gemini Integration
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chatrooms: [],
      currentChatroom: null,
      isTyping: false,
      searchQuery: '',
      streamingMessageId: null, 
      
      createChatroom: (title: string) => {
        const newChatroom: Chatroom = {
          id: crypto.randomUUID(),
          title,
          messages: [],
        };
        
        set((state) => ({
          chatrooms: [...state.chatrooms, newChatroom],
        }));
        
        toast.success('Chatroom created!');
      },
      
      deleteChatroom: (id: string) => {
        set((state) => ({
          chatrooms: state.chatrooms.filter(room => room.id !== id),
          currentChatroom: state.currentChatroom === id ? null : state.currentChatroom,
        }));
        
        toast.success('Chatroom deleted!');
      },
      
      setCurrentChatroom: (id: string | null) => {
        set({ currentChatroom: id });
      },
      
      addMessage: async (chatroomId: string, messageData: Omit<Message, 'id' | 'timestamp'>) => {
        const message: Message = {
          ...messageData,
          id: Math.random().toString(36),
          timestamp: new Date(),
        };
        
        set((state) => ({
          chatrooms: state.chatrooms.map(room =>
            room.id === chatroomId
              ? {
                  ...room,
                  messages: [...room.messages, message],
                  lastMessage: message.content,
                  lastMessageTime: message.timestamp,
                }
              : room
          ),
        }));
        
        // Generate AI response using Gemini
        if (messageData.isUser) {
          set({ isTyping: true });
          
          try {
            // Get current chatroom and conversation history
            const currentState = get();
            const chatroom = currentState.chatrooms.find(room => room.id === chatroomId);
            
            if (!chatroom) {
              throw new Error('Chatroom not found');
            }
            
            // Get the last 10 messages for context (excluding the just-added message)
            const recentMessages = chatroom.messages.slice(-11, -1);
            const conversationHistory = geminiService.convertToGeminiHistory(recentMessages);
            
            // Generate response using Gemini
            const response = await geminiService.generateResponse(
              messageData.content,
              messageData.image,
              conversationHistory
            );
            
            const aiMessage: Message = {
              id: Math.random().toString(36),
              content: response,
              isUser: false,
              timestamp: new Date(),
            };
            
            set((state) => ({
              chatrooms: state.chatrooms.map(room =>
                room.id === chatroomId
                  ? {
                      ...room,
                      messages: [...room.messages, aiMessage],
                      lastMessage: aiMessage.content,
                      lastMessageTime: aiMessage.timestamp,
                    }
                  : room
              ),
              isTyping: false,
            }));
            
          } catch (error) {
            console.error('Error generating AI response:', error);
            
            // Add error message to chat
            const errorMessage: Message = {
              id: Math.random().toString(36),
              content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
              isUser: false,
              timestamp: new Date(),
            };
            
            set((state) => ({
              chatrooms: state.chatrooms.map(room =>
                room.id === chatroomId
                  ? {
                      ...room,
                      messages: [...room.messages, errorMessage],
                      lastMessage: errorMessage.content,
                      lastMessageTime: errorMessage.timestamp,
                    }
                  : room
              ),
              isTyping: false,
            }));
            
            toast.error('Failed to get AI response. Please try again.');
          }
        }
      },
      
       addStreamingMessage: async (chatroomId: string, messageData: Omit<Message, 'id' | 'timestamp'>) => {
        const message: Message = {
          ...messageData,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };
        
        // Add user message
        set((state) => ({
          chatrooms: state.chatrooms.map(room =>
            room.id === chatroomId
              ? {
                  ...room,
                  messages: [...room.messages, message],
                  lastMessage: message.content,
                  lastMessageTime: message.timestamp,
                }
              : room
          ),
        }));
        
        if (messageData.isUser) {
          // Create AI message placeholder with streaming indicator
          const aiMessageId = crypto.randomUUID();
          const aiMessage: Message = {
            id: aiMessageId,
            content: '',
            isUser: false,
            timestamp: new Date(),
          };
          
          set((state) => ({
            chatrooms: state.chatrooms.map(room =>
              room.id === chatroomId
                ? {
                    ...room,
                    messages: [...room.messages, aiMessage],
                  }
                : room
            ),
            isTyping: true,
            streamingMessageId: aiMessageId,
          }));
          
          try {
            const currentState = get();
            const chatroom = currentState.chatrooms.find(room => room.id === chatroomId);
            
            if (!chatroom) {
              throw new Error('Chatroom not found');
            }
            
            // Get conversation history (excluding the just-added messages)
            const recentMessages = chatroom.messages.slice(-12, -2);
            const conversationHistory = geminiService.convertToGeminiHistory(recentMessages);
            
            let fullResponse = '';
            
            // Stream response with smooth updates
            await geminiService.generateStreamResponse(
              messageData.content,
              messageData.image,
              conversationHistory,
              (chunk: string) => {
                fullResponse += chunk;
                
                // Update the AI message with new chunk
                set((state) => ({
                  chatrooms: state.chatrooms.map(room =>
                    room.id === chatroomId
                      ? {
                          ...room,
                          messages: room.messages.map(msg =>
                            msg.id === aiMessageId
                              ? { ...msg, content: fullResponse }
                              : msg
                          ),
                          lastMessage: fullResponse,
                          lastMessageTime: new Date(),
                        }
                      : room
                  ),
                }));
              }
            );
            
            // Mark streaming as complete
            set((state) => ({
              isTyping: false,
              streamingMessageId: null,
            }));
            
          } catch (error) {
            console.error('Error generating streaming AI response:', error);
            
            // Update placeholder with error message
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Sorry, I encountered an error. Please try again.';
              
            set((state) => ({
              chatrooms: state.chatrooms.map(room =>
                room.id === chatroomId
                  ? {
                      ...room,
                      messages: room.messages.map(msg =>
                        msg.id === aiMessageId
                          ? { ...msg, content: errorMessage }
                          : msg
                      ),
                      lastMessage: errorMessage,
                      lastMessageTime: new Date(),
                    }
                  : room
              ),
              isTyping: false,
              streamingMessageId: null,
            }));
            
            toast.error('Failed to get AI response. Please try again.');
          }
        }
      },
      
           // Add this helper method
      isMessageStreaming: (messageId: string) => {
        const state = get();
        return state.streamingMessageId === messageId;
      },
 
      
      setTyping: (typing: boolean) => {
        set({ isTyping: typing });
      },
      
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },
      
      loadMoreMessages: (chatroomId: string) => {
        // Simulate loading older messages
        const dummyMessages: Message[] = Array.from({ length: 10 }, (_, i) => ({
          id: Math.random().toString(36),
          content: `Older message ${i + 1}`,
          isUser: Math.random() > 0.5,
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 30), // Random date within 30 days
        }));
        
        set((state) => ({
          chatrooms: state.chatrooms.map(room =>
            room.id === chatroomId
              ? { ...room, messages: [...dummyMessages, ...room.messages] }
              : room
          ),
        }));
      },
    }),
    {
      name: 'chat-storage',
    }
  )
);

// App Store (unchanged)
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => {
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
      },
    }),
    {
      name: 'app-storage',
    }
  )
);

// Helper function removed - now using actual Gemini responses