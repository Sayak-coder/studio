'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  BrainCircuit,
  Users,
  ShieldAlert,
  LogOut,
  UserX,
  UserCheck,
  Trash2,
  Menu,
  FileText
} from 'lucide-react';
import { useFirestore, useUser, useMemoFirebase, useCollection, useFirebase } from '@/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import withAuth from '@/hoc/withAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Content } from '@/app/class-representative/dashboard/types';
import ContentRow from '@/app/class-representative/dashboard/content-row';
import { deleteContent } from '@/firebase/firestore/content';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  disabled?: boolean;
};

type ActionType = 'block' | 'unblock' | 'delete';

function OfficialDashboard() {
  const router = useRouter();
  const firestore = useFirestore();
  const { auth } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<'users' | 'content'>('users');
  
  const [dialogState, setDialogState] = useState<{ isOpen: boolean; user: UserProfile | null; action: ActionType | null }>({
    isOpen: false,
    user: null,
    action: null,
  });

  const [deleteContentDialog, setDeleteContentDialog] = useState<{isOpen: boolean, contentId: string | null}>({
      isOpen: false,
      contentId: null,
  });

  // Queries
  const usersQuery = useMemoFirebase(() => {
    if (firestore) return query(collection(firestore, 'users'));
    return null;
  }, [firestore]);

  const contentQuery = useMemoFirebase(() => {
    if (firestore) return query(collection(firestore, 'content'));
    return null;
  }, [firestore]);

  const { data: allUsers, isLoading: isLoadingUsers, error: usersError } = useCollection<UserProfile>(usersQuery);
  const { data: allContent, isLoading: isLoadingContent, error: contentError } = useCollection<Content>(contentQuery);

  const filteredUsers = useMemo(() => allUsers?.filter(u => u.roles && !u.roles.includes('admin') && !u.roles.includes('official')), [allUsers]);
  const notes = useMemo(() => allContent?.filter(c => c.type === 'Class Notes') || [], [allContent]);
  const pyqs = useMemo(() => allContent?.filter(c => c.type === 'PYQ') || [], [allContent]);
  const importantQuestions = useMemo(() => allContent?.filter(c => c.type === 'Important Question') || [], [allContent]);


  // Handlers
  const handleSignOut = async () => {
    try {
      if (auth) await auth.signOut();
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({ variant: 'destructive', title: 'Sign Out Failed', description: 'Could not sign you out.' });
    }
  };

  const openConfirmationDialog = (user: UserProfile, action: ActionType) => {
    setDialogState({ isOpen: true, user, action });
  };
  
  const closeConfirmationDialog = () => {
    setDialogState({ isOpen: false, user: null, action: null });
  };
  
  const openDeleteContentDialog = (id: string) => {
      setDeleteContentDialog({ isOpen: true, contentId: id });
  };

  const handleUserAction = async () => {
    if (!firestore || !dialogState.user || !dialogState.action) return;
    
    setIsSubmitting(true);
    const userToUpdate = dialogState.user;
    const action = dialogState.action;

    try {
      const userRef = doc(firestore, 'users', userToUpdate.id);
      
      if (action === 'delete') {
        await deleteDoc(userRef);
        toast({ title: 'User Deleted', description: `${userToUpdate.name}'s account data has been permanently removed.` });
      } else {
        const isDisabled = action === 'block';
        await updateDoc(userRef, { disabled: isDisabled });
        toast({ title: isDisabled ? 'User Blocked' : 'User Unblocked', description: `${userToUpdate.name}'s account has been ${isDisabled ? 'disabled' : 'enabled'}.` });
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toast({ variant: 'destructive', title: 'Action Failed', description: `Could not ${action} the user.` });
    } finally {
      setIsSubmitting(false);
      closeConfirmationDialog();
    }
  };

  const handleConfirmContentDelete = async () => {
      if (!deleteContentDialog.contentId || !firestore) return;
      setIsSubmitting(true);
      try {
          await deleteContent(firestore, deleteContentDialog.contentId);
          toast({ title: 'Content Deleted', description: 'The item has been deleted.'});
          setDeleteContentDialog({ isOpen: false, contentId: null });
      } catch (error) {
          toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Could not delete content.'});
      } finally {
          setIsSubmitting(false);
      }
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <span className="text-xl">Official Portal</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        <Button variant={view === 'users' ? 'secondary' : 'ghost'} className="w-full justify-start text-base gap-3" onClick={() => setView('users')}><Users /> User Management</Button>
        <Button variant={view === 'content' ? 'secondary' : 'ghost'} className="w-full justify-start text-base gap-3" onClick={() => setView('content')}><FileText /> Content Overview</Button>
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
                  <Menu className="h-6 w-6" /> <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-[280px] flex-col p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-semibold md:hidden">Official Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <p className="text-sm text-muted-foreground hidden sm:block">Welcome, {user?.displayName || 'Official'}!</p>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 space-y-8 p-4 md:p-8">
            {view === 'users' && (
                <Card>
                    <CardHeader>
                    <CardTitle className='flex items-center gap-2'><Users className="h-6 w-6" /> User Access Log</CardTitle>
                    <CardDescription>Manage all registered students, class representatives, and seniors.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden sm:table-cell">Email</TableHead>
                            <TableHead className="hidden md:table-cell">Roles</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {isLoadingUsers && (
                            <TableRow>
                            <TableCell colSpan={5}>
                                <div className="flex items-center justify-center py-10">
                                <LoadingSpinner className="mr-4" />
                                <p className="text-muted-foreground">Loading user data...</p>
                                </div>
                            </TableCell>
                            </TableRow>
                        )}
                        {usersError && (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center text-destructive">Error: Could not load user data.</TableCell></TableRow>
                        )}
                        {!isLoadingUsers && filteredUsers?.length === 0 && (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center">No relevant users found.</TableCell></TableRow>
                        )}
                        {filteredUsers?.map((u) => (
                            <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.name}</TableCell>
                            <TableCell className="hidden sm:table-cell">{u.email}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="flex flex-wrap gap-1">
                                {u.roles?.map(role => <Badge key={role} variant={'secondary'} className='capitalize'>{role.replace(/-/g, ' ')}</Badge>)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={u.disabled ? 'destructive' : 'default'} className="bg-opacity-80">{u.disabled ? 'Blocked' : 'Active'}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {u.disabled ? (
                                    <DropdownMenuItem onClick={() => openConfirmationDialog(u, 'unblock')}><UserCheck className="mr-2 h-4 w-4" />Unblock</DropdownMenuItem>
                                    ) : (
                                    <DropdownMenuItem onClick={() => openConfirmationDialog(u, 'block')}><UserX className="mr-2 h-4 w-4" />Block</DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog(u, 'delete')}><Trash2 className="mr-2 h-4 w-4" />Delete User</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            )}
            
            {view === 'content' && (
                <div className="space-y-12">
                     <ContentRow title="Class Notes" items={notes} isLoading={isLoadingContent} onEdit={() => {}} onDelete={openDeleteContentDialog} currentUserId={user?.uid} />
                     <ContentRow title="Previous Year Questions" items={pyqs} isLoading={isLoadingContent} onEdit={() => {}} onDelete={openDeleteContentDialog} currentUserId={user?.uid} />
                     <ContentRow title="Important Questions" items={importantQuestions} isLoading={isLoadingContent} onEdit={() => {}} onDelete={openDeleteContentDialog} currentUserId={user?.uid} />
                </div>
            )}
        </div>
      </main>
      
      <AlertDialog open={dialogState.isOpen} onOpenChange={closeConfirmationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.action === 'delete' && `This will permanently delete ${dialogState.user?.name}'s account and all associated data.`}
              {dialogState.action === 'block' && `This will disable ${dialogState.user?.name}'s account, preventing them from logging in.`}
              {dialogState.action === 'unblock' && `This will re-enable ${dialogState.user?.name}'s account, allowing them to log in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUserAction} disabled={isSubmitting} className={dialogState.action !== 'unblock' ? 'bg-destructive hover:bg-destructive/90' : ''}>
              {isSubmitting ? <LoadingSpinner /> : `Yes, ${dialogState.action}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteContentDialog.isOpen} onOpenChange={(open) => !open && setDeleteContentDialog({isOpen: false, contentId: null})}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete this content?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. This will permanently delete the content from the platform.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmContentDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                      {isSubmitting ? <LoadingSpinner /> : 'Yes, delete'}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default withAuth(OfficialDashboard, 'official');
