/**
 * @fileoverview A React component that provides an AI-powered study helper.
 *
 * This component allows students to enter a topic they want to learn about.
 * It then calls the `categoryHelpFlow` Genkit flow to get a description
 * and related topics, which are displayed to the user.
 */
'use client';

import { categoryHelpFlow } from '@/ai/flows/ai-powered-category-help';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CategoryHelpResult = {
  description: string;
  relatedTopics: string[];
};

export default function AICategoryHelp() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CategoryHelpResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetHelp = async () => {
    if (!topic) {
      setError('Please enter a topic.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const help = await categoryHelpFlow({ category: topic });
      setResult(help);
    } catch (e: any) {
      setError(e.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex w-full max-w-lg items-center space-x-2">
        <Input
          type="text"
          placeholder="e.g., Data Structures, Quantum Physics..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleGetHelp()}
          disabled={loading}
          className="text-base"
        />
        <Button onClick={handleGetHelp} disabled={loading}>
          {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          Get Help
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && (
        <div className="space-y-4">
          <div className="h-6 w-1/2 animate-pulse rounded-md bg-muted"></div>
          <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
          <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted"></div>
          <div className="flex flex-wrap gap-2 pt-4">
            <div className="h-8 w-24 animate-pulse rounded-full bg-muted"></div>
            <div className="h-8 w-32 animate-pulse rounded-full bg-muted"></div>
            <div className="h-8 w-28 animate-pulse rounded-full bg-muted"></div>
          </div>
        </div>
      )}

      {result && (
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="capitalize">{topic}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base text-muted-foreground">{result.description}</p>
            <div>
              <h4 className="mb-2 font-semibold">Related Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {result.relatedTopics.map((relatedTopic) => (
                  <Badge key={relatedTopic} variant="secondary" className="cursor-pointer text-sm" onClick={() => setTopic(relatedTopic)}>
                    {relatedTopic}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
