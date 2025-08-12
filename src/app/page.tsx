'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAppStore } from '@/lib/store';
import LoginForm from '@/components/auth/LoginForm';
import OTPForm from '@/components/auth/OTPForm';
import { Moon, Sun } from 'lucide-react';
import Button from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { user, step } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();

  useEffect(() => {
    if (user?.isAuthenticated) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="p-2"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Gemini
            </h1>
            <div className="text-gray-600 dark:text-gray-300">
              {step === 'phone' ? 'Enter your phone number to get started' : 'Enter the OTP sent to your phone'}
            </div>
          </div>

          {step === 'phone' && <LoginForm />}
          {step === 'otp' && <OTPForm />}
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}