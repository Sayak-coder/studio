"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getHelp } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type HelpFormProps = {
  category: 'Student' | 'Class Representative' | 'Senior';
};

const FormSchema = z.object({
  query: z.string().min(10, { message: 'Please enter a query of at least 10 characters.' }),
});

type FormValues = z.infer<typeof FormSchema>;

export function HelpForm({ category }: HelpFormProps) {
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      query: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setResponse(null);

    try {
      const result = await getHelp({ category, query: data.query });
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'An error occurred',
          description: result.error,
        });
        setResponse(null);
      } else {
        setResponse(result.response || 'No response from AI.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An unexpected error occurred',
        description: 'Please try again later.',
      });
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-primary">Your Question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`e.g., "How do I register for new classes?"`}
                        className="min-h-[120px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Help...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ask EduBot
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
         <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary">EduBot is thinking...</h3>
                  <p className="text-muted-foreground">Please wait while we generate a response for you.</p>
                </div>
              </div>
            </CardContent>
        </Card>
      )}

      {response && (
        <Card className="mt-8 border-accent shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-accent" />
              EduBot's Response
            </h3>
            <div className="space-y-4 text-foreground/90">
              <p>{response}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
