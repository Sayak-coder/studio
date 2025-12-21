'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
} from 'firebase/firestore';
import {
  LogOut,
  Loader2,
  BrainCircuit,
  Menu,
  FilePlus,
  User,
  FileText,
  BookCopy,
  Star,
  LayoutDashboard,
  Search
} from 'lucide-react';

import { useFirebase, useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { deleteContent } from '@/firebase/firestore/content';

import { Content } from './types';
import ContentForm from './content-form';
import ContentRow from './content-row';
import GlobalSearch from './global-search';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ContentCard from './content-card';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { doc } from 'firebase/firestore';

type UserProfile = {
  roles: string[];
};

export default function CRDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingContentId, setDeletingContentId] = useState<string | null>(null);
  
  const [filteredData, setFilteredData] = useState<Content[] | null>(null);
  const [isRoleVerified, setIsRoleVerified] = useState(false);


  // Step 1: Get the current user's profile to verify their role
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userDocRef);

  // Step 2: Verify the role and redirect if not a CR
  useEffect(() => {
    if (isUserLoading || isLoadingProfile) return;

    if (!user) {
      router.push('/auth/signin/class-representative');
      return;
    }

    if (userProfile) {
      if (userProfile.roles.includes('class-representative')) {
        setIsRoleVerified(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: `You are not authorized to view this page. You are logged in with roles: ${userProfile.roles.join(', ')}.`,
        });
        router.push('/'); 
      }
    }
    // If there's no user profile, they'll be redirected by the !user check after auth state settles.
  }, [user, isUserLoading, userProfile, isLoadingProfile, router, toast]);

  // Step 3: Fetch content only if the role is verified
  const allContentQuery = useMemoFirebase(() => {
    if (!firestore || !isRoleVerified) return null;
    return query(collection(firestore, 'content'));
  }, [firestore, isRoleVerified]);

  const { data: allContents, isLoading: isLoadingAllContent } = useCollection<Content>(allContentQuery);
  
  const myContents = useMemo(() => allContents?.filter(c => c.authorId === user?.uid) || [], [allContents, user?.uid]);
  const otherContents = useMemo(() => allContents?.filter(c => c.authorId !== user?.uid) || [], [allContents, user?.uid]);

  const otherNotes = useMemo(() => otherContents?.filter(c => c.type === 'Class Notes') || [], [otherContents]);
  const otherPyqs = useMemo(() => otherContents?.filter(c => c.type === 'PYQ') || [], [otherContents]);
  const otherImpQs = useMemo(() => otherContents?.filter(c => c.type === 'Important Question') || [], [otherContents]);


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

  const handleAddNew = () => {
    setEditingContent(null);
    setIsFormOpen(true);
  }

  const handleEdit = (content: Content) => {
    setEditingContent(content);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingContentId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingContentId || !firestore) return;
    setIsDeleting(true);
    try {
      await deleteContent(firestore, deletingContentId);
      toast({ title: 'Content Deleted', description: 'The selected item has been successfully deleted.' });
      setIsDeleteDialogOpen(false);
      setDeletingContentId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Could not delete the content. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  }

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingContent(null);
  }

  if (isUserLoading || isLoadingProfile || !isRoleVerified) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }
  
  const SidebarContent = () => (
     <>
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">CR Dashboard</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
              <Button
                  variant='secondary'
                  className="w-full justify-start text-base gap-3"
                  asChild
              >
                <Link href="/class-representative/dashboard"><LayoutDashboard />Dashboard</Link>
              </Button>
               <Button
                  variant='ghost'
                  className="w-full justify-start text-base gap-3"
                  onClick={handleAddNew}
                >
                  <FilePlus />Add Content
                </Button>
                <Button
                  variant='ghost'
                  className="w-full justify-start text-base gap-3"
                  asChild
                >
                  <Link href="#my-contributions"><User />My Contributions</Link>
                </Button>
                <Button
                  variant='ghost'
                  className="w-full justify-start text-base gap-3"
                  asChild
                >
                  <Link href="#newly-added"><FileText />Newly Added Notes</Link>
                </Button>
                <Button
                  variant='ghost'
                  className="w-full justify-start text-base gap-3"
                  asChild
                >
                  <Link href="#pyqs"><BookCopy />Current PYQs</Link>
                </Button>
                <Button
                  variant='ghost'
                  className="w-full justify-start text-base gap-3"
                  asChild
                >
                  <Link href="#important-questions"><Star />Important Questions</Link>
                </Button>
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
           <span className="text-xl font-bold">CR Dashboard</span>
         </Link>
       </div>
       <nav className="flex-1 space-y-2 p-4">
             <SheetClose asChild>
               <Button
                   variant='secondary'
                   className="w-full justify-start text-base gap-3"
                   asChild
               >
                 <Link href="/class-representative/dashboard"><LayoutDashboard />Dashboard</Link>
               </Button>
             </SheetClose>
             <SheetClose asChild>
                <Button
                   variant='ghost'
                   className="w-full justify-start text-base gap-3"
                   onClick={handleAddNew}
                 >
                   <FilePlus />Add Content
                 </Button>
             </SheetClose>
             <SheetClose asChild>
                 <Button
                   variant='ghost'
                   className="w-full justify-start text-base gap-3"
                   asChild
                 >
                   <Link href="#my-contributions"><User />My Contributions</Link>
                 </Button>
             </SheetClose>
             <SheetClose asChild>
                 <Button
                   variant='ghost'
                   className="w-full justify-start text-base gap-3"
                   asChild
                 >
                   <Link href="#newly-added"><FileText />Newly Added Notes</Link>
                 </Button>
             </SheetClose>
             <SheetClose asChild>
                 <Button
                   variant='ghost'
                   className="w-full justify-start text-base gap-3"
                   asChild
                 >
                   <Link href="#pyqs"><BookCopy />Current PYQs</Link>
                 </Button>
             </SheetClose>
             <SheetClose asChild>
                 <Button
                   variant='ghost'
                   className="w-full justify-start text-base gap-3"
                   asChild
                 >
                   <Link href="#important-questions"><Star />Important Questions</Link>
                 </Button>
             </SheetClose>
       </nav>
       <div className="mt-auto p-4">
         <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-base gap-3">
           <LogOut /> Sign Out
         </Button>
       </div>
     </>
 );


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
                    <SheetHeader>
                      <SheetTitle>
                        <VisuallyHidden>Main Menu</VisuallyHidden>
                      </SheetTitle>
                    </SheetHeader>
                    <MobileSidebarContent />
                </SheetContent>
              </Sheet>
               <h1 className="text-xl font-semibold md:hidden">CR Dashboard</h1>
            </div>
          
            <div className="hidden w-full max-w-lg items-center gap-4 md:flex">
              <GlobalSearch onSearchChange={setFilteredData} allContent={allContents || []} />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
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
                   <GlobalSearch onSearchChange={setFilteredData} allContent={allContents || []} />
                </DialogContent>
              </Dialog>
              <p className="text-sm text-muted-foreground hidden sm:block">Welcome, {user.displayName || 'CR'}!</p>
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
                          onEdit={handleEdit}
                          onDelete={openDeleteDialog}
                          isEditable={true}
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
              <div id="my-contributions">
                <ContentRow
                  title="My Contributions"
                  items={myContents}
                  isLoading={isLoadingAllContent}
                  onEdit={handleEdit}
                  onDelete={openDeleteDialog}
                  isEditable={true}
                />
              </div>
              <div id="newly-added">
                <ContentRow 
                  title="Content by Other CRs"
                  items={otherContents}
                  isLoading={isLoadingAllContent}
                  onEdit={handleEdit}
                  onDelete={openDeleteDialog}
                  isEditable={true}
                />
              </div>
            </>
          )}
        </div>
      </main>
      
       <ContentForm 
          isOpen={isFormOpen}
          onClose={closeForm}
          editingContent={editingContent}
          user={user}
       />

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this piece of content from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Yes, delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
