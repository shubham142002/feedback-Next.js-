'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { MessageSquare, Send, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';

const feedbackSchema = z.object({
  content: z.string().min(1, 'Message is required').max(500),
});

type FormData = z.infer<typeof feedbackSchema>;

export default function PublicProfile() {
  const params = useParams();
  const username = params?.username?.toString();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [characterCount, setCharacterCount] = useState(0);
  const maxCharacters = 500;

  const form = useForm<FormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!username) return;
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>(
        `/api/messages/${username}`,
        { content: data.content }
      );
      
      toast({
        title: 'Success',
        description: response.data.message,
      });
      form.reset();
      setCharacterCount(0);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-secondary to-accent blur-md opacity-75" />
                  <div className="relative bg-background rounded-full p-3">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">
                  Send a Message to @{username}
                </CardTitle>
                <CardDescription className="text-base">
                  Share your thoughts anonymously. Be kind and constructive!
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              placeholder="Type your message here..."
                              className="min-h-[200px] resize-none bg-background/50 border-border/50 focus:border-primary transition-all duration-300"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setCharacterCount(e.target.value.length);
                              }}
                              maxLength={maxCharacters}
                            />
                            <div className="absolute bottom-3 right-3 text-sm text-muted-foreground">
                              {characterCount}/{maxCharacters}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="submit"
                      disabled={isLoading || characterCount === 0}
                      className="relative group overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Feedback
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <p>Your message will be sent anonymously</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
