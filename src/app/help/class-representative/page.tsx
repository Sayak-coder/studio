'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { firebaseApp } from '@/firebase/config';
import { useUser } from '@/firebase';

const CR_ACCESS_CODE = 'cr@catalyst';

export default function CRHelpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const [enteredCode, setEnteredCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If an anonymous user session already exists, they might be coming back.
    // Redirect them to the dashboard directly.
    if (!isUserLoading && user?.isAnonymous) {
      router.replace('/class-representative/dashboard');
    }
  }, [user, isUserLoading, router]);


  const handleVerifyAndSignIn = async () => {
    setIsLoading(true);
    
    if (enteredCode !== CR_ACCESS_CODE) {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'The access code you entered is incorrect.',
      });
      setIsLoading(false);
      return;
    }

    const auth = getAuth(firebaseApp);
    
    try {
      // Sign in anonymously. This creates a temporary user session.
      // This session is necessary to satisfy Firestore security rules
      // that require an authenticated user (request.auth != null).
      await signInAnonymously(auth);

      toast({
        title: 'Access Granted!',
        description: 'Redirecting to the CR Dashboard...',
      });
      // The onAuthStateChanged listener will pick up the new anonymous user,
      // and this component will re-render, triggering the useEffect
      // to redirect to the dashboard.
      router.push('/class-representative/dashboard');

    } catch (error) {
      console.error('Anonymous sign-in error:', error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: 'Could not create a session. Please try again.',
      });
      setIsLoading(false);
    }
  };
  
  // While checking auth or if user is found (and redirection is happening), show loading.
  if (isUserLoading || (!isUserLoading && user)) {
     return (
       <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Initializing session...</p>
      </div>
    );
  }


  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">CR Portal Entry</CardTitle>
          <CardDescription>Please enter the unique access code to proceed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyAndSignIn();
            }}
          >
            <div className="grid w-full items-center gap-2">
              <Input
                id="accessCode"
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
