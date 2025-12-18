'use client';

import React from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    BookCopy, 
    FileText, 
    LogOut, 
    Loader2, 
    Calendar,
    HelpCircle,
    Award,
    BrainCircuit
} from 'lucide-react';

import { useUser, useFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const dashboardItems = [
    {
        title: "Class Notes",
        description: "Access and manage verified class notes.",
        icon: <BookCopy className="h-8 w-8 text-primary" />,
        href: "/class-representative/notes"
    },
    {
        title: "Important Questions",
        description: "Curate and share key questions for exams.",
        icon: <HelpCircle className="h-8 w-8 text-primary" />,
        href: "/class-representative/important-questions"
    },
    {
        title: "PYQ",
        description: "Upload and organize previous year question papers.",
        icon: <FileText className="h-8 w-8 text-primary" />,
        href: "/class-representative/pyq"
    },
    {
        title: "Academic Calendar",
        description: "View and manage important academic dates.",
        icon: <Calendar className="h-8 w-8 text-primary" />,
        href: "/class-representative/calendar"
    },
    {
        title: "MAR Point Resources",
        description: "Organize resources for Mandatory Additional Requirements.",
        icon: <Award className="h-8 w-8 text-primary" />,
        href: "/class-representative/mar-resources"
    }
];

export default function CRDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/signin/class-representative');
    }
    // You might want to add role verification here as well
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    try {
      if (auth) {
        await auth.signOut();
        toast({
          title: 'Signed Out',
          description: 'You have been successfully signed out.',
        });
        router.push('/auth/signin/class-representative');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'Could not sign you out. Please try again.',
      });
    }
  };
  
  if (isUserLoading || !user) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
           <p className="ml-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 py-4 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BrainCircuit className="h-7 w-7 text-primary" />
              <span className="text-xl hidden sm:inline-block">EduBot CR Portal</span>
            </Link>
            <div className="flex items-center gap-4">
                 <p className="text-sm text-muted-foreground hidden sm:block">
                    Welcome, {user.displayName || 'CR'}!
                </p>
                <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="container mx-auto">
             <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">CR Dashboard</h1>
                <p className="text-muted-foreground mt-2">Manage all your academic resources from one place.</p>
            </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dashboardItems.map((item) => (
              <Link href={item.href} key={item.title} passHref>
                <Card className="animated-gradient-border group transform cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                    {item.icon}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
