import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const categoryMap: { [key: string]: string } = {
  'student': 'Student',
  'class-representative': 'Class Representative',
  'senior': 'Senior'
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
                    <Button size="lg" className="w-full">
                        <LogIn className="mr-2 h-5 w-5" />
                        Sign In
                    </Button>
                    <Button size="lg" variant="secondary" className="w-full">
                        <UserPlus className="mr-2 h-5 w-5" />
                        Sign Up
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
