'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function OfficialLoginPage() {
  const router = useRouter();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // If user is already logged in (even anonymously), redirect to dashboard
    if (!isUserLoading && user) {
      router.push('/official/dashboard');
      return;
    }

    // If not loading and not signed in, attempt anonymous sign-in
    if (!isUserLoading && !user && !isSigningIn) {
      setIsSigningIn(true);
      signInAnonymously(auth)
        .then(() => {
          toast({
            title: 'Official Access Granted',
            description: 'Redirecting to the dashboard.',
          });
          // The onAuthStateChanged listener will trigger a re-render,
          // and the next useEffect run will handle the redirect.
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
  }, [user, isUserLoading, auth, router, toast, isSigningIn]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Authenticating Official Access...</p>
      </div>
    </div>
  );
}
