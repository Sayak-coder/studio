'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useUser, useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
// signInAnonymously removed - using open Firestore rules
import { 
    Book, 
    FileText, 
    LogOut, 
    BrainCircuit, 
    Video, 
    Star,
    LayoutDashboard,
    Menu,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImagePlaceholder, PlaceHolderImages } from '@/lib/placeholder-images';
import ContentCard from '../dashboard/content-card';
import { ThemeToggle } from '@/components/theme-toggle';
import GlobalSearch from '../dashboard/global-search';
import SubjectSection from '../dashboard/subject-section';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from '@/components/ui/loading-spinner';


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

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [filteredData, setFilteredData] = useState<ImagePlaceholder[] | null>(null);

  // Authentication skipped - using open Firestore rules for development

  const categorySlug = Array.isArray(params.category) ? params.category[0] : params.category;
  const categoryInfo = categoryMap[categorySlug] || { title: 'Content', type: 'Class Notes' };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'Could not sign you out. Please try again.',
      });
    }
  };

  const allContentForCategory = PlaceHolderImages.filter(item => item.type === categoryInfo.type);

  const contentBySubject = allContentForCategory.reduce((acc, item) => {
    if (!acc[item.subject]) {
      acc[item.subject] = [];
    }
    acc[item.subject].push(item);
    return acc;
  }, {} as { [key: string]: ImagePlaceholder[] });

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <LoadingSpinner className="mb-4" dotClassName="w-6 h-6" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
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
  
  const SidebarContent = () => (
      <>
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
      </>
  )

  const MobileSidebarContent = () => (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">EduBot</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {sidebarButtons.map(btn => (
          <SheetClose asChild key={btn.name}>
             <Button
              variant={ `/student/${categorySlug}` === btn.href ? 'secondary' : 'ghost'}
              className="w-full justify-start text-base gap-3"
              asChild
            >
              <Link href={btn.href}>{btn.icon}{btn.name}</Link>
            </Button>
          </SheetClose>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-base gap-3">
          <LogOut /> Sign Out
        </Button>
      </div>
    </>
  )


  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-card shadow-lg md:flex">
        <SidebarContent />
      </aside>

      <main className="flex-1 w-full overflow-hidden md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 md:px-6 backdrop-blur-sm">
           <div className="flex items-center gap-2">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-[280px] flex-col p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="sr-only">Main Menu</SheetTitle>
                </SheetHeader>
                 <MobileSidebarContent />
              </SheetContent>
            </Sheet>
           </div>
          <div className="hidden w-full max-w-lg items-center gap-4 md:flex">
            <GlobalSearch onSearchChange={setFilteredData} />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             {/* Mobile Search Trigger */}
              <Dialog>
                <DialogTrigger asChild>
                   <Button variant="ghost" size="icon" className="md:hidden">
                    <Search className="h-6 w-6" />
                    <span className="sr-only">Search</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="top-[25%]">
                  <DialogHeader>
                    <DialogTitle>Global Search</DialogTitle>
                  </DialogHeader>
                   <GlobalSearch onSearchChange={setFilteredData} />
                </DialogContent>
              </Dialog>
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
                <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredData.map((item) => (
                    <div key={item.id} className="py-4 flex justify-center">
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
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{categoryInfo.title}</h1>
              {Object.keys(contentBySubject).length > 0 ? (
                Object.keys(contentBySubject).map(subject => (
                  <SubjectSection
                    key={subject}
                    subject={subject}
                    items={contentBySubject[subject]}
                    category={categorySlug}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                  <h3 className="text-2xl font-bold tracking-tight">No Content Yet</h3>
                  <p className="text-muted-foreground mt-2">There's no content available in the "{categoryInfo.title}" category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
