'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
  roles: string[];
};

// This page acts as a router based on auth state.
export default function AuthRouterPage() {
  const router = useRouter();
  const params = useParams();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const category = Array.isArray(params.category) ? params.category[0] : params.category as string;
  const categoryTitle = category.replace(/-/g, ' ') + ' Portal';

  // Memoize the user document reference
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    // Wait until both auth state and profile loading are complete
    if (isUserLoading || isProfileLoading) {
      return; // Show loading spinner while we check
    }

    if (user && userProfile) {
      // User is logged in, check their roles
      if (userProfile.roles.includes(category)) {
        // User has the required role, redirect to the dashboard
        router.replace(`/${category}/dashboard`);
      }
      // If they don't have the role, we do nothing and let the selection page render
    }
    // If no user, we also do nothing and let the page render.
  }, [user, userProfile, isUserLoading, isProfileLoading, router, category]);


  // If we are still checking auth, show a loading spinner.
  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking session...</p>
      </div>
    );
  }

  // Render the public selection page if user is not logged in OR is logged in but doesn't have the specific role.
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-8 bg-background">
       <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-8 capitalize bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">{categoryTitle}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={`/auth/signin/${category}`}
            className="p-6 bg-card/80 backdrop-blur-sm border rounded-lg hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 text-foreground"
          >
            <h2 className="text-2xl font-semibold">Sign In</h2>
            <p className="text-muted-foreground mt-2">Existing user? Log in here.</p>
          </Link>
          <Link
            href={`/auth/signup/${category}`}
            className="p-6 bg-card/80 backdrop-blur-sm border rounded-lg hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 text-foreground"
          >
            <h2 className="text-2xl font-semibold">Sign Up</h2>
            <p className="text-muted-foreground mt-2">New user? Create an account.</p>
          </Link>
        </div>
        <Link href="/" className="mt-8 inline-block text-primary hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
