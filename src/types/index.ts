export interface User {
  id: string;
  phone: string;
  countryCode: string;
  isAuthenticated: boolean;
}

export interface Country {
  name: {
    common: string;
  };
  idd: {
    root: string;
    suffixes: string[];
  };
  flag: string;
  cca2: string;
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
}

export interface Chatroom {
  id: string;
  title: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  messages: Message[];
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  step: 'phone' | 'otp' | 'authenticated';
  tempPhone: string;
  tempCountryCode: string;
  login: (phone: string, countryCode: string) => void;
  verifyOTP: (otp: string) => void;
  logout: () => void;
}

export interface ChatState {
  chatrooms: Chatroom[];
  currentChatroom: string | null;
  isTyping: boolean;
  searchQuery: string;
   streamingMessageId: string | null;
  isMessageStreaming: (messageId: string) => boolean;
  createChatroom: (title: string) => void;
  deleteChatroom: (id: string) => void;
  setCurrentChatroom: (id: string | null) => void;
  addMessage: (chatroomId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  setTyping: (typing: boolean) => void;
  setSearchQuery: (query: string) => void;
  loadMoreMessages: (chatroomId: string) => void;
}

export interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}