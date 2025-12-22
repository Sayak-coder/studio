
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/firebase/config';
import { FirebaseError } from 'firebase/app';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const OFFICIAL_ID = 'catalyst2026';
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

    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, OFFICIAL_EMAIL, OFFICIAL_PASSWORD);
      
      toast({
        title: 'Access Granted!',
        description: 'Redirecting to the Official Dashboard...',
      });
      router.push('/official/dashboard');

    } catch (error) {
      if (error instanceof FirebaseError && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
        // If the user does not exist, create the account and profile
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, OFFICIAL_EMAIL, OFFICIAL_PASSWORD);
          const user = userCredential.user;
          const userRef = doc(firestore, 'users', user.uid);
          
          // CRITICAL: Await the setDoc to ensure the profile exists before redirecting
          await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            name: "Official Admin",
            roles: ['official', 'admin'],
            createdAt: serverTimestamp(),
            disabled: false,
          });

          toast({
            title: 'Official Account Provisioned!',
            description: 'Redirecting to the dashboard...',
          });
          // Redirect AFTER the profile has been created
          router.push('/official/dashboard');

        } catch (creationError) {
          console.error('Official account creation error:', creationError);
          toast({
            variant: 'destructive',
            title: 'Provisioning Failed',
            description: 'Could not create the official account. Please contact support.',
          });
          setIsLoading(false);
        }
      } else {
        // Handle other unexpected sign-in errors
        console.error('Official sign-in error:', error);
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: 'An unexpected error occurred during sign-in. Please try again.',
        });
        setIsLoading(false);
      }
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
              {isLoading ? <LoadingSpinner /> : 'Verify & Proceed'}
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
