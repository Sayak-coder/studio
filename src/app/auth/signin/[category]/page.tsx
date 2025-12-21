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
import { useState, useEffect }from 'react';
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { firebaseApp } from '@/firebase/config';
import { useUser } from '@/firebase';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

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
    // This effect handles redirection AFTER a user is confirmed to be logged in.
    if (!isUserLoading && user) {
        // We don't need to check roles here, the /help/[category] page will do that.
        // Just redirect to the intended dashboard.
        router.replace(`/${category}/dashboard`);
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

    if (category === 'class-representative' && specialId !== 'cr-edubot25') {
       toast({
        variant: 'destructive',
        title: 'Invalid CR ID',
        description: 'Please enter the correct CR ID to sign in.',
      });
      return;
    }
    
    if (category === 'senior' && specialId !== 'sen-edubot25') {
       toast({
        variant: 'destructive',
        title: 'Invalid Senior ID',
        description: 'Please enter the correct Senior ID to sign in.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      const firestore = getFirestore(firebaseApp);
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authenticatedUser = userCredential.user;
      
      const userDocRef = doc(firestore, 'users', authenticatedUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
         if (userDoc.data()?.disabled) {
            await auth.signOut(); // Force sign out
            toast({
              variant: 'destructive',
              title: 'Account Disabled',
              description: 'Your account has been disabled by an administrator. Please contact support.',
            });
            setIsLoading(false);
            return;
          }
           // Check if the user has the required role
          const userRoles = userDoc.data()?.roles || [];
          if (!userRoles.includes(category)) {
             toast({
              variant: 'destructive',
              title: 'Access Denied',
              description: `Your account does not have the '${categoryTitle}' role. Please sign up for this role or contact an administrator.`,
            });
            await auth.signOut();
            setIsLoading(false);
            return;
          }
      } else {
        // This case implies an auth user exists without a corresponding Firestore document.
        toast({
          variant: 'destructive',
          title: 'Sign In Failed',
          description: 'User profile not found. Please sign up first.',
        });
        await auth.signOut();
        setIsLoading(false);
        return;
      }
      
      toast({
        title: 'Sign in successful!',
        description: 'Redirecting to your dashboard...',
      });
      // The useEffect will handle the redirection.

    } catch (error) {
      console.error('Sign in error:', error);
      let description = 'Invalid credentials.';

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = 'Invalid email or password. Please try again.';
            break;
          default:
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
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-background">
       <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
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
                  required
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
                    required
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
              {(category === 'class-representative' || category === 'senior') && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="specialId">
                    {category === 'class-representative' ? 'Unique CR ID' : 'Unique Senior ID'}
                  </Label>
                  <Input 
                    id="specialId" 
                    placeholder={
                        category === 'class-representative' 
                        ? 'Your Unique CR ID' 
                        : 'Your Unique Senior ID'
                    }
                    value={specialId}
                    onChange={(e) => setSpecialId(e.target.value)}
                    disabled={isLoading}
                    required
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
