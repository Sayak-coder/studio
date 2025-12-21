'use client';
import { useRouter } from 'next/navigation';
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
import { firebaseApp } from '@/firebase/config';
import { Loader2 } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { ThemeToggle } from '@/components/theme-toggle';

// IMPORTANT: For a real application, these should be managed securely,
// for example, as environment variables or fetched from a secure config.
// For this demonstration, we'll use a hardcoded but non-obvious account.
const OFFICIAL_EMAIL = 'admin.official@edubot.local';
const OFFICIAL_PASSWORD = 'supersecretpassword!23';

export default function OfficialSignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    // We check against the pre-defined credentials for this special portal.
    if (email !== OFFICIAL_EMAIL || password !== OFFICIAL_PASSWORD) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'The credentials you entered are incorrect.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      await setPersistence(auth, browserLocalPersistence);
      
      // Sign in with the verified credentials
      await signInWithEmailAndPassword(auth, email, password);

      toast({
        title: 'Access Granted!',
        description: 'Redirecting to the Official Dashboard...',
      });
      
      router.push('/official/dashboard');

    } catch (error) {
      console.error('Official sign-in error:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error instanceof FirebaseError) {
         // This can happen if the official user hasn't been created in Firebase Auth yet.
        if(error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            description = "Official account not provisioned. Please contact your administrator."
        } else {
            description = error.message;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: description,
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Official Portal
          </CardTitle>
          <CardDescription>
            Enter your administrative credentials to access the dashboard.
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
                <Label htmlFor="email">Official Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="official@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
               <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password" 
                  placeholder="Enter official password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Enter Portal'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-4">
           <Button
            variant="link"
            onClick={() => router.push('/')}
            className="text-primary"
            disabled={isLoading}
          >
            &larr; Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
