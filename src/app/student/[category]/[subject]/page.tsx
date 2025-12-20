'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
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
    LayoutDashboard,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImagePlaceholder, PlaceHolderImages } from '@/lib/placeholder-images';
import ContentCard from '../../dashboard/content-card';
import { ThemeToggle } from '@/components/theme-toggle';

type CategoryInfo = {
  title: string;
  type: ImagePlaceholder['type'];
};

const categoryMap: { [key: string]: CategoryInfo } = {
  'notes': { title: 'Class Notes', type: 'Class Notes' },
  'pyq': { title: 'Previous Year Questions', type: 'PYQ' },
  'imp-questions': { title: 'Important Questions', type: 'Important Question' },
  'videos': { title: 'Video Links', type: 'Video' },
};

export default function SubjectPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();

  const categorySlug = Array.isArray(params.category) ? params.category[0] : params.category;
  const subjectSlug = Array.isArray(params.subject) ? params.subject[0] : params.subject;
  
  const categoryInfo = categoryMap[categorySlug] || { title: 'Content', type: 'Class Notes' };
  const subjectName = subjectSlug.replace(/-/g, ' ');

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/signin/student');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    if (!auth) return;
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

  const contentForSubject = PlaceHolderImages.filter(item => 
    item.type === categoryInfo.type && 
    item.subject.toLowerCase().replace(/\s+/g, '-') === subjectSlug
  );

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const sidebarButtons = [
    { name: 'Dashboard', icon: <LayoutDashboard />, href: '/student/dashboard' },
    { name: 'Class Notes', icon: <FileText />, href: '/student/notes' },
    { name: 'PYQs', icon: <Book />, href: '/student/pyq' },
    { name: 'Important Questions', icon: <Star />, href: '/student/imp-questions' },
    { name: 'Video Links', icon: <Video />, href: '/student/videos' },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
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
              variant={ `/student/${categorySlug}` === btn.href ? 'secondary' : 'ghost'}
              className="w-full justify-start text-base gap-3"
              asChild
            >
              <Link href={btn.href}>{btn.icon}{btn.name}</Link>
            </Button>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-base gap-3">
            <LogOut /> Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 w-full overflow-y-auto md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-muted-foreground sm:block">
              Welcome back, {user.displayName || 'Student'}!
            </p>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 space-y-4 p-4 md:p-8">
            <h1 className="text-4xl font-bold tracking-tight capitalize">
                {subjectName} {categoryInfo.title}
            </h1>
            {contentForSubject.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                    {contentForSubject.map((item) => (
                        <div key={item.id} className="py-4">
                            <ContentCard item={item} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">No Content Found</h3>
                    <p className="text-muted-foreground mt-2">There is no content available for this subject in this category.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
