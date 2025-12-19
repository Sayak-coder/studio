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
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { firebaseApp } from '@/firebase/config';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useUser } from '@/firebase';
import { Loader2, Eye, EyeOff } from 'lucide-react';


export default function SignUpPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  
  const [name, setName] = useState('');
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

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all required fields.',
      });
      return;
    }

    if (category === 'class-representative' && specialId !== 'cr_edubot25') {
       toast({
        variant: 'destructive',
        title: 'Invalid ID',
        description: 'Please enter the correct CR ID to sign up.',
      });
      return;
    }
    
    if (category === 'senior' && specialId !== 'sen_edubot25') {
       toast({
        variant: 'destructive',
        title: 'Invalid ID',
        description: 'Please enter the correct Senior ID to sign up.',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      const firestore = getFirestore(firebaseApp);

      // Check if user email is already registered and blocked
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const existingUserDoc = querySnapshot.docs[0];
        if (existingUserDoc.data()?.disabled) {
          toast({
            variant: 'destructive',
            title: 'Account Disabled',
            description: 'This email is associated with a disabled account. Please contact support.',
          });
          setIsLoading(false);
          return;
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, { displayName: name });
      
      const userRef = doc(firestore, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        name: name,
        role: category,
      });

      toast({
        title: 'Sign up successful!',
        description: "We're redirecting you to your dashboard.",
      });

      // Redirection is now handled by the useEffect hook
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
                    placeholder="Create a strong password"
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
                    placeholder="Provided by your institution"
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
                    placeholder="Provided by your institution"
                    value={specialId}
                    onChange={(e) => setSpecialId(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full mt-4"
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
