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
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

export default function SignInPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const categoryTitle = category.replace(/-/g, ' ');

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please enter both your email and password.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth();
      await setPersistence(auth, browserLocalPersistence)
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: 'Sign in successful!',
        description: 'Redirecting to your dashboard...',
      });

      if (category === 'student') {
        router.push('/student/dashboard');
      }
      // Add logic for other categories later
    } catch (error) {
      console.error('Sign in error:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = 'Invalid email or password. Please try again.';
        } else {
          description = error.message;
        }
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl capitalize">
            Sign In to {categoryTitle} Portal
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
          >
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {category === 'class-representative' && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="crId">Unique CR ID</Label>
                  <Input id="crId" placeholder="Your Unique CR ID" />
                </div>
              )}
              <div className="text-sm">
                <Link
                  href={`/auth/forgot-password?category=${category}`}
                  className="font-medium text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-4">
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href={`/auth/signup/${category}`}
              className="font-medium text-primary hover:underline"
            >
              Sign Up
            </Link>
          </p>
          <Button
            variant="link"
            onClick={() => router.back()}
            className="text-primary"
          >
            &larr; Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
