'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Loader2 } from 'lucide-react';

interface VerifyPageProps {
  params: {
    username: string;
  };
}

export default function VerifyPage({ params }: VerifyPageProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const username = params.username;

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const trimmedCode = verificationCode.trim();
    
    if (!trimmedCode) {
      toast({
        title: 'Error',
        description: 'Please enter a verification code',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Submitting verification:', { username, code: trimmedCode });
      
      const response = await axios.post<ApiResponse>('/api/verify', {
        username,
        verificationCode: trimmedCode,
      });

      console.log('Verification response:', response.data);

      toast({
        title: 'Success',
        description: response.data.message,
      });

      setTimeout(() => {
        router.replace('/sign-in');
      }, 1500);

    } catch (error) {
      console.error('Error during verification:', error);
      const axiosError = error as AxiosError<ApiResponse>;
      
      const errorMessage = axiosError.response?.data.message || 
        axiosError.message || 
        'Something went wrong';

      console.log('Error details:', {
        status: axiosError.response?.status,
        message: errorMessage,
        data: axiosError.response?.data
      });

      toast({
        title: 'Verification Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/resend-code', {
        username,
      });

      toast({
        title: 'Code Resent',
        description: response.data.message,
      });
    } catch (error) {
      console.error('Error resending code:', error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message || 'Failed to resend code',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/auth-bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A2647]/80 via-[#2C786C]/80 to-[#FFD700]/80 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-md space-y-8 bg-background/95 p-8 rounded-2xl shadow-xl border border-border/50 animate-float m-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#0A2647] via-[#2C786C] to-[#FFD700] bg-clip-text text-transparent animate-gradient">
            Verify Your Account
          </h1>
          <p className="text-muted-foreground">
            Please enter the verification code sent to your email
          </p>
          {mounted && (
            <p className="text-sm font-medium text-foreground">
              Verifying account: {username}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="code" className="text-foreground font-medium block">
              Verification Code
            </label>
            <Input
              id="code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter your verification code"
              className="bg-background/50 border-border/50 focus:border-[#2C786C] transition-all duration-300"
              required
            />
          </div>

          <div className="space-y-4">
            <Button 
              type="submit"
              className="w-full relative bg-gradient-to-r from-[#0A2647] via-[#2C786C] to-[#FFD700] hover:opacity-90 text-white hover:text-white py-2 rounded-lg transition-all duration-300 hover:scale-[1.02] animate-gradient [&>span]:relative [&>span]:z-10 before:absolute before:inset-0 before:bg-black/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
              disabled={isSubmitting}
            >
              <span>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  'Verify Account'
                )}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleResendCode}
              className="w-full border-[#2C786C] hover:bg-[#2C786C]/5 text-foreground hover:text-foreground transition-all duration-300"
            >
              Resend Code
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            The verification code will expire in 1 hour. If you haven't received the code,
            check your spam folder or click "Resend Code".
          </p>
        </div>
      </div>
    </div>
  );
}
