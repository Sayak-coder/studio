'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Book, Bot, FileText, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AICategoryHelp from './category-help';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function StudentDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth();
  
  // State for user and loading status
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/auth/signin/student');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, router]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/auth/signin/student');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'Could not sign you out. Please try again.',
      });
    }
  };
  
  if (loading) {
    return (
       <div className="container mx-auto p-4 md:p-8">
          <Skeleton className="h-8 w-1/4 mb-8" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64 mt-12" />
      </div>
    )
  }

  if (!user) {
    // This will be briefly visible before the redirect in useEffect kicks in.
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 py-4 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-400">
            Welcome, {user.displayName || 'Student'}!
          </h1>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* PYQs Card */}
            <Card className="animated-gradient-border transform transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">PYQs</CardTitle>
                <Book className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access Previous Year Questions to ace your exams.
                </p>
              </CardContent>
            </Card>

            {/* Class Notes Card */}
            <Card className="animated-gradient-border transform transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Class Notes</CardTitle>
                <FileText className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Find all your class notes, compiled and verified.
                </p>
              </CardContent>
            </Card>

            {/* Important Questions Card */}
            <Card className="animated-gradient-border transform transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  Important Questions
                </CardTitle>
                <FileText className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A curated list of important questions for all subjects.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI-Powered Study Helper Section */}
          <div className="mt-12">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Bot className="h-8 w-8 text-primary" />
                  AI-Powered Study Helper
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AICategoryHelp />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
