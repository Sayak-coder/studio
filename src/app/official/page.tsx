'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/firebase/config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function OfficialLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccess = async () => {
    if (!accessCode.trim()) {
      toast({ 
        variant: 'destructive', 
        title: 'Missing Field', 
        description: 'Please enter the access code.' 
      });
      return;
    }
    
    setIsLoading(true);
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    try {
      // Access code validation
      const validCodes = {
        'catalyst2025': ['admin', 'official']
      };

      const roles = validCodes[accessCode as keyof typeof validCodes];
      
      if (!roles) {
        throw new Error('Invalid access code');
      }

      // Sign in anonymously
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Create user profile with roles
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        email: null,
        name: roles.includes('admin') ? 'Admin User' : 'Official User',
        roles: roles,
        accessCodeUsed: accessCode,
        createdAt: serverTimestamp(),
        status: 'active',
        disabled: false
      });

      // Wait a moment to ensure Firestore document is available
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Access Granted!',
        description: 'Redirecting to the official dashboard...',
      });

      router.push('/official/dashboard');

    } catch (error) {
      console.error('Official access error:', error);
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: error instanceof Error ? error.message : 'Invalid access code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-4">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Official Portal</h1>
        <p className="text-muted-foreground mt-2">Secure access for administrators and officials</p>
      </div>

      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Authentication Required</CardTitle>
          <CardDescription>
            Enter your unique access code to proceed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAccess();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <div className="relative">
                <Input
                  id="accessCode"
                  type={showCode ? 'text' : 'password'}
                  placeholder="Enter your access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            onClick={handleAccess} 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2" />
                Verifying...
              </>
            ) : (
              'Access Dashboard'
            )}
          </Button>
          <Button 
            variant="link" 
            onClick={() => router.push('/')} 
            className="text-sm text-muted-foreground"
            disabled={isLoading}
          >
            ← Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
