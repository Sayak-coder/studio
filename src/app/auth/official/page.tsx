'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Briefcase } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { signInAnonymously, type User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// This would be stored securely in a real application (e.g., environment variable)
const OFFICIAL_ID = 'OFFICIAL_ADMIN_PASS';

export default function OfficialLoginPage() {
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [officialIdInput, setOfficialIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If a user is already logged in (and is an admin), redirect them.
  useEffect(() => {
    if (!isUserLoading && user) {
        // We can add a check here to see if the user is an admin if we want
        router.push('/official/dashboard');
    }
  }, [user, isUserLoading, router]);


  const createAdminUserDocIfNotExists = async (user: User) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        try {
            await setDoc(userRef, {
                id: user.uid,
                email: `official-${user.uid.substring(0, 5)}@edubot.com`, // Unique placeholder
                name: 'Official Admin',
                role: 'admin',
            });
        } catch (error) {
           console.error("Error creating admin user document:", error);
           toast({
              variant: "destructive",
              title: "Setup Failed",
              description: "Could not create the required admin user profile.",
           });
           if (auth) await auth.signOut(); // Sign out on failure
           throw error; // Propagate error
        }
    }
  };

  const handleIdVerification = async () => {
    if (officialIdInput !== OFFICIAL_ID) {
      toast({
        variant: 'destructive',
        title: 'Invalid ID',
        description: 'The Official ID you entered is incorrect.',
      });
      return;
    }

    if (!auth) {
        toast({ variant: 'destructive', title: 'Service Unavailable', description: 'Authentication service is not ready.'});
        return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInAnonymously(auth);
      await createAdminUserDocIfNotExists(userCredential.user);
      toast({
        title: 'Official Access Granted',
        description: 'Redirecting to the dashboard.',
      });
      router.push('/official/dashboard');
    } catch (error) {
      console.error('Official sign-in error:', error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: 'Could not grant official access. Please try again.',
      });
      setIsLoading(false);
    }
  };

  // Show a loading screen while checking for an existing user session
  if (isUserLoading) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                 <Briefcase className="h-12 w-12 text-primary" />
            </div>
          <CardTitle className="text-2xl">Official Portal</CardTitle>
          <CardDescription>Please enter your unique ID to gain access.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleIdVerification(); }}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="official-id">Unique Official ID</Label>
                <Input
                  id="official-id"
                  type="password"
                  placeholder="Enter your secret ID"
                  value={officialIdInput}
                  onChange={(e) => setOfficialIdInput(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
             <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enter'}
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
