'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'student';
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleResetPassword = () => {
    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
      });
      return;
    }

    // Placeholder for actual password reset logic (e.g., Firebase)
    console.log(`Password reset requested for email: ${email}`);

    toast({
      title: 'Check Your Email',
      description: `If an account exists for ${email}, a password reset link has been sent.`,
    });

    // Redirect back to the sign-in page after a short delay
    setTimeout(() => {
      router.push(`/auth/signin/${category}`);
    }, 2000);
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
                onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleResetPassword} className="w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:shadow-lg">
            Send Reset Link
          </Button>
          <Button variant="link" onClick={() => router.push(`/auth/signin/${category}`)} className="text-primary">
            &larr; Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
