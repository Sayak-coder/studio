'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SignInPage() {
  const params = useParams();
  const router = useRouter();
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const categoryTitle = category.replace(/-/g, ' ');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-secondary to-background">
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl capitalize">Sign In to {categoryTitle} Portal</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="userId">User ID</Label>
                <Input id="userId" placeholder="Your User ID" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Your Password" />
              </div>
               {category === 'class-representative' && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="crId">Unique CR ID</Label>
                  <Input id="crId" placeholder="Your Unique CR ID" />
                </div>
              )}
               <div className="text-sm">
                <Link href="#" className="font-medium text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:shadow-lg">Sign In</Button>
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link href={`/auth/signup/${category}`} className="font-medium text-primary hover:underline">
              Sign Up
            </Link>
          </p>
           <Button variant="link" onClick={() => router.back()} className="text-primary">
            &larr; Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
