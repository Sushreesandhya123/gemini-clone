🤖 Gemini Frontend Clone - Kuvaka Tech Assignment


Live Demo: https://gemini-clone-pink-five.vercel.app/
GitHub: https://github.com/Sushreesandhya123/gemini-clone


📋 Assignment Overview

Role: Frontend Developer 
Objective: Build a fully functional Gemini-style conversational AI chat application

Timeline: 48 hours Completed
✅ All Requirements Implemented FeatureStatus DetailsOTP Authentication
✅Country codes + simulated OTP validationDashboard
✅Create/Delete chatrooms with toast notificationsChat Interface
✅AI responses, typing indicators, timestampsImage Upload
✅Base64 preview with file validationResponsive Design
✅Mobile-first approach, all breakpointsDark Mode
✅System preference + manual toggleForm Validation
✅React Hook Form + Zod schemasInfinite Scroll
✅Reverse pagination for chat historySearch & Filter
✅Debounced chatroom searchAccessibility
✅Keyboard navigation + ARIA labels


🛠️ Tech Stack

Framework: Next.js 15 (App Router)
State Management: Zustand
Styling: Tailwind CSS
Validation: React Hook Form + Zod
Deployment: Vercel
TypeScript: Full type safety

🚀 Setup Instructions
bash# Clone and install
git clone https://github.com/Sushreesandhya123/gemini-clone.git
cd gemini-clone
npm install

# Run development server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build && npm start
🔧 Key Implementation Features
OTP Authentication Flow

Dynamic country selection with dial codes from REST Countries API
6-digit OTP simulation with setTimeout
Form validation with Zod schemas
LocalStorage persistence

Chat Interface

AI response simulation with 1-3 second delays
"Gemini is typing..." indicator
Auto-scroll to latest messages
Copy-to-clipboard on message hover
Image upload with base64 preview

Advanced Features

Infinite Scroll: Load older messages when scrolling to top
Debounced Search: 300ms delay for optimal performance
Toast Notifications: Success/error feedback for all actions
Mobile Responsive: Touch-optimized interactions

 Project Structure
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   └── chat/              # Chat interface
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── auth/             # Auth-specific components
│   ├── chat/             # Chat-specific components
│   └── dashboard/        # Dashboard components
├── hooks/                # Custom React hooks
├── store/                # Zustand store configuration
├── lib/                  # Utility functions and configs
├── types/                # TypeScript type definitions
└── styles/               # Global styles and Tailwind config
👨‍💻 Submission Details
Created by: Sandhyarani Jena
GitHub: @Sushreesandhya123
