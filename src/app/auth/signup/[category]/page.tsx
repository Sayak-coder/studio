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
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { firebaseApp } from '@/firebase/config';
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@/firebase';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';


export default function SignUpPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [specialId, setSpecialId] = useState('');
  const [collegeYear, setCollegeYear] = useState('');
  const [semester, setSemester] = useState('');
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
    }
  }, [user, isUserLoading, router, category]);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all required fields.',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
      });
      return;
    }

    if (category === 'class-representative' && specialId !== 'cr-edubot25') {
       toast({
        variant: 'destructive',
        title: 'Invalid ID',
        description: 'Please enter the correct CR ID to sign up.',
      });
      return;
    }
    
    if (category === 'senior' && specialId !== 'sen-edubot25') {
       toast({
        variant: 'destructive',
        title: 'Invalid ID',
        description: 'Please enter the correct Senior ID to sign up.',
      });
      return;
    }
    
    setIsLoading(true);
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);
    try {
      // First, try to create a new user.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, { displayName: name });
      
      const userRef = doc(firestore, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        name: name,
        roles: [category], // Use 'roles' array
        collegeYear: collegeYear || null,
        semester: semester || null,
        createdAt: serverTimestamp()
      });

      toast({
        title: 'Sign up successful!',
        description: "We're redirecting you to your dashboard.",
      });

    } catch (error) {
       if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
         // This email already exists. Try to sign them in and update their role.
         try {
           await signInWithEmailAndPassword(auth, email, password);
           const userRef = doc(firestore, 'users', auth.currentUser!.uid);
           
           // Add the new role to the 'roles' array.
           await updateDoc(userRef, {
             roles: arrayUnion(category)
           });
           
           toast({
              title: 'Role Added!',
              description: `You have successfully been registered as a ${categoryTitle}.`,
            });
           
         } catch (signInError) {
           // This could be a wrong password for an existing account.
           toast({
              variant: 'destructive',
              title: 'Sign Up Failed',
              description: 'This email is already registered. Please check your password or sign in.',
            });
         }
       } else {
         // Handle other errors (weak password, etc.)
         console.error('Sign up error:', error);
         let description = 'An unexpected error occurred. Please try again.';
         if (error instanceof FirebaseError) {
           if (error.code === 'auth/weak-password') {
              description = 'Your password is too weak. Please choose a stronger one.';
           } else {
             description = error.message;
           }
         }
          toast({
           variant: 'destructive',
           title: 'Sign Up Failed',
           description,
         });
       }
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
                  required
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
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="collegeYear">College Year</Label>
                <Input
                  id="collegeYear"
                  placeholder="e.g., 2nd Year"
                  value={collegeYear}
                  onChange={(e) => setCollegeYear(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  placeholder="e.g., 4th Semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
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
               <div className="flex flex-col space-y-1.5">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                    required
                  />
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                    placeholder="Provided by your institution"
                    value={specialId}
                    onChange={(e) => setSpecialId(e.target.value)}
                    disabled={isLoading}
                    required
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
