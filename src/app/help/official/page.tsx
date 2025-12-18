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

// This is a simple, hardcoded secret for the prototype.
// In a real application, this would be validated against a backend or a more secure check.
const SECRET_OFFICIAL_ID = 'catalyst2025';

export default function OfficialSignInPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [officialId, setOfficialId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!officialId) {
      toast({
        variant: 'destructive',
        title: 'ID Required',
        description: 'Please enter your Unique Official ID.',
      });
      return;
    }

    if (officialId !== SECRET_OFFICIAL_ID) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'The Official ID you entered is invalid.',
      });
      setOfficialId(''); // Clear the input
      return;
    }
    
    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      const firestore = getFirestore(firebaseApp);
      
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      if (user) {
         // Create the user document with the 'official' role so security rules pass
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          id: user.uid,
          name: 'Official User',
          email: `${user.uid}@official.local`, // Placeholder email
          role: 'official',
        }, { merge: true }); // Merge to avoid overwriting if it somehow exists

        toast({
          title: 'Access Granted!',
          description: 'Redirecting to the Official Dashboard...',
        });
        
        router.push('/official/dashboard');
      } else {
        throw new Error("Could not create an anonymous session.");
      }

    } catch (error) {
      console.error('Official sign-in error:', error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: 'Could not establish a secure session. Please try again.',
      });
       setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Official Portal
          </CardTitle>
          <CardDescription>
            Enter your Unique Official ID to proceed.
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
                <Label htmlFor="officialId">Unique Official ID</Label>
                <Input
                  id="officialId"
                  type="password" 
                  placeholder="Enter your private ID"
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
