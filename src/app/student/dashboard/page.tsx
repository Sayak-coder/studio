'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirebase, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
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
    ChevronLeft,
    ChevronRight,
    Menu,
    Search,
    Home,
    File,
    ChevronDown,
    GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { ThemeToggle } from '@/components/theme-toggle';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import withAuth from '@/hoc/withAuth';
import { AcademicCalendar } from '@/components/academic-calendar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import GlobalSearch from '@/app/class-representative/dashboard/global-search';
import { Content } from '@/app/class-representative/dashboard/types';
import ContentCard from '@/app/class-representative/dashboard/content-card';
import ContentRow from '@/app/class-representative/dashboard/content-row';
import { collection, query } from 'firebase/firestore';

// Stream configuration
const STREAMS = [
  { id: 'cse', name: 'CSE', fullName: 'Computer Science & Engineering' },
  { id: 'cse-aiml', name: 'CSE-AIML', fullName: 'CSE (AI & Machine Learning)' },
  { id: 'ece', name: 'ECE', fullName: 'Electronics & Communication Engineering' },
  { id: 'ee', name: 'EE', fullName: 'Electrical Engineering' },
  { id: 'it', name: 'IT', fullName: 'Information Technology' },
] as const;


function StudentDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();

  // Authentication skipped - using open Firestore rules for development

  const [filteredData, setFilteredData] = useState<Content[] | null>(null);
  const [isStreamMenuOpen, setIsStreamMenuOpen] = useState(false);

  const allContentQuery = useMemoFirebase(() => {
    // Open access - no auth required with open Firestore rules
    if (!firestore) return null;
    return query(collection(firestore, 'content'));
  }, [firestore]);

  const { data: allContents, isLoading: isLoadingAllContent } = useCollection<Content>(allContentQuery);

  const notes = useMemo(() => (allContents || []).filter(c => c.type === 'Class Notes'), [allContents]);
  const pyqs = useMemo(() => (allContents || []).filter(c => c.type === 'PYQ'), [allContents]);
  const importantQuestions = useMemo(() => (allContents || []).filter(c => c.type === 'Important Question'), [allContents]);

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      toast({ title: 'Session Ended', description: 'You have been signed out.' });
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({ variant: 'destructive', title: 'Sign Out Failed', description: 'Could not sign you out.' });
    }
  };


  const SidebarContent = () => (
     <>
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Student Dashboard</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <Button variant="secondary" className="w-full justify-start text-base gap-3">
            <Home />Dashboard
          </Button>

          <Collapsible open={isStreamMenuOpen} onOpenChange={setIsStreamMenuOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-base gap-3">
                <span className="flex items-center gap-3"><GraduationCap />Select Stream</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isStreamMenuOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-1">
              {STREAMS.map((stream) => (
                <Collapsible key={stream.id}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between pl-8 text-sm gap-2"
                    >
                      {stream.name}
                      <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-1 space-y-1">
                    <Link href={`/student/stream/${stream.id}`}>
                      <Button variant="ghost" className="w-full justify-start pl-12 text-xs gap-2">
                        All Years
                      </Button>
                    </Link>
                    {[1, 2, 3, 4].map((year) => (
                      <Link key={year} href={`/student/stream/${stream.id}?year=${year}`}>
                        <Button variant="ghost" className="w-full justify-start pl-12 text-xs gap-2">
                          {year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                        </Button>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </nav>
        <div className="mt-auto p-4">
           <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-base gap-3">
             <LogOut /> Sign Out
          </Button>
        </div>
      </>
  );

  const MobileSidebarContent = () => (
    <>
       <div className="flex h-16 items-center border-b px-6">
         <Link href="/" className="flex items-center gap-2 font-semibold">
           <BrainCircuit className="h-8 w-8 text-primary" />
           <span className="text-xl font-bold">Student Dashboard</span>
         </Link>
       </div>
       <nav className="flex-1 space-y-2 p-4">
            <Button variant="secondary" className="w-full justify-start text-base gap-3">
              <Home />Dashboard
            </Button>

            <Collapsible open={isStreamMenuOpen} onOpenChange={setIsStreamMenuOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-base gap-3">
                  <span className="flex items-center gap-3"><GraduationCap />Select Stream</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isStreamMenuOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-1">
                {STREAMS.map((stream) => (
                  <Collapsible key={stream.id}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between pl-8 text-sm gap-2"
                      >
                        {stream.name}
                        <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-1 space-y-1">
                      <SheetClose asChild>
                        <Link href={`/student/stream/${stream.id}`}>
                          <Button variant="ghost" className="w-full justify-start pl-12 text-xs gap-2">
                            All Years
                          </Button>
                        </Link>
                      </SheetClose>
                      {[1, 2, 3, 4].map((year) => (
                        <SheetClose asChild key={year}>
                          <Link href={`/student/stream/${stream.id}?year=${year}`}>
                            <Button variant="ghost" className="w-full justify-start pl-12 text-xs gap-2">
                              {year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                            </Button>
                          </Link>
                        </SheetClose>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CollapsibleContent>
            </Collapsible>
       </nav>
       <div className="mt-auto p-4">
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-base gap-3">
             <LogOut /> Sign Out
          </Button>
       </div>
     </>
 );

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <LoadingSpinner className="mb-4" dotClassName="w-6 h-6" />
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
       <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-card shadow-lg md:flex">
          <SidebarContent />
      </aside>

      <main className="flex-1 w-full overflow-y-auto md:pl-64">
         <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 md:px-6 backdrop-blur-sm">
           <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex w-[280px] flex-col p-0">
                    <VisuallyHidden>
                      <SheetTitle>Navigation Menu</SheetTitle>
                    </VisuallyHidden>
                    <MobileSidebarContent />
                </SheetContent>
              </Sheet>
               <h1 className="text-xl font-semibold md:hidden">Student Dashboard</h1>
            </div>
          
            <div className="hidden w-full max-w-lg items-center gap-4 md:flex">
              <GlobalSearch onSearchChange={setFilteredData} allContent={allContents || []} />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <AcademicCalendar />
              <p className="text-sm text-muted-foreground hidden sm:block">Welcome, {user?.displayName || 'Student'}</p>
              <ThemeToggle />
            </div>
        </header>

        <div className="flex-1 space-y-12 p-4 md:p-8">
          {filteredData !== null ? (
            <div className="py-4">
              <h2 className="text-3xl font-bold tracking-tight">Search Results</h2>
              {filteredData.length > 0 ? (
                 <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredData.map((item) => (
                      <div key={item.id} className="py-4 flex justify-center">
                        <ContentCard 
                          item={item} 
                        />
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
              <div id="notes">
                <ContentRow
                  title="Class Notes"
                  items={notes}
                  isLoading={isLoadingAllContent}
                />
              </div>
              <div id="pyqs">
                <ContentRow 
                  title="Previous Year Questions"
                  items={pyqs}
                  isLoading={isLoadingAllContent}
                />
              </div>
              <div id="imp-questions">
                <ContentRow 
                  title="Important Questions"
                  items={importantQuestions}
                  isLoading={isLoadingAllContent}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
