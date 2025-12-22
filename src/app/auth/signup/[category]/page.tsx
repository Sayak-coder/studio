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
import { Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';


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
  const [collegeYear, setCollegeYear] = useState('');
  const [semester, setSemester] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category as string;
  const categoryTitle = category.replace(/-/g, ' ');

  useEffect(() => {
    // If the user is already logged in, try to redirect them to the dashboard.
    // The dashboard's own withAuth guard will handle role verification.
    if (!isUserLoading && user) {
        router.replace(`/${category}/dashboard`);
    }
  }, [user, isUserLoading, router, category]);

  const handleSignUp = async () => {
    // --- Form Validation ---
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
    
    setIsLoading(true);
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    try {
      // --- New User Creation ---
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      const userRef = doc(firestore, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        name: name,
        roles: [category], // Set roles as an array with the current category
        collegeYear: collegeYear || null,
        semester: semester || null,
        createdAt: serverTimestamp(),
        disabled: false
      });

      toast({
        title: 'Sign up successful!',
        description: "We're redirecting you to your dashboard.",
      });
      router.push(`/${category}/dashboard`);

    } catch (error) {
       if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
         // --- Existing User, Add New Role ---
         toast({
            title: 'Email Already In Use',
            description: 'Attempting to add new role to existing account...',
         });
         try {
            // Step 1: Sign in the user to verify ownership
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const userRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            // Step 2: If sign-in is successful and user doc exists, add the new role
            if (userDoc.exists()) {
                const currentRoles = userDoc.data().roles || [];
                if (!currentRoles.includes(category)) {
                    await updateDoc(userRef, {
                        roles: arrayUnion(category)
                    });
                    toast({
                        title: 'Role Added Successfully!',
                        description: `The '${categoryTitle}' role has been added to your account.`,
                    });
                    router.push(`/${category}/dashboard`);
                } else {
                     toast({
                        variant: 'destructive',
                        title: 'Role Already Exists',
                        description: `Your account already has the '${categoryTitle}' role.`,
                    });
                    router.push(`/${category}/dashboard`);
                }
            }
         } catch(signInError) {
             toast({
                variant: 'destructive',
                title: 'Authentication Failed',
                description: 'The email is registered, but the password provided is incorrect.',
             });
         }
       } else {
         // --- Other Creation Errors (e.g., weak password) ---
         console.error('Sign up error:', error);
         let description = 'An unexpected error occurred. Please try again.';
         if (error instanceof FirebaseError) {
           description = error.code === 'auth/weak-password'
             ? 'Your password is too weak. Please choose a stronger one.'
             : error.message;
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
  
  // While checking auth state, or if user is found (and redirection is happening), show loading.
  if (isUserLoading || user) {
     return (
       <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <LoadingSpinner className="mb-4" dotClassName="w-6 h-6" />
        <p className="mt-4 text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  // Only render the form if the user is not logged in.
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
            </div>
            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : 'Sign Up'}
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
