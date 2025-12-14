'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { firebaseApp } from '@/firebase/config';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'student';
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      await sendPasswordResetEmail(auth, email);

      toast({
        title: 'Check Your Email',
        description: `If an account exists for ${email}, a password reset link has been sent.`,
      });

      setTimeout(() => {
        router.push(`/auth/signin/${category}`);
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found') {
           description = 'No account found with this email address.';
        } else {
           description = error.message;
        }
      }
       toast({
        variant: 'destructive',
        title: 'Reset Failed',
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
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleResetPassword()}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleResetPassword} className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold hover:shadow-lg" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <Button variant="link" onClick={() => router.push(`/auth/signin/${category}`)} className="text-primary" disabled={isLoading}>
            &larr; Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
