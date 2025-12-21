'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

type UserProfile = {
  roles: string[];
};

export default function AuthPage() {
  const router = useRouter();
  const params = useParams();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isVerifyingRole, setIsVerifyingRole] = useState(true);

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
      return;
    }

    if (user && userProfile) {
      // User is logged in, check their roles
      if (userProfile.roles.includes(category)) {
        // User has the required role, redirect to the dashboard
        router.replace(`/${category}/dashboard`);
      } else {
        // User is logged in but doesn't have the role, stop loading and show options
        setIsVerifyingRole(false);
      }
    } else {
      // No user is logged in, or profile doesn't exist. Stop loading.
      setIsVerifyingRole(false);
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router, category]);


  if (isUserLoading || isVerifyingRole) {
    // Show a loading state while checking auth/role or during redirection
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  // Render this content only if not logged in or role verification is complete and unsuccessful
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
