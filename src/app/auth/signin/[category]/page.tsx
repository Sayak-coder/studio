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
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { firebaseApp } from '@/firebase/config';
import { useUser } from '@/firebase';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function SignInPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [specialId, setSpecialId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category as string;
  const categoryTitle = category.replace(/-/g, ' ');

  useEffect(() => {
    if (!isUserLoading && user) {
        if (category === 'student') {
            router.replace('/student/dashboard');
        } else if (category === 'senior') {
            router.replace('/senior/dashboard');
        } else if (category === 'official') {
            router.replace('/official/dashboard');
        } else if (category === 'class-representative') {
            router.replace('/class-representative/dashboard');
        }
        // Redirect logic for other roles can be added here
    }
  }, [user, isUserLoading, router, category]);


  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please enter both your email and password.',
      });
      return;
    }

    if (category === 'class-representative' && specialId !== 'cr_edubot25') {
       toast({
        variant: 'destructive',
        title: 'Invalid ID',
        description: 'Please enter the correct CR ID to sign in.',
      });
      return;
    }
    
    if (category === 'senior' && specialId !== 'sen_edubot25') {
       toast({
        variant: 'destructive',
        title: 'Invalid ID',
        description: 'Please enter the correct Senior ID to sign in.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: 'Sign in successful!',
        description: 'Redirecting to your dashboard...',
      });

      // Redirection is now handled by the useEffect hook
    } catch (error) {
      console.error('Sign in error:', error);
      let description = 'An unexpected error occurred. Please try again.';

      if (error instanceof FirebaseError) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
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

  if (isUserLoading || user) {
     return (
       <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              {category === 'class-representative' && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="crId">Unique CR ID</Label>
                  <Input 
                    id="crId" 
                    placeholder="Your Unique CR ID" 
                    value={specialId}
                    onChange={(e) => setSpecialId(e.target.value)}
                    disabled={isLoading}
                   />
                </div>
              )}
               {category === 'senior' && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="seniorId">Unique Senior ID</Label>
                  <Input 
                    id="seniorId" 
                    placeholder="Your Unique Senior ID" 
                    value={specialId}
                    onChange={(e) => setSpecialId(e.target.value)}
                    disabled={isLoading}
                   />
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
              className="w-full mt-4"
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
