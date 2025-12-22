'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type UserProfile = {
  roles?: string[];
  disabled?: boolean;
};

/**
 * A Higher-Order Component (HOC) that protects a page component with authentication and role-based access control.
 *
 * @param WrappedComponent The component to protect.
 * @param requiredRole The role required to access the component.
 * @returns A new component that includes the authentication and role checks.
 */
const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole: string
) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
      if (!firestore || !user?.uid) return null;
      return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    useEffect(() => {
      // Don't do anything while initial auth or profile loading is in progress.
      if (isUserLoading || isProfileLoading) {
        return;
      }

      // If auth has finished loading and there's no user, redirect to the auth entry page.
      if (!user) {
        router.replace(`/help/${requiredRole}`);
        return;
      }

      // If the user object is available, check their profile.
      if (userProfile) {
        if (userProfile.disabled) {
          toast({
            variant: 'destructive',
            title: 'Account Disabled',
            description: 'Your account has been disabled by an administrator.',
          });
          router.replace('/');
          return;
        }

        if (!userProfile.roles?.includes(requiredRole)) {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'You do not have the required permissions to view this page.',
          });
          router.replace('/'); // Redirect to a safe, public page.
        }
        // If the roles include the required role, the effect completes and the component renders.
      } else {
        // This case handles when a user is authenticated but has no Firestore document.
        toast({
          variant: 'destructive',
          title: 'Profile Not Found',
          description: 'Your user profile could not be found. Please sign up or contact support.',
        });
        router.replace(`/help/${requiredRole}`);
      }

    }, [user, isUserLoading, userProfile, isProfileLoading, router, toast, requiredRole]);
    
    // --- Render Logic ---
    
    // While loading auth state or profile, show a full-screen loader.
    if (isUserLoading || isProfileLoading) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
          <LoadingSpinner className="mb-4" dotClassName="w-6 h-6" />
          <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      );
    }
    
    // If user is authenticated and profile has the required role, render the wrapped component.
    if (user && userProfile?.roles?.includes(requiredRole) && !userProfile.disabled) {
      return <WrappedComponent {...props} />;
    }

    // Fallback: This will show the loading spinner during the brief moment of redirection.
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
          <LoadingSpinner className="mb-4" dotClassName="w-6 h-6" />
          <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </div>
      );
  };

  AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return AuthComponent;
};

export default withAuth;
