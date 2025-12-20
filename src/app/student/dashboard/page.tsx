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
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    Menu,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImagePlaceholder, PlaceHolderImages } from '@/lib/placeholder-images';
import ContentRow from './content-row';
import ContentCard from './content-card';
import { ThemeToggle } from '@/components/theme-toggle';
import GlobalSearch from './global-search';
import { cn } from '@/lib/utils';
import { useHorizontalScroll } from '@/hooks/use-horizontal-scroll';
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


const DashboardSection = ({ title, items }: { title: string, items: ImagePlaceholder[] }) => {
  const { scrollContainerRef, scrollLeft, scrollRight, canScrollLeft, canScrollRight } = useHorizontalScroll();
  
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={cn(
              'h-9 w-9 cursor-pointer rounded-full bg-background/80 backdrop-blur-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50',
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={cn(
              'h-9 w-9 cursor-pointer rounded-full bg-background/80 backdrop-blur-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50',
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <ContentRow items={items} scrollContainerRef={scrollContainerRef} />
    </section>
  );
};


export default function StudentDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [filteredData, setFilteredData] = useState<ImagePlaceholder[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
  
  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
    setFilteredData(null); // Reset search when a category is clicked
  };

  const getFilteredContent = () => {
    if (!selectedCategory) return null;
    const categoryTypeMap = {
      'notes': 'Class Notes',
      'pyq': 'PYQ',
      'imp-questions': 'Important Question',
      'videos': 'Video',
    };
    const type = categoryTypeMap[selectedCategory as keyof typeof categoryTypeMap];
    return PlaceHolderImages.filter(item => item.type === type);
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
    { name: 'Dashboard', icon: <LayoutDashboard />, href: '/student/dashboard', category: null },
    { name: 'Class Notes', icon: <FileText />, href: '/student/notes', category: 'notes' },
    { name: 'PYQs', icon: <Book />, href: '/student/pyq', category: 'pyq' },
    { name: 'Important Questions', icon: <Star />, href: '/student/imp-questions', category: 'imp-questions' },
    { name: 'Video Links', icon: <Video />, href: '/student/videos', category: 'videos' },
  ];

  const categoryContent = getFilteredContent();
  const categoryTitle = sidebarButtons.find(btn => btn.category === selectedCategory)?.name;
  
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
                variant={btn.href === '/student/dashboard' && selectedCategory === null ? 'secondary' : 'ghost'} 
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
      </>
  );
  
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
                variant={btn.href === '/student/dashboard' && selectedCategory === null ? 'secondary' : 'ghost'} 
                className="w-full justify-start text-base gap-3"
                asChild
            >
              <Link href={btn.href}>
                {btn.icon}
                {btn.name}
              </Link>
            </Button>
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-base gap-3">
            <LogOut />
            Sign Out
          </Button>
        </div>
      </>
  )


  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-card shadow-lg md:flex">
        <SidebarContent />
      </aside>

      {/* Main Content */}
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
             <h1 className="text-xl font-semibold md:hidden">EduBot</h1>
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

        <div className="flex-1 space-y-8 p-4 md:p-8">
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
            ) : selectedCategory !== null && categoryContent ? (
                 <div className="py-4">
                    <h2 className="text-3xl font-bold tracking-tight">{categoryTitle}</h2>
                    {categoryContent.length > 0 ? (
                      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {categoryContent.map((item) => (
                          <div key={item.id} className="py-4 flex justify-center">
                            <ContentCard item={item} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                          <h3 className="text-2xl font-bold tracking-tight">No Content Yet</h3>
                          <p className="text-muted-foreground mt-2">There's no content available in this category.</p>
                      </div>
                    )}
                 </div>
            ) : (
              <>
                <DashboardSection title="Newly Added" items={newlyAdded} />
                <DashboardSection title="Current PYQs" items={currentYearPYQs} />
                <DashboardSection title="Important" items={mostImportant} />
                <DashboardSection title="Continue Watching" items={continueWatching} />
              </>
            )}
        </div>
      </main>
    </div>
  );
}
