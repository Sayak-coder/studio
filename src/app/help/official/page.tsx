'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    try {
      await setPersistence(auth, browserLocalPersistence);
      
      // Try to sign in with the pre-defined official credentials
      await signInWithEmailAndPassword(auth, OFFICIAL_EMAIL, OFFICIAL_PASSWORD);

    } catch (error) {
       // If the user does not exist, create them first, then sign in.
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, OFFICIAL_EMAIL, OFFICIAL_PASSWORD);
            const user = userCredential.user;

            // Create the corresponding Firestore document with the 'official' role.
            const userRef = doc(firestore, 'users', user.uid);
            await setDoc(userRef, {
                id: user.uid,
                email: user.email,
                name: "Official Admin",
                roles: ['official', 'admin'],
                createdAt: serverTimestamp(),
                disabled: false,
            });
            
             // Now that the user is created, signInWithEmailAndPassword will succeed if called again,
             // but createUserWithEmailAndPassword already signs the user in.
        } catch (creationError) {
             console.error('Official account creation error:', creationError);
             toast({
                variant: 'destructive',
                title: 'Provisioning Failed',
                description: 'Could not create the official account. Please contact support.',
             });
             setIsLoading(false);
             return;
        }
      } else {
        // Handle other errors like wrong password for an existing account
        console.error('Official sign-in error:', error);
        let description = 'An unexpected error occurred during sign-in.';
        if (error instanceof FirebaseError) {
            description = "Authentication failed. Please check credentials or contact support.";
        }
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: description,
        });
        setIsLoading(false);
        return; // Stop execution on failure
      }
    }
    
    // If sign-in or creation was successful, proceed.
    toast({
      title: 'Access Granted!',
      description: 'Redirecting to the Official Dashboard...',
    });
    router.push('/official/dashboard');
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
