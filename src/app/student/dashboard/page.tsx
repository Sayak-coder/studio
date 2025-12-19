'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { 
    Book, 
    FileText, 
    LogOut, 
    Loader2, 
    BrainCircuit, 
    Video, 
    Star,
    LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { newlyAdded, currentYearPYQs, mostImportant, continueWatching, StudentContent } from './types';
import ContentRow from './content-row';

export default function StudentDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/signin/student');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    try {
      if (auth) {
        await auth.signOut();
        toast({
          title: 'Signed Out',
          description: 'You have been successfully signed out.',
        });
        router.push('/auth/signin/student');
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
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-card shadow-lg md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">EduBot</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <Button variant="ghost" className="w-full justify-start text-base gap-3">
            <LayoutDashboard />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start text-base gap-3">
            <FileText />
            Class Notes
          </Button>
          <Button variant="ghost" className="w-full justify-start text-base gap-3">
            <Book />
            PYQs
          </Button>
          <Button variant="ghost" className="w-full justify-start text-base gap-3">
            <Star />
            Important Questions
          </Button>
          <Button variant="ghost" className="w-full justify-start text-base gap-3">
            <Video />
            Video Links
          </Button>
        </nav>
        <div className="mt-auto p-4">
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-base gap-3">
            <LogOut />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm md:justify-end">
           <h1 className="text-2xl font-bold md:hidden">Student Dashboard</h1>
           <p className="text-sm text-muted-foreground">
            Welcome back, {user.displayName || 'Student'}!
          </p>
        </header>

        <div className="flex-1 space-y-12 p-4 md:p-8">
            <ContentRow title="Newly Added Notes" items={newlyAdded as StudentContent[]} />
            <ContentRow title="Current Year's PYQs" items={currentYearPYQs as StudentContent[]} />
            <ContentRow title="Most Important Questions" items={mostImportant as StudentContent[]} />
            <ContentRow title="Continue Watching" items={continueWatching as StudentContent[]} />
        </div>
      </main>
    </div>
  );
}
