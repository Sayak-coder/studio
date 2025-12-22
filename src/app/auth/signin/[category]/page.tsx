'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect }from 'react';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { firebaseApp } from '@/firebase/config';
import { useUser } from '@/firebase';
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export default function SignInPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const [isLoading, setIsLoading] = useState(false);

  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category as string;
  const categoryTitle = category.replace(/-/g, ' ');

  useEffect(() => {
    if (!isUserLoading && user) {
        router.replace(`/${category}/dashboard`);
    }
  }, [user, isUserLoading, router, category]);


  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      const firestore = getFirestore(firebaseApp);
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Check if a profile exists, if not, create one.
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
            id: user.uid,
            email: null,
            name: `${categoryTitle} Guest`,
            roles: [category],
            createdAt: serverTimestamp(),
            disabled: false,
        });
      }

      toast({
        title: 'Sign in successful!',
        description: 'Redirecting to your dashboard...',
      });

      router.push(`/${category}/dashboard`);

    } catch (error) {
      console.error('Anonymous sign in error:', error);
      let description = 'Could not start a guest session.';

      if (error instanceof FirebaseError) {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || user) {
     return (
       <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <LoadingSpinner className="mb-4" dotClassName="w-6 h-6" />
        <p className="mt-4 text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-background">
       <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl capitalize">
            Enter {categoryTitle} Portal
          </CardTitle>
          <CardDescription>
            Proceed as a guest to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button
              onClick={handleAnonymousSignIn}
              className="w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : 'Proceed as Guest'}
            </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-4">
           <p className="text-sm text-center text-muted-foreground">
            No account needed for guest access.
          </p>
          <Button
            variant="link"
            asChild
            className="text-primary"
          >
            <Link href={`/help/${category}`}>&larr; Back</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
