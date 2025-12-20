'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
  doc,
} from 'firebase/firestore';
import { PlusCircle, Book, Edit, LogOut, Trash2, Loader2, BrainCircuit, LayoutDashboard, FilePlus, HelpCircle, FileText } from 'lucide-react';
import { useFirebase, useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { deleteContent } from '@/firebase/firestore/content';

import { Content } from './types';
import ContentDisplay from './content-display';
import ContentForm from './content-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ThemeToggle } from '@/components/theme-toggle';


export default function SeniorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [deletingContentId, setDeletingContentId] = useState<string | null>(null);

  const contentQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'content'), where('authorId', '==', user.uid));
  }, [firestore, user?.uid]);
  
  const { data: contents, isLoading: isLoadingContent } = useCollection<Content>(contentQuery);
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/signin/senior');
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
        router.push('/auth/signin/senior');
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
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary/30 text-foreground">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-background shadow-lg md:flex">
         <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BrainCircuit className="h-7 w-7 text-primary" />
              <span className="text-xl">EduBot</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-2 p-4">
              <Button variant="ghost" className="w-full justify-start text-base">
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Button>
               <Button variant="ghost" className="w-full justify-start text-base" onClick={handleAddNew}>
                <FilePlus className="mr-3 h-5 w-5" />
                Add Content
              </Button>
              <Button variant="ghost" className="w-full justify-start text-base">
                <FileText className="mr-3 h-5 w-5" />
                Notes
              </Button>
               <Button variant="ghost" className="w-full justify-start text-base">
                <HelpCircle className="mr-3 h-5 w-5" />
                PYQs
              </Button>
          </nav>
          <div className="mt-auto p-4">
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-base">
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
          <h1 className="text-xl font-semibold md:text-2xl">
            Senior Contributor Dashboard
          </h1>
          <div className="flex items-center gap-4">
             <p className="text-sm text-muted-foreground hidden sm:block">Welcome, {user.displayName || 'Senior'}!</p>
             <Button variant="outline" size="sm" onClick={handleAddNew} className="gap-2">
                <PlusCircle className="h-4 w-4" /> Add New
            </Button>
             <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 space-y-8 p-4 md:p-8">
          <ContentDisplay 
            contents={contents}
            isLoading={isLoadingContent}
            onEdit={handleEdit}
            onDelete={openDeleteDialog}
          />
        </div>
      </main>

       <ContentForm 
          isOpen={isFormOpen}
          onClose={closeForm}
          editingContent={editingContent}
          user={user}
       />
      
      {/* Delete Confirmation Dialog */}
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
