'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, OTPFormData } from '@/lib/validations';
import { useAuthStore } from '@/lib/store';
import Button from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function OTPForm() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { verifyOTP, login, isLoading, tempPhone, tempCountryCode } = useAuthStore();

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Update form value
    setValue('otp', newOtp.join(''));

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleSubmit(onSubmit)();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp);
      setValue('otp', newOtp.join(''));
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const onSubmit = (data: OTPFormData) => {
    verifyOTP(data.otp);
  };

  const handleResend = () => {
    setCountdown(30);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setValue('otp', '');
    login(tempPhone, tempCountryCode);
  };

  const handleBack = () => {
    useAuthStore.setState({ step: 'phone' });
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Change phone number</span>
      </button>

      <div className="text-center">
        <div className="text-sm text-muted-foreground">
          We've sent a 6-digit code to
        </div>
        <div className="font-medium">
          {tempCountryCode} {tempPhone}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-semibold border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            ))}
          </div>
          {errors.otp && (
            <div className="text-sm text-destructive text-center mt-2">{errors.otp.message}</div>
          )}
        </div>

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          disabled={otp.some(digit => digit === '')}
        >
          Verify OTP
        </Button>

        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-primary hover:underline"
            >
              Resend OTP
            </button>
          ) : (
            <div className="text-sm text-muted-foreground">
              Resend OTP in {countdown}s
            </div>
          )}
        </div>
      </form>
    </div>
  );
}