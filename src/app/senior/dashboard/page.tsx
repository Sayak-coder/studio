'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { PlusCircle, Book, Edit, LogOut, Trash2, Loader2, GripVertical } from 'lucide-react';

import { useFirebase, useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  createContent,
  updateContent,
  deleteContent,
} from '@/firebase/firestore/content';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


type Content = {
  id: string;
  title: string;
  subject: string;
  type: 'Class Notes' | 'PYQ' | 'Important Question';
  content: string;
  authorId: string;
};

const initialFormData: Omit<Content, 'id' | 'authorId'> = {
  title: '',
  subject: '',
  type: 'Class Notes',
  content: '',
};

export default function SeniorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
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
      await auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/auth/signin/senior');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'Could not sign you out. Please try again.',
      });
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleTypeChange = (value: Content['type']) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const openEditDialog = (content: Content) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      subject: content.subject,
      type: content.type,
      content: content.content,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingContentId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingContent(null);
  };
  
  const handleDialogClose = () => {
    resetForm();
    setIsDialogOpen(false);
  }

  const handleSubmit = async () => {
    if (!user || !firestore) return;
    if (!formData.title || !formData.subject || !formData.content) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out Title, Subject, and Content.' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingContent) {
        // Update existing content
        const updatedData = {
          ...formData,
        };
        await updateContent(firestore, editingContent.id, updatedData);
        toast({ title: 'Success!', description: 'Your content has been updated.' });
      } else {
        // Create new content
        const newContent = {
          ...formData,
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous',
        };
        await createContent(firestore, newContent);
        toast({ title: 'Success!', description: 'Your contribution has been added.' });
      }
      handleDialogClose();
    } catch (error) {
      // Errors are now globally handled by the error emitter in the content.ts functions
      // We still show a generic toast here for user feedback.
      console.error("Content submission error:", error);
      toast({ variant: 'destructive', title: 'Something went wrong', description: 'Could not save your content. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!deletingContentId || !firestore) return;
    
    setIsSubmitting(true);
    try {
      await deleteContent(firestore, deletingContentId);
      toast({ title: 'Content Deleted', description: 'The selected item has been successfully deleted.' });
      setIsDeleteDialogOpen(false);
      setDeletingContentId(null);
    } catch (error) {
       // Errors are globally handled
       console.error("Delete error:", error);
       toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Could not delete the content. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isUserLoading || !user) {
    return (
       <div className="container mx-auto p-4 md:p-8">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <Skeleton className="h-48 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/80 py-4 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Senior Contributor Portal
          </h1>
          <div className="flex items-center gap-4">
             <p className="text-sm text-muted-foreground hidden sm:block">Welcome, {user.displayName || 'Senior'}!</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign Out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="container mx-auto">
          {/* Add Notes Card */}
          <Dialog open={isDialogOpen} onOpenChange={ (isOpen) => isOpen ? setIsDialogOpen(true) : handleDialogClose() }>
            <DialogTrigger asChild>
              <Card className="w-full cursor-pointer bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 animated-gradient-border" onClick={() => setIsDialogOpen(true)}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <PlusCircle className="h-12 w-12 text-primary" />
                    <div>
                      <CardTitle className="text-2xl font-bold">Create New Content</CardTitle>
                      <CardDescription className="text-base text-muted-foreground">Share your knowledge by adding notes, past papers, or important questions.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-card">
              <DialogHeader>
                <DialogTitle>{editingContent ? 'Edit Content' : 'Create a New Contribution'}</DialogTitle>
                <DialogDescription>
                  {editingContent ? 'Update the details below.' : 'Fill in the details below to add new academic content. Your contribution helps countless juniors.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input id="title" placeholder="e.g. Advanced Data Structures" className="col-span-3" value={formData.title} onChange={handleFormChange} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">
                    Subject
                  </Label>
                  <Input id="subject" placeholder="e.g. Computer Science" className="col-span-3" value={formData.subject} onChange={handleFormChange} />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select onValueChange={handleTypeChange} value={formData.type}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Class Notes">Class Notes</SelectItem>
                      <SelectItem value="PYQ">Previous Year Question (PYQ)</SelectItem>
                      <SelectItem value="Important Question">Important Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right pt-2">
                    Content
                  </Label>
                  <Textarea id="content" placeholder="Start writing here... You can use Markdown for formatting." className="col-span-3 min-h-[200px]" value={formData.content} onChange={handleFormChange}/>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingContent ? 'Update' : 'Save Contribution'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* My Contributions Section */}
          <div className="mt-12">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-3xl font-bold">
                  <Book className="h-8 w-8 text-primary" />
                  My Contributions
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Here is a list of all the content you have shared. You can edit or manage them from here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                   {isLoadingContent && (
                      <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    )}
                  {!isLoadingContent && contents && contents.length > 0 ? (
                    contents.map(item => (
                       <Card key={item.id} className="flex items-center justify-between p-4 transition-all hover:bg-secondary/50">
                        <div className="flex items-center gap-4">
                           <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                           <div className="w-32">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider">{item.type}</p>
                           </div>
                           <div className="border-l pl-4">
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              <p className="text-sm text-muted-foreground">Subject: {item.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                   <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Edit Note</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Edit</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => openDeleteDialog(item.id)}>
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete Note</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Delete</p></TooltipContent>
                              </Tooltip>
                           </TooltipProvider>
                        </div>
                      </Card>
                    ))
                  ) : (
                    !isLoadingContent && <p className="text-center text-muted-foreground mt-8 py-8">You haven't made any contributions yet. Click the button above to get started!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
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
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    