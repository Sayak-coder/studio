'use client';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const categoryMap: { [key: string]: string } = {
  'student': 'Student',
  'class-representative': 'Class Representative',
  'senior': 'Senior'
};

export default function SignUpPage() {
  const params = useParams();
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const categoryTitle = categoryMap[category];

  if (!categoryTitle) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="absolute top-4 left-4">
          <Button asChild variant="ghost">
            <Link href={`/help/${category}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl font-bold text-primary tracking-tight">
              Sign Up as {categoryTitle}
            </CardTitle>
             <CardDescription>
                Create a new account to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your full name" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="rollNo">Class Roll No.</Label>
              <Input id="rollNo" placeholder="Enter your class roll number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" placeholder="Create a User ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a password" />
            </div>
            {category === 'class-representative' && (
              <div className="space-y-2">
                <Label htmlFor="crId">Unique CR ID</Label>
                <Input id="crId" placeholder="Enter your Unique CR ID" />
              </div>
            )}
            <Button className="w-full">Sign Up</Button>
             <div className="text-center text-sm">
                Already have an account?{' '}
                <Link href={`/auth/signin/${category}`} className="underline text-primary">
                    Sign In
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
