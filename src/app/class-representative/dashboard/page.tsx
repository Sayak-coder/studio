'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
} from 'firebase/firestore';

import {
  Loader2,
  BrainCircuit,
  Menu,
  FilePlus,
  Home,
  User,
  Users
} from 'lucide-react';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
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

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingContentId, setDeletingContentId] = useState<string | null>(null);
  
  const [filteredData, setFilteredData] = useState<Content[] | null>(null);

  const allContentQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'content'));
  }, [firestore]);

  const { data: allContents, isLoading: isLoadingAllContent } = useCollection<Content>(allContentQuery);
  
  const notes = useMemo(() => allContents?.filter(c => c.type === 'Class Notes') || [], [allContents]);
  const pyqs = useMemo(() => allContents?.filter(c => c.type === 'PYQ') || [], [allContents]);
  const importantQuestions = useMemo(() => allContents?.filter(c => c.type === 'Important Question') || [], [allContents]);


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
              <Button variant='secondary' className="w-full justify-start text-base gap-3" asChild>
                <Link href="/class-representative/dashboard"><Home />Dashboard</Link>
              </Button>
              <Button variant='ghost' className="w-full justify-start text-base gap-3" onClick={handleAddNew}>
                <FilePlus />Add Content
              </Button>
               <Button variant='ghost' className="w-full justify-start text-base gap-3" asChild>
                <Link href="/class-representative/dashboard/my-contributions"><User />Your Contributions</Link>
              </Button>
               <Button variant='ghost' className="w-full justify-start text-base gap-3" asChild>
                <Link href="/class-representative/dashboard/others-contributions"><Users />Others' Contributions</Link>
              </Button>
        </nav>
        <div className="mt-auto p-4">
           <Button variant="ghost" asChild className="w-full justify-start text-base gap-3">
             <Link href="/"><Home /> Back to Home</Link>
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
               <Button variant='secondary' className="w-full justify-start text-base gap-3" asChild>
                <Link href="/class-representative/dashboard"><Home />Dashboard</Link>
              </Button>
            </SheetClose>
             <SheetClose asChild>
                <Button variant='ghost' className="w-full justify-start text-base gap-3" onClick={handleAddNew}>
                   <FilePlus />Add Content
                 </Button>
             </SheetClose>
            <SheetClose asChild>
              <Button variant='ghost' className="w-full justify-start text-base gap-3" asChild>
                <Link href="/class-representative/dashboard/my-contributions"><User />Your Contributions</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button variant='ghost' className="w-full justify-start text-base gap-3" asChild>
                <Link href="/class-representative/dashboard/others-contributions"><Users />Others' Contributions</Link>
              </Button>
            </SheetClose>
       </nav>
       <div className="mt-auto p-4">
         <Button variant="ghost" asChild className="w-full justify-start text-base gap-3">
           <Link href="/"><Home /> Back to Home</Link>
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
              <p className="text-sm text-muted-foreground hidden sm:block">Welcome, Class Rep!</p>
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
                          isEditable={true} // All content is editable in code-based access
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
                  currentUserId="cr-user" // Dummy ID
                />
              </div>
              <div id="pyqs">
                <ContentRow 
                  title="Previous Year Questions"
                  items={pyqs}
                  isLoading={isLoadingAllContent}
                  onEdit={handleEdit}
                  onDelete={openDeleteDialog}
                  currentUserId="cr-user" // Dummy ID
                />
              </div>
              <div id="imp-questions">
                <ContentRow 
                  title="Important Questions"
                  items={importantQuestions}
                  isLoading={isLoadingAllContent}
                  onEdit={handleEdit}
                  onDelete={openDeleteDialog}
                  currentUserId="cr-user" // Dummy ID
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
          user={null} // Pass null for user in code-based access
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

export default CRDashboard;
