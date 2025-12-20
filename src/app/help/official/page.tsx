'use client';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { firebaseApp } from '@/firebase/config';
import { Loader2 } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { ThemeToggle } from '@/components/theme-toggle';

export default function OfficialSignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [officialId, setOfficialId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const SECRET_ID = 'catalyst2025';

  const handleSignIn = async () => {
    if (officialId !== SECRET_ID) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'The Official ID you entered is incorrect.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      const firestore = getFirestore(firebaseApp);
      
      // Step 1: Sign in anonymously
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Step 2: Create a user profile with the 'official' role.
      // This document is what the dashboard's security rules will check.
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        name: `Official-${user.uid.substring(0, 5)}`,
        email: 'official@edubot.com', // Placeholder email
        role: 'official',
      });

      toast({
        title: 'Access Granted!',
        description: 'Redirecting to the Official Dashboard...',
      });
      
      router.push('/official/dashboard');

    } catch (error) {
      console.error('Official sign-in error:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error instanceof FirebaseError) {
        description = error.message;
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
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Official Portal
          </CardTitle>
          <CardDescription>
            Enter your unique ID to access the administrative dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
          >
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="official-id">Unique Official ID</Label>
                <Input
                  id="official-id"
                  type="password" 
                  placeholder="Enter your secret ID"
                  value={officialId}
                  onChange={(e) => setOfficialId(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Enter Portal'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-4">
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
