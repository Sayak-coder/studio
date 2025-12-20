'use client';
import React, { useState } from 'react';
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
import { ImagePlaceholder, PlaceHolderImages } from '@/lib/placeholder-images';
import ContentRow from './content-row';
import ContentCard from './content-card';
import { ThemeToggle } from '@/components/theme-toggle';
import GlobalSearch from './global-search';
import { cn } from '@/lib/utils';

type Category = ImagePlaceholder['type'] | 'All';

export default function StudentDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [filteredData, setFilteredData] = useState<ImagePlaceholder[] | null>(null);

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
  
  const newlyAdded = PlaceHolderImages.filter(item => item.type === 'Class Notes');
  const currentYearPYQs = PlaceHolderImages.filter(item => item.type === 'PYQ');
  const mostImportant = PlaceHolderImages.filter(item => item.type === 'Important Question');
  const continueWatching = PlaceHolderImages.filter(item => item.type === 'Video');

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const sidebarButtons = [
    { name: 'Dashboard', icon: <LayoutDashboard />, href: '/student/dashboard', category: 'All' },
    { name: 'Class Notes', icon: <FileText />, href: '/student/notes', category: 'Class Notes' },
    { name: 'PYQs', icon: <Book />, href: '/student/pyq', category: 'PYQ' },
    { name: 'Important Questions', icon: <Star />, href: '/student/imp-questions', category: 'Important Question' },
    { name: 'Video Links', icon: <Video />, href: '/student/videos', category: 'Video' },
  ];

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
          {sidebarButtons.map(btn => (
             <Button 
                key={btn.name} 
                variant={router.pathname === btn.href ? 'secondary' : 'ghost'} 
                className="w-full justify-start text-base gap-3"
                asChild
            >
              <Link href={btn.href}>
                {btn.icon}
                {btn.name}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-base gap-3">
            <LogOut />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-hidden md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
          <div className="flex w-full max-w-lg items-center gap-4">
              <GlobalSearch onSearchChange={setFilteredData} />
          </div>
          <div className="flex items-center gap-4">
              <p className="hidden text-sm text-muted-foreground sm:block">
                Welcome back, {user.displayName || 'Student'}!
              </p>
              <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 space-y-4 p-4 md:p-8">
            {filteredData !== null ? (
              <div className="py-4">
                <h2 className="text-3xl font-bold tracking-tight">Search Results</h2>
                {filteredData.length > 0 ? (
                  <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                    {filteredData.map((item) => (
                       <div key={item.id} className="py-4">
                         <ContentCard item={item} />
                       </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                      <h3 className="text-2xl font-bold tracking-tight">No Results Found</h3>
                      <p className="text-muted-foreground mt-2">Try adjusting your search terms.</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <ContentRow title="Newly Added Notes" items={newlyAdded} />
                <ContentRow title="Current Year's PYQs" items={currentYearPYQs} />
                <ContentRow title="Most Important Questions" items={mostImportant} />
                <ContentRow title="Continue Watching" items={continueWatching} />
              </>
            )}
        </div>
      </main>
    </div>
  );
}
