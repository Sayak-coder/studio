'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where
} from 'firebase/firestore';
import { User } from 'firebase/auth';

import {
  Loader2,
  BrainCircuit,
  Menu,
  FilePlus,
  Home,
  User as UserIcon,
  Users,
  LogOut,
} from 'lucide-react';

import { useCollection, useFirestore, useMemoFirebase, useUser, useFirebase } from '@/firebase';
import { deleteContent } from '@/firebase/firestore/content';
import withAuth from '@/hoc/withAuth';

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
} from '@/components/ui/sheet';
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
import Link from 'next/link';


function CRDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { auth } = useFirebase();
  const { user } = useUser(); // Guaranteed to be available by withAuth

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingContentId, setDeletingContentId] = useState<string | null>(null);
  
  const [filteredData, setFilteredData] = useState<Content[] | null>(null);
  const [view, setView] = useState<'all' | 'my' | 'others'>('all');

  const allContentQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'content'));
  }, [firestore]);

  const { data: allContents, isLoading: isLoadingAllContent } = useCollection<Content>(allContentQuery);
  
  const myContributions = useMemo(() => allContents?.filter(c => c.authorId === user?.uid) || [], [allContents, user]);
  const othersContributions = useMemo(() => allContents?.filter(c => c.authorId !== user?.uid) || [], [allContents, user]);

  const notes = useMemo(() => (view === 'all' ? allContents : view === 'my' ? myContributions : othersContributions)?.filter(c => c.type === 'Class Notes') || [], [allContents, myContributions, othersContributions, view]);
  const pyqs = useMemo(() => (view === 'all' ? allContents : view === 'my' ? myContributions : othersContributions)?.filter(c => c.type === 'PYQ') || [], [allContents, myContributions, othersContributions, view]);
  const importantQuestions = useMemo(() => (view === 'all' ? allContents : view === 'my' ? myContributions : othersContributions)?.filter(c => c.type === 'Important Question') || [], [allContents, myContributions, othersContributions, view]);

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.replace('/help/class-representative');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({ variant: 'destructive', title: 'Sign Out Failed', description: 'Could not sign you out.' });
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
  
  const SidebarContent = () => (
     <>
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">CR Dashboard</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
              <Button variant={view === 'all' ? 'secondary' : 'ghost'} className="w-full justify-start text-base gap-3" onClick={() => setView('all')}><Home />Dashboard</Button>
              <Button variant='ghost' className="w-full justify-start text-base gap-3" onClick={handleAddNew}>
                <FilePlus />Add Content
              </Button>
               <Button variant={view === 'my' ? 'secondary' : 'ghost'} className="w-full justify-start text-base gap-3" onClick={() => setView('my')}><UserIcon />Your Contributions</Button>
               <Button variant={view === 'others' ? 'secondary' : 'ghost'} className="w-full justify-start text-base gap-3" onClick={() => setView('others')}><Users />Others' Contributions</Button>
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
               <Button variant={view === 'all' ? 'secondary' : 'ghost'} className="w-full justify-start text-base gap-3" onClick={() => setView('all')}><Home />Dashboard</Button>
            </SheetClose>
             <SheetClose asChild>
                <Button variant='ghost' className="w-full justify-start text-base gap-3" onClick={handleAddNew}>
                   <FilePlus />Add Content
                 </Button>
             </SheetClose>
            <SheetClose asChild>
              <Button variant={view === 'my' ? 'secondary' : 'ghost'} className="w-full justify-start text-base gap-3" onClick={() => setView('my')}><UserIcon />Your Contributions</Button>
            </SheetClose>
            <SheetClose asChild>
              <Button variant={view === 'others' ? 'secondary' : 'ghost'} className="w-full justify-start text-base gap-3" onClick={() => setView('others')}><Users />Others' Contributions</Button>
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
                    <VisuallyHidden>
                      <SheetClose />
                    </VisuallyHidden>
                    <MobileSidebarContent />
                </SheetContent>
              </Sheet>
               <h1 className="text-xl font-semibold md:hidden">CR Dashboard</h1>
            </div>
          
            <div className="hidden w-full max-w-lg items-center gap-4 md:flex">
              <GlobalSearch onSearchChange={setFilteredData} allContent={allContents || []} />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <p className="text-sm text-muted-foreground hidden sm:block">Welcome, {user?.displayName || 'Class Rep'}!</p>
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
                          isEditable={item.authorId === user?.uid}
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
                  onEdit={handleEdit}
                  onDelete={openDeleteDialog}
                  currentUserId={user?.uid}
                />
              </div>
              <div id="pyqs">
                <ContentRow 
                  title="Previous Year Questions"
                  items={pyqs}
                  isLoading={isLoadingAllContent}
                  onEdit={handleEdit}
                  onDelete={openDeleteDialog}
                  currentUserId={user?.uid}
                />
              </div>
              <div id="imp-questions">
                <ContentRow 
                  title="Important Questions"
                  items={importantQuestions}
                  isLoading={isLoadingAllContent}
                  onEdit={handleEdit}
                  onDelete={openDeleteDialog}
                  currentUserId={user?.uid}
                />
              </div>
            </>
          )}
        </div>
      </main>
      
      { user &&
       <ContentForm 
          isOpen={isFormOpen}
          onClose={closeForm}
          editingContent={editingContent}
          user={user}
       />
      }

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

export default withAuth(CRDashboard, 'class-representative');
