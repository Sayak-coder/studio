'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseApp } from '@/firebase/config';
import { FirebaseError } from 'firebase/app';

const OFFICIAL_ID = 'catalyst2025';

// For this demonstration, we'll use a hardcoded but non-obvious account.
const OFFICIAL_EMAIL = 'admin.official@edubot.local';
const OFFICIAL_PASSWORD = 'supersecretpassword!23';

export default function OfficialHelpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [enteredId, setEnteredId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyAndSignIn = async () => {
    setIsLoading(true);
    
    if (enteredId !== OFFICIAL_ID) {
      toast({
        variant: 'destructive',
        title: 'Invalid ID',
        description: 'The Official ID you entered is incorrect.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const auth = getAuth(firebaseApp);
      await setPersistence(auth, browserLocalPersistence);
      
      // Sign in with the pre-defined official credentials
      await signInWithEmailAndPassword(auth, OFFICIAL_EMAIL, OFFICIAL_PASSWORD);

      toast({
        title: 'Access Granted!',
        description: 'Redirecting to the Official Dashboard...',
      });
      
      router.push('/official/dashboard');

    } catch (error) {
      console.error('Official sign-in error:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error instanceof FirebaseError) {
        if(error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            description = "Official account not provisioned. Please contact your administrator."
        } else {
            description = error.message;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: description,
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
              handleVerifyAndSignIn();
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
