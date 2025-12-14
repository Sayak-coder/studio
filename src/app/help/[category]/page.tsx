import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const categoryMap: { [key: string]: string } = {
  'student': 'Student',
  'class-representative': 'Class Representative',
  'senior': 'Senior',
  'officials': 'Official'
};

export function generateStaticParams() {
  return Object.keys(categoryMap).map((key) => ({
    category: key,
  }));
}

export default function AuthPage({ params }: { params: { category: string } }) {
  const categoryTitle = categoryMap[params.category];

  if (!categoryTitle) {
    notFound();
  }
  
  if (params.category === 'officials') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="absolute top-4 left-4">
            <Button asChild variant="ghost">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Link>
            </Button>
          </div>
          <Card className="shadow-lg">
              <CardHeader className="text-center">
                  <CardTitle className="font-headline text-3xl font-bold text-primary tracking-tight">
                    Official Access
                  </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6 pt-2 pb-8">
                  <p className="text-center text-lg text-muted-foreground">
                    Please enter the Unique Official ID to proceed.
                  </p>
                  <div className="w-full flex flex-col space-y-4 px-4">
                      <input
                        type="password"
                        placeholder="Unique Official ID"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      />
                      <Button size="lg" className="w-full">
                          Submit
                      </Button>
                  </div>
              </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="absolute top-4 left-4">
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
        </div>
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl font-bold text-primary tracking-tight">
                Welcome, {categoryTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 pt-2 pb-8">
                <p className="text-center text-lg text-muted-foreground">
                Sign in to continue or sign up for a new account.
                </p>
                <div className="w-full flex flex-col space-y-4">
                    <Button size="lg" asChild className="w-full">
                      <Link href={`/auth/signin/${params.category}`}>
                        <LogIn className="mr-2 h-5 w-5" />
                        Sign In
                      </Link>
                    </Button>
                    <Button size="lg" variant="secondary" asChild className="w-full">
                      <Link href={`/auth/signup/${params.category}`}>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Sign Up
                      </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
