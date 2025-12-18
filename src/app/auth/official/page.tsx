'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { signInAnonymously, type User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function OfficialLoginPage() {
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Function to create an admin user document in Firestore
  const createAdminUserDoc = async (user: User) => {
    if (!firestore) return;
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        email: 'official@edubot.com', // Placeholder email for anonymous admin
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
       // Sign out if setup fails to prevent being in a broken state
       if (auth) {
        await auth.signOut();
       }
    }
  };

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!isUserLoading && user) {
      router.push('/official/dashboard');
      return;
    }

    // If not loading and not signed in, attempt anonymous sign-in
    if (!isUserLoading && !user && !isSigningIn && auth) {
      setIsSigningIn(true);
      signInAnonymously(auth)
        .then(async (userCredential) => {
          // After successful sign-in, create their admin document
          await createAdminUserDoc(userCredential.user);
          toast({
            title: 'Official Access Granted',
            description: 'Redirecting to the dashboard.',
          });
          // Now that the doc is created, we can safely redirect.
          // The onAuthStateChanged listener in useUser will have already updated the user state.
          router.push('/official/dashboard');
        })
        .catch((error) => {
          console.error('Anonymous sign-in error:', error);
          toast({
            variant: 'destructive',
            title: 'Authentication Failed',
            description: 'Could not grant official access. Please try again.',
          });
          setIsSigningIn(false);
        });
    }
  }, [user, isUserLoading, auth, router, toast, isSigningIn, firestore]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Authenticating Official Access...</p>
      </div>
    </div>
  );
}
