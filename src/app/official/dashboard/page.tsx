'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { BrainCircuit, Users, ShieldAlert, LogOut, UserX, UserCheck, Trash2 } from 'lucide-react';
import { useFirestore, useUser, useMemoFirebase, useDoc, useCollection, useFirebase } from '@/firebase';
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
} from "@/components/ui/alert-dialog"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { ThemeToggle } from '@/components/theme-toggle';
import withAuth from '@/hoc/withAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
  
  const [dialogState, setDialogState] = useState<{isOpen: boolean, user: UserProfile | null, action: ActionType | null}>({ isOpen: false, user: null, action: null });

  // Query for all users. The withAuth HOC ensures this component only renders
  // for an authorized official/admin, so this query is secure.
  const usersQuery = useMemoFirebase(() => {
    if (firestore) {
      return query(collection(firestore, 'users'));
    }
    return null;
  }, [firestore]);

  const { data: allUsers, isLoading: isLoadingUsers, error: usersError } = useCollection<UserProfile>(usersQuery);

  const handleSignOut = async () => {
    try {
      if(auth) await auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'Could not sign you out. Please try again.',
      });
    }
  };

  const openConfirmationDialog = (user: UserProfile, action: ActionType) => {
    setDialogState({ isOpen: true, user, action });
  };
  
  const closeConfirmationDialog = () => {
    setDialogState({ isOpen: false, user: null, action: null });
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
        toast({ title: 'User Deleted', description: `${userToUpdate.name}'s account data has been permanently removed. They will need to sign up again.` });
      } else { // 'block' or 'unblock'
        const isDisabled = action === 'block';
        await updateDoc(userRef, { disabled: isDisabled });

        const toastTitle = isDisabled ? 'User Blocked' : 'User Unblocked';
        const toastDescription = `${userToUpdate.name}'s account has been ${isDisabled ? 'disabled' : 'enabled'}.`;
        toast({ title: toastTitle, description: toastDescription });
      }
        
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: `Could not ${action} the user. Please try again.`,
      });
    } finally {
        setIsSubmitting(false);
        closeConfirmationDialog();
    }
  };

  const filteredUsers = allUsers?.filter(u => u.roles && !u.roles.includes('admin') && !u.roles.includes('official'));

  return (
    <div className="flex min-h-screen bg-secondary/30 text-foreground">
      <main className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-7 w-7 text-primary" />
            <span className="text-xl">EduBot Official Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <p className="hidden sm:block">Welcome, {user?.displayName || 'Official'}</p>
            <Button variant="ghost" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <div className="p-4 md:p-8">
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'><Users className="h-6 w-6" /> User Access Log</CardTitle>
              <CardDescription>This log shows a list of registered students, class representatives, and seniors.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
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
                     <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-destructive">
                          Error: Could not load user data.
                          <p className="text-xs text-muted-foreground mt-2">{usersError?.message}</p>
                        </TableCell>
                      </TableRow>
                  )}
                  {!isLoadingUsers && filteredUsers?.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No relevant users found in the system.
                        </TableCell>
                      </TableRow>
                  )}
                  {filteredUsers?.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles && u.roles.map(role => (
                            <Badge key={role} variant={'secondary'} className='capitalize'>{role.replace(/-/g, ' ')}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.disabled ? 'destructive' : 'default'} className="bg-opacity-80">
                          {u.disabled ? 'Blocked' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {u.disabled ? (
                                <DropdownMenuItem onClick={() => openConfirmationDialog(u, 'unblock')}>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Unblock
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => openConfirmationDialog(u, 'block')}>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Block
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog(u, 'delete')}>
                                 <Trash2 className="mr-2 h-4 w-4" />
                                 Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      
       <AlertDialog open={dialogState.isOpen} onOpenChange={closeConfirmationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.action === 'delete' && `This action cannot be undone. This will permanently delete ${dialogState.user?.name}'s account data. They will be signed out and will need to sign up again.`}
              {dialogState.action === 'block' && `This will disable ${dialogState.user?.name}'s account, preventing them from logging in. They will not be able to sign up with the same email until unblocked.`}
              {dialogState.action === 'unblock' && `This will re-enable ${dialogState.user?.name}'s account, allowing them to log in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUserAction}
              disabled={isSubmitting}
              className={dialogState.action === 'delete' || dialogState.action === 'block' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isSubmitting ? <LoadingSpinner /> : `Yes, ${dialogState.action}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


export default withAuth(OfficialDashboard, 'official');
