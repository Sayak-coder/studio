/**
 * @fileoverview A React component that provides a guided AI study helper.
 *
 * This component guides the user through a two-step process:
 * 1. Generate a high-quality prompt for a given topic.
 * 2. Instruct the user to copy this prompt into ChatGPT (or a similar tool)
 *    and paste the result back into a textarea for display.
 */
'use client';

import { generateChatGptPrompt } from '@/ai/flows/ai-powered-category-help';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Loader, Clipboard, Wand2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type WorkflowStep = '1_GET_PROMPT' | '2_PASTE_RESULT';

export default function AICategoryHelp() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [step, setStep] = useState<WorkflowStep>('1_GET_PROMPT');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [pastedResult, setPastedResult] = useState('');
  const [copied, setCopied] = useState(false);


  const handleGeneratePrompt = async () => {
    if (!topic) {
      setError('Please enter a topic.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateChatGptPrompt({ category: topic });
      setGeneratedPrompt(result.prompt);
      setStep('2_PASTE_RESULT');
    } catch (e: any) {
      setError(e.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };
  
  const handleReset = () => {
    setTopic('');
    setStep('1_GET_PROMPT');
    setGeneratedPrompt('');
    setPastedResult('');
    setError(null);
  };


  return (
    <div className="space-y-6">
      {step === '1_GET_PROMPT' && (
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="e.g., Data Structures, Quantum Physics..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleGeneratePrompt()}
            disabled={loading}
            className="text-base"
          />
          <Button onClick={handleGeneratePrompt} disabled={loading} className="px-6">
            {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {step === '2_PASTE_RESULT' && (
         <div className="space-y-4 animate-fade-in-up">
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Step 1: Copy the Prompt</h3>
                <p className="text-sm text-muted-foreground">
                    Copy the generated prompt below and paste it into ChatGPT or another AI tool.
                </p>
                <div className="relative rounded-md bg-secondary p-4">
                    <pre className="whitespace-pre-wrap text-sm text-secondary-foreground font-sans">
                      {generatedPrompt}
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={handleCopyToClipboard}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold text-lg">Step 2: Paste the Result</h3>
                 <p className="text-sm text-muted-foreground">
                    Paste the complete response from the AI tool into the text box below to display it.
                </p>
                <Textarea
                    placeholder="Paste the response from ChatGPT here..."
                    value={pastedResult}
                    onChange={(e) => setPastedResult(e.target.value)}
                    className="min-h-[200px] text-base"
                />
            </div>
            {pastedResult && (
                <Card>
                    <CardHeader>
                        <CardTitle>AI Generated Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">
                         {pastedResult}
                       </pre>
                    </CardContent>
                </Card>
            )}

            <Button onClick={handleReset} variant="outline">Start Over</Button>
         </div>
      )}

    </div>
  );
}
