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
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { firebaseApp } from '@/firebase/config';


export default function SignUpPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const categoryTitle = category.replace(/-/g, ' ');

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all required fields.',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, { displayName: name });

      toast({
        title: 'Sign up successful!',
        description: "We're redirecting you to your dashboard.",
      });

      if (category === 'student') {
        router.push('/student/dashboard');
      }
      // We can add logic for other categories later
    } catch (error) {
       console.error('Sign up error:', error);
       let description = 'An unexpected error occurred. Please try again.';
       if (error instanceof FirebaseError) {
         if (error.code === 'auth/email-already-in-use') {
           description = 'This email is already registered. Please sign in instead.';
         } else if (error.code === 'auth/weak-password') {
            description = 'Your password is too weak. Please choose a stronger one.';
         }
          else {
           description = error.message;
         }
       }
        toast({
         variant: 'destructive',
         title: 'Sign Up Failed',
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
            Create {categoryTitle} Account
          </CardTitle>
          <CardDescription>
            Join the EduBot community. It's quick and easy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
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
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Create a username"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="rollNo">Class Roll No.</Label>
                <Input id="rollNo" placeholder="e.g., 21CS01" />
              </div>
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
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {category === 'class-representative' && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="crId">Unique CR ID</Label>
                  <Input
                    id="crId"
                    placeholder="Provided by your institution"
                  />
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-4">
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link
              href={`/auth/signin/${category}`}
              className="font-medium text-primary hover:underline"
            >
              Sign In
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
