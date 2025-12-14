import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const categoryMap: { [key: string]: string } = {
  'student': 'Student',
  'class-representative': 'Class Representative',
  'senior': 'Senior',
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="absolute top-4 left-4">
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portals
            </Link>
          </Button>
        </div>
        <Card className="shadow-soft-lg bg-card/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-primary tracking-tight">
                  {categoryTitle} Portal
                </CardTitle>
                 <CardDescription>
                    Sign in to continue or create a new account.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4 p-6">
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
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
