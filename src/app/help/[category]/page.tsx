'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isUserLoading } = useUser();

  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const categoryTitle = category.replace(/-/g, ' ') + ' Portal';

  useEffect(() => {
    // Wait until the user's auth state is determined
    if (isUserLoading) {
      return;
    }

    if (user) {
      // If user is logged in, redirect to their dashboard
      if (category === 'student') {
        router.replace('/student/dashboard');
      } else if (category === 'senior') {
        router.replace('/senior/dashboard');
      }
      // Add other role-based redirects here if needed
      // For class-representative, it would be router.replace('/cr/dashboard');
    }
    // If no user, they stay on this page to sign in or sign up
  }, [user, isUserLoading, router, category]);

  if (isUserLoading || user) {
    // Show a loading state while checking auth or during redirection
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
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
