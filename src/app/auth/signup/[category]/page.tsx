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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { firebaseApp } from '@/firebase/config';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@/firebase';
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';


export default function SignUpPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  
  const [name, setName] = useState('');
  const [collegeYear, setCollegeYear] = useState('');
  const [semester, setSemester] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category as string;
  const categoryTitle = category.replace(/-/g, ' ');

  useEffect(() => {
    // If the user is already logged in, try to redirect them to the dashboard.
    if (!isUserLoading && user) {
        router.replace(`/${category}/dashboard`);
    }
  }, [user, isUserLoading, router, category]);

  const handleGuestSignUp = async () => {
    // --- Form Validation ---
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Missing Name',
        description: 'Please enter your full name.',
      });
      return;
    }
    
    setIsLoading(true);
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    try {
      // --- New Anonymous User Creation ---
      const userCredential = await signInAnonymously(auth);
      
      const userRef = doc(firestore, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        id: userCredential.user.uid,
        email: null, // No email for anonymous users
        name: name,
        roles: [category],
        collegeYear: collegeYear || null,
        semester: semester || null,
        createdAt: serverTimestamp(),
        disabled: false
      });

      toast({
        title: 'Guest session started!',
        description: "We're redirecting you to your dashboard.",
      });
      router.push(`/${category}/dashboard`);

    } catch (error) {
       console.error('Guest sign up error:', error);
       let description = 'An unexpected error occurred. Please try again.';
       if (error instanceof FirebaseError) {
         description = error.message;
       }
        toast({
         variant: 'destructive',
         title: 'Guest Session Failed',
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
            Join as a {categoryTitle}
          </CardTitle>
          <CardDescription>
            Enter your details to start contributing and accessing content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGuestSignUp();
            }}
          >
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="collegeYear">College Year</Label>
                <Input
                  id="collegeYear"
                  placeholder="e.g., 2nd Year"
                  value={collegeYear}
                  onChange={(e) => setCollegeYear(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  placeholder="e.g., 4th Semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : 'Join as Guest'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-4">
          <p className="text-sm text-center text-muted-foreground">
            Already have a session?{' '}
            <Link
              href={`/auth/signin/${category}`}
              className="font-medium text-primary hover:underline"
            >
              Sign In
            </Link>
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
