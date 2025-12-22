'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const CR_ACCESS_CODE = 'cr@catalyst';

export default function CRHelpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [enteredCode, setEnteredCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyAndProceed = async () => {
    setIsLoading(true);
    
    // Simulate a network delay for better user experience
    await new Promise(resolve => setTimeout(resolve, 500));

    if (enteredCode !== CR_ACCESS_CODE) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'The access code you entered is incorrect.',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: 'Access Granted!',
      description: 'Redirecting to the CR Dashboard...',
    });
    router.push('/class-representative/dashboard');
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">CR Portal Access</CardTitle>
          <CardDescription>Please enter the unique CR Access Code to proceed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyAndProceed();
            }}
          >
            <div className="grid w-full items-center gap-2">
              <Input
                id="crCode"
                type="password" // Use password type to obscure the code
                placeholder="Enter Access Code"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Verify & Proceed'}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex justify-center">
            <Button
                variant="link"
                onClick={() => router.push('/')}
                className="text-primary"
                disabled={isLoading}
            >
                &larr; Back to Home
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
