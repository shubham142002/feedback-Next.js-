'use client';

import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounceCallback } from 'usehooks-ts';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/schemas/signUpSchema';

export default function SignUpForm() {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounced = useDebounceCallback(setUsername, 300);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage(''); // Reset message
        try {
          const response = await axios.get<ApiResponse>(
            `/api/check-username-unique?username=${username}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? 'Error checking username'
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data);

      toast({
        title: 'Success',
        description: response.data.message,
      });

      router.replace(`/verify/${encodeURIComponent(data.username)}`);
    } catch (error) {
      console.error('Error during sign-up:', error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message || 
        'There was a problem with your sign-up. Please try again.';

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/auth-bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A2647]/80 via-[#2C786C]/80 to-[#FFD700]/80 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-md space-y-8 bg-background/95 p-8 rounded-2xl shadow-xl border border-border/50 animate-float m-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#0A2647] via-[#2C786C] to-[#FFD700] bg-clip-text text-transparent animate-gradient">
            Create Account
          </h1>
          <p className="text-muted-foreground">Join our community of anonymous feedback</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Username</FormLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      className="bg-background/50 border-border/50 focus:border-[#2C786C] transition-all duration-300"
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                    {isCheckingUsername && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {!isCheckingUsername && usernameMessage && (
                    <p className={`text-sm ${
                      usernameMessage === 'Username is unique' ? 'text-[#2C786C]' : 'text-destructive'
                    }`}>
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email</FormLabel>
                  <Input 
                    {...field} 
                    className="bg-background/50 border-border/50 focus:border-[#2C786C] transition-all duration-300"
                  />
                  <p className="text-muted-foreground">
                    We&apos;ll send you a verification code
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Password</FormLabel>
                  <Input 
                    type="password" 
                    {...field}
                    className="bg-background/50 border-border/50 focus:border-[#2C786C] transition-all duration-300"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              className="w-full relative bg-gradient-to-r from-[#0A2647] via-[#2C786C] to-[#FFD700] hover:opacity-90 text-white hover:text-white py-2 rounded-lg transition-all duration-300 hover:scale-[1.02] animate-gradient [&>span]:relative [&>span]:z-10 before:absolute before:inset-0 before:bg-black/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity" 
              type="submit"
              disabled={isSubmitting}
            >
              <span>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  'Create Account'
                )}
              </span>
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link 
              href="/sign-in" 
              className="text-[#2C786C] hover:text-[#0A2647] font-medium transition-colors duration-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

