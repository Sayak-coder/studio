'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const OFFICIAL_ID = 'catalyst2025';

export default function OfficialHelpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [enteredId, setEnteredId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = () => {
    setIsLoading(true);
    if (enteredId === OFFICIAL_ID) {
      toast({
        title: 'ID Verified!',
        description: 'Redirecting to the sign-in page...',
      });
      // Instead of going directly to dashboard, go to a sign-in page for security.
      router.push('/auth/signin/official');
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid ID',
        description: 'The Official ID you entered is incorrect.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Official Portal Entry</CardTitle>
          <CardDescription>Please enter the unique Official ID to proceed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
          >
            <div className="grid w-full items-center gap-2">
              <Input
                id="officialId"
                type="password" // Use password type to obscure the ID
                placeholder="Enter Unique Official ID"
                value={enteredId}
                onChange={(e) => setEnteredId(e.target.value)}
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
