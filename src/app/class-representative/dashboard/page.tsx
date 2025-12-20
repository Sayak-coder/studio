'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
} from 'firebase/firestore';
import {
  BookCopy,
  FileText,
  LogOut,
  Loader2,
  HelpCircle,
  BrainCircuit,
  Menu,
  LayoutDashboard,
  FilePlus,
  User,
  Users,
  Star,
} from 'lucide-react';

import { useFirebase, useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { deleteContent } from '@/firebase/firestore/content';

import { Content } from './types';
import ContentForm from './content-form';
import ContentSection from './content-section';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
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
  
  // Query for the logged-in CR's own content
  const myContentQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'content'), where('authorId', '==', user.uid));
  }, [firestore, user?.uid]);

  // Query for other users' content
  const otherContentQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'content'),
      where('authorId', '!=', user.uid)
    );
  }, [firestore, user?.uid]);

  const { data: myContents, isLoading: isLoadingMyContent } = useCollection<Content>(myContentQuery);
  const { data: otherContents, isLoading: isLoadingOtherContent } = useCollection<Content>(otherContentQuery);

  const otherNotes = useMemo(() => otherContents?.filter(c => c.type === 'Class Notes') || [], [otherContents]);
  const otherPyqs = useMemo(() => otherContents?.filter(c => c.type === 'PYQ') || [], [otherContents]);
  const otherImpQs = useMemo(() => otherContents?.filter(c => c.type === 'Important Question') || [], [otherContents]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/signin/class-representative');
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


  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }
  
  const SidebarContent = () => (
     <>
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">EduBot CR</span>
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

  return (
    <div className="flex min-h-screen bg-secondary/30 text-foreground">
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
                    <SheetClose asChild>
                      <SidebarContent />
                    </SheetClose>
                </SheetContent>
              </Sheet>
               <h1 className="text-xl font-semibold md:text-2xl">CR Dashboard</h1>
            </div>
          <div className="flex items-center gap-2 md:gap-4">
             <p className="text-sm text-muted-foreground hidden sm:block">Welcome, {user.displayName || 'CR'}!</p>
            <Button variant="outline" size="sm" onClick={handleAddNew} className="gap-2">
                <FilePlus className="h-4 w-4" /> Add New
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 space-y-12 p-4 md:p-8">
           <div id="my-contributions">
              <ContentSection 
                title="My Contributions"
                contents={myContents}
                isLoading={isLoadingMyContent}
                onEdit={handleEdit}
                onDelete={openDeleteDialog}
                isEditable={true}
              />
           </div>
           <div id="newly-added">
              <ContentSection 
                title="Newly Added Notes"
                contents={otherNotes}
                isLoading={isLoadingOtherContent}
                isEditable={false}
              />
           </div>
            <div id="pyqs">
              <ContentSection
                title="Current PYQs"
                contents={otherPyqs}
                isLoading={isLoadingOtherContent}
                isEditable={false}
              />
            </div>
            <div id="important-questions">
              <ContentSection
                title="Important Questions"
                contents={otherImpQs}
                isLoading={isLoadingOtherContent}
                isEditable={false}
              />
            </div>
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
