'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { signInSchema } from '@/schemas/signInSchema';

export default function SignInForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const { toast } = useToast();
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        toast({
          title: 'Login Failed',
          description: 'Incorrect username or password',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    }

    if (result?.url) {
      router.replace('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/auth-bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A2647]/80 via-[#2C786C]/80 to-[#FFD700]/80 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-md space-y-8 bg-background/95 p-8 rounded-2xl shadow-xl border border-border/50 animate-float m-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#0A2647] via-[#2C786C] to-[#FFD700] bg-clip-text text-transparent animate-gradient">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">Continue your journey with True Feedback</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email/Username</FormLabel>
                  <Input 
                    {...field} 
                    className="bg-background/50 border-border/50 focus:border-[#2C786C] transition-all duration-300"
                  />
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
            >
              <span>Sign In</span>
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Not a member yet?{' '}
            <Link 
              href="/sign-up" 
              className="text-[#2C786C] hover:text-[#0A2647] font-medium transition-colors duration-300"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
