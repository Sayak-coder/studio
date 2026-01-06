'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useUser, useFirebase, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
// signInAnonymously removed - using open Firestore rules
import { collection, query, where } from 'firebase/firestore';
import { 
    LogOut, 
    BrainCircuit, 
    Menu,
    Home,
    ChevronDown,
    GraduationCap,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { ThemeToggle } from '@/components/theme-toggle';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import GlobalSearch from '@/app/class-representative/dashboard/global-search';
import { Content } from '@/app/class-representative/dashboard/types';
import ContentCard from '@/app/class-representative/dashboard/content-card';
import ContentRow from '@/app/class-representative/dashboard/content-row';

// Stream configuration
export const STREAMS = [
  { id: 'cse', name: 'CSE', fullName: 'Computer Science & Engineering' },
  { id: 'cse-aiml', name: 'CSE-AIML', fullName: 'CSE (AI & Machine Learning)' },
  { id: 'ece', name: 'ECE', fullName: 'Electronics & Communication Engineering' },
  { id: 'ee', name: 'EE', fullName: 'Electrical Engineering' },
  { id: 'it', name: 'IT', fullName: 'Information Technology' },
] as const;

export type StreamId = typeof STREAMS[number]['id'];

function getStreamInfo(streamId: string) {
  return STREAMS.find(s => s.id === streamId) || { id: streamId, name: streamId.toUpperCase(), fullName: streamId.toUpperCase() };
}

export default function StreamPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();

  const streamId = Array.isArray(params.stream) ? params.stream[0] : params.stream || '';
  const streamInfo = getStreamInfo(streamId);

  // Get year from URL query parameter
  const yearParam = searchParams.get('year');
  const initialYear = yearParam ? parseInt(yearParam, 10) : null;

  // Authentication skipped - using open Firestore rules for development

  const [filteredData, setFilteredData] = useState<Content[] | null>(null);
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const [isStreamMenuOpen, setIsStreamMenuOpen] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(initialYear);

  // Update selectedYear when URL changes
  React.useEffect(() => {
    const yearParam = searchParams.get('year');
    setSelectedYear(yearParam ? parseInt(yearParam, 10) : null);
  }, [searchParams]);

  // Query content filtered by stream/category
  const streamContentQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Filter by stream category - no auth required with open Firestore rules
    return query(
      collection(firestore, 'content'),
      where('category', '==', streamInfo.name)
    );
  }, [firestore, streamInfo.name]);

  const { data: streamContents, isLoading: isLoadingContent } = useCollection<Content>(streamContentQuery);
  
  // Filter content by selected year
  const yearFilteredContent = useMemo(() => {
    if (!streamContents) return [];
    if (selectedYear === null) return streamContents;
    return streamContents.filter(c => c.year === selectedYear);
  }, [streamContents, selectedYear]);

  const notes = useMemo(() => yearFilteredContent.filter(c => c.type === 'Class Notes'), [yearFilteredContent]);
  const pyqs = useMemo(() => yearFilteredContent.filter(c => c.type === 'PYQ'), [yearFilteredContent]);
  const importantQuestions = useMemo(() => yearFilteredContent.filter(c => c.type === 'Important Question'), [yearFilteredContent]);

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
            <span className="text-xl font-bold">{streamInfo.name}</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <Link href="/student/dashboard">
            <Button variant="ghost" className="w-full justify-start text-base gap-3">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <Collapsible open={isYearMenuOpen} onOpenChange={setIsYearMenuOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="secondary" className="w-full justify-between text-base gap-3">
                <span className="flex items-center gap-3"><Home />Filter by Year</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isYearMenuOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              <Button
                variant={selectedYear === null ? 'default' : 'ghost'}
                className="w-full justify-start pl-8 text-sm gap-2"
                onClick={() => setSelectedYear(null)}
              >
                All Years
              </Button>
              {[1, 2, 3, 4].map((year) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? 'default' : 'ghost'}
                  className="w-full justify-start pl-8 text-sm gap-2"
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                  {year === 1 && 'st'} {year === 2 && 'nd'} {year === 3 && 'rd'} {year === 4 && 'th'} Year
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={isStreamMenuOpen} onOpenChange={setIsStreamMenuOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-base gap-3">
                <span className="flex items-center gap-3"><GraduationCap />Other Streams</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isStreamMenuOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {STREAMS.map((stream) => (
                <Link key={stream.id} href={`/student/stream/${stream.id}`}>
                  <Button
                    variant={streamId === stream.id ? 'default' : 'ghost'}
                    className="w-full justify-start pl-8 text-sm gap-2"
                  >
                    {stream.name}
                  </Button>
                </Link>
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
           <span className="text-xl font-bold">{streamInfo.name}</span>
         </Link>
       </div>
       <nav className="flex-1 space-y-2 p-4">
          <SheetClose asChild>
            <Link href="/student/dashboard">
              <Button variant="ghost" className="w-full justify-start text-base gap-3">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </SheetClose>

          <Collapsible open={isYearMenuOpen} onOpenChange={setIsYearMenuOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="secondary" className="w-full justify-between text-base gap-3">
                <span className="flex items-center gap-3"><Home />Filter by Year</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isYearMenuOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              <SheetClose asChild>
                <Button
                  variant={selectedYear === null ? 'default' : 'ghost'}
                  className="w-full justify-start pl-8 text-sm gap-2"
                  onClick={() => setSelectedYear(null)}
                >
                  All Years
                </Button>
              </SheetClose>
              {[1, 2, 3, 4].map((year) => (
                <SheetClose asChild key={year}>
                  <Button
                    variant={selectedYear === year ? 'default' : 'ghost'}
                    className="w-full justify-start pl-8 text-sm gap-2"
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                    {year === 1 && 'st'} {year === 2 && 'nd'} {year === 3 && 'rd'} {year === 4 && 'th'} Year
                  </Button>
                </SheetClose>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={isStreamMenuOpen} onOpenChange={setIsStreamMenuOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-base gap-3">
                <span className="flex items-center gap-3"><GraduationCap />Other Streams</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isStreamMenuOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {STREAMS.map((stream) => (
                <SheetClose asChild key={stream.id}>
                  <Link href={`/student/stream/${stream.id}`}>
                    <Button
                      variant={streamId === stream.id ? 'default' : 'ghost'}
                      className="w-full justify-start pl-8 text-sm gap-2"
                    >
                      {stream.name}
                    </Button>
                  </Link>
                </SheetClose>
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
               <h1 className="text-xl font-semibold md:hidden">{streamInfo.name}</h1>
            </div>
          
            <div className="hidden w-full max-w-lg items-center gap-4 md:flex">
              <GlobalSearch onSearchChange={setFilteredData} allContent={streamContents || []} />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <p className="text-sm text-muted-foreground hidden sm:block">Welcome, {user?.displayName || 'Student'}</p>
              <ThemeToggle />
            </div>
        </header>

        <div className="flex-1 space-y-12 p-4 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{streamInfo.fullName}</h1>
            <p className="text-muted-foreground mt-2">Browse all content for {streamInfo.name} stream</p>
          </div>

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
                  isLoading={isLoadingContent}
                />
              </div>
              <div id="pyqs">
                <ContentRow 
                  title="Previous Year Questions"
                  items={pyqs}
                  isLoading={isLoadingContent}
                />
              </div>
              <div id="imp-questions">
                <ContentRow 
                  title="Important Questions"
                  items={importantQuestions}
                  isLoading={isLoadingContent}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
