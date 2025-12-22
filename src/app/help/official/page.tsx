'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/firebase/config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Eye, EyeOff } from 'lucide-react';
import { validateAccessCode, ValidateAccessCodeOutput } from '@/ai/flows/validate-access-code';

export default function OfficialHelpPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccess = async () => {
    if (!accessCode) {
      toast({ variant: 'destructive', title: 'Missing Field', description: 'Please enter the access code.' });
      return;
    }
    
    setIsLoading(true);
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    try {
      // 1. Securely validate the access code via the Genkit flow
      const validationResult: ValidateAccessCodeOutput = await validateAccessCode({ code: accessCode });

      if (!validationResult.isValid) {
        throw new Error(validationResult.reason || 'Unauthorized access code.');
      }
      
      const { roles } = validationResult;
      
      // 2. Sign in anonymously
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // 3. Create User Profile in Firestore
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        email: null, // No email for anonymous access
        name: `${roles[0].charAt(0).toUpperCase() + roles[0].slice(1)} User`, // e.g., "Official User"
        roles: roles,
        accessCodeUsed: accessCode,
        createdAt: serverTimestamp(),
        status: 'active',
        disabled: false
      });
      
      toast({
        title: 'Access Granted!',
        description: `Redirecting you to the ${roles[0]} dashboard.`,
      });

      // 4. Redirect to the appropriate dashboard
      router.push(`/${roles[0]}/dashboard`);

    } catch (error) {
      console.error('Official access error:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        description = error.message;
      }
      
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description,
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
          <CardTitle className="text-2xl capitalize">
            Official Portal
          </CardTitle>
          <CardDescription>
            Enter your unique access code to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAccess();
            }}
          >
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <div className="relative">
                  <Input
                    id="accessCode"
                    type={showCode ? 'text' : 'password'}
                    placeholder="Enter Access Code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                    required
                  />
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground"
                    onClick={() => setShowCode((prev) => !prev)}
                    disabled={isLoading}
                    aria-label={showCode ? 'Hide code' : 'Show code'}
                  >
                    {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : 'Gain Access'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-4 text-center">
           <Button
            variant="link"
            asChild
            className="text-primary"
          >
            <Link href="/">&larr; Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
