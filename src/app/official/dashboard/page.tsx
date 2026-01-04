'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  ShieldCheck,
  Users,
  FileText,
  LogOut,
  UserX,
  UserCheck,
  Trash2,
  Menu,
  LayoutDashboard,
  MoreHorizontal,
  BookOpen,
  FileQuestion,
  AlertCircle
} from 'lucide-react';
import { useFirestore, useUser, useMemoFirebase, useCollection, useFirebase, useDoc } from '@/firebase';
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
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Content } from '@/app/class-representative/dashboard/types';
import { deleteContent } from '@/firebase/firestore/content';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  disabled?: boolean;
  status?: string;
};

type ActionType = 'block' | 'unblock' | 'delete';

export default function OfficialDashboard() {
  const router = useRouter();
  const firestore = useFirestore();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [view, setView] = useState<'users' | 'content'>('users');

  // Check if user has official/admin role
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userDocRef);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  React.useEffect(() => {
    if (isUserLoading || isLoadingProfile) return;

    if (!user) {
      router.replace('/official');
      return;
    }

    // userProfile is null if document doesn't exist yet
    if (userProfile === null) {
      // Wait and retry a few times for the document to appear
      if (retryCount < maxRetries) {
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000);
        return () => clearTimeout(timer);
      }
      
      // After max retries, deny access
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'User profile not found. Please try logging in again.',
      });
      router.replace('/official');
      return;
    }

    if (userProfile) {
      const hasOfficialAccess = userProfile.roles?.some(role => 
        role === 'official' || role === 'admin'
      );
      
      if (!hasOfficialAccess) {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You do not have permission to access the official dashboard.',
        });
        router.replace('/official');
      } else {
        setHasAccess(true);
        setIsCheckingAccess(false);
      }
    }
  }, [user, isUserLoading, userProfile, isLoadingProfile, router, toast, retryCount]);

  // Queries - only create if user has access
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !hasAccess) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, hasAccess]);

  const contentQuery = useMemoFirebase(() => {
    if (!firestore || !hasAccess) return null;
    return query(collection(firestore, 'content'));
  }, [firestore, hasAccess]);

  const { data: allUsers, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);
  const { data: allContent, isLoading: isLoadingContent } = useCollection<Content>(contentQuery);

  // State for dialogs
  const [userActionDialog, setUserActionDialog] = useState<{ 
    isOpen: boolean; 
    user: UserProfile | null; 
    action: ActionType | null;
  }>({
    isOpen: false,
    user: null,
    action: null,
  });

  const [contentDeleteDialog, setContentDeleteDialog] = useState<{
    isOpen: boolean;
    contentId: string | null;
    contentTitle: string | null;
  }>({
    isOpen: false,
    contentId: null,
    contentTitle: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered data
  const filteredUsers = useMemo(() => 
    allUsers?.filter(u => u.roles && !u.roles.includes('admin') && !u.roles.includes('official')) || [], 
    [allUsers]
  );

  const contentStats = useMemo(() => {
    if (!allContent) return { notes: 0, pyqs: 0, important: 0, total: 0 };
    return {
      notes: allContent.filter(c => c.type === 'Class Notes').length,
      pyqs: allContent.filter(c => c.type === 'PYQ').length,
      important: allContent.filter(c => c.type === 'Important Question').length,
      total: allContent.length,
    };
  }, [allContent]);

  // Loading state
  if (isCheckingAccess || isUserLoading || isLoadingProfile) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <LoadingSpinner className="mb-4" dotClassName="w-6 h-6" />
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

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

  const openUserActionDialog = (user: UserProfile, action: ActionType) => {
    setUserActionDialog({ isOpen: true, user, action });
  };

  const handleUserAction = async () => {
    if (!firestore || !userActionDialog.user || !userActionDialog.action) return;
    
    setIsSubmitting(true);
    const userToUpdate = userActionDialog.user;
    const action = userActionDialog.action;

    try {
      const userRef = doc(firestore, 'users', userToUpdate.id);
      
      if (action === 'delete') {
        await deleteDoc(userRef);
        toast({ 
          title: 'User Deleted', 
          description: `${userToUpdate.name}'s account has been permanently removed.` 
        });
      } else {
        const isDisabled = action === 'block';
        await updateDoc(userRef, { disabled: isDisabled, status: isDisabled ? 'blocked' : 'active' });
        toast({ 
          title: isDisabled ? 'User Blocked' : 'User Unblocked', 
          description: `${userToUpdate.name}'s account has been ${isDisabled ? 'disabled' : 'enabled'}.` 
        });
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toast({ 
        variant: 'destructive', 
        title: 'Action Failed', 
        description: `Could not ${action} the user.` 
      });
    } finally {
      setIsSubmitting(false);
      setUserActionDialog({ isOpen: false, user: null, action: null });
    }
  };

  const openContentDeleteDialog = (content: Content) => {
    setContentDeleteDialog({ 
      isOpen: true, 
      contentId: content.id, 
      contentTitle: content.title 
    });
  };

  const handleContentDelete = async () => {
    if (!firestore || !contentDeleteDialog.contentId) return;
    
    setIsSubmitting(true);
    try {
      await deleteContent(firestore, contentDeleteDialog.contentId);
      toast({ 
        title: 'Content Deleted', 
        description: 'The content has been permanently removed.' 
      });
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Deletion Failed', 
        description: 'Could not delete the content.' 
      });
    } finally {
      setIsSubmitting(false);
      setContentDeleteDialog({ isOpen: false, contentId: null, contentTitle: null });
    }
  };

  // UI Components
  const SidebarNav = ({ isMobile = false }: { isMobile?: boolean }) => {
    const NavButton = isMobile ? SheetClose : React.Fragment;
    const buttonProps = isMobile ? { asChild: true } : {};

    return (
      <nav className="flex-1 space-y-2 p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-base gap-3 pointer-events-none"
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Button>
        <NavButton {...buttonProps}>
          <Button 
            variant={view === 'users' ? 'secondary' : 'ghost'} 
            className="w-full justify-start text-base gap-3" 
            onClick={() => setView('users')}
          >
            <Users className="h-5 w-5" />
            User Management
          </Button>
        </NavButton>
        <NavButton {...buttonProps}>
          <Button 
            variant={view === 'content' ? 'secondary' : 'ghost'} 
            className="w-full justify-start text-base gap-3" 
            onClick={() => setView('content')}
          >
            <FileText className="h-5 w-5" />
            Content Management
          </Button>
        </NavButton>
      </nav>
    );
  };

  const SidebarFooter = () => (
    <div className="mt-auto p-4 border-t">
      <div className="px-3 py-2 mb-2 rounded-md bg-muted/50">
        <p className="text-xs text-muted-foreground">Logged in as</p>
        <p className="text-sm font-medium truncate">{userProfile?.name || 'Official User'}</p>
        <Badge variant="outline" className="mt-1 text-xs">
          {userProfile?.roles?.includes('admin') ? 'Admin' : 'Official'}
        </Badge>
      </div>
      <Button 
        variant="ghost" 
        onClick={handleSignOut} 
        className="w-full justify-start text-base gap-3"
      >
        <LogOut className="h-5 w-5" />
        Sign Out
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-card shadow-lg md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Official Panel</span>
          </Link>
        </div>
        <SidebarNav />
        <SidebarFooter />
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
          <div className="flex items-center gap-2">
            {/* Mobile Menu */}
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
                <div className="flex h-16 items-center border-b px-6">
                  <Link href="/" className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold">Official Panel</span>
                  </Link>
                </div>
                <SidebarNav isMobile />
                <SidebarFooter />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-semibold md:hidden">Official Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <p className="text-sm text-muted-foreground hidden sm:block">
              {userProfile?.name || 'Loading...'}
            </p>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          {view === 'users' && (
            <>
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                <p className="text-muted-foreground">
                  Manage user accounts and permissions
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{filteredUsers.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Registered accounts
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <UserCheck className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {filteredUsers.filter(u => !u.disabled).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Currently enabled
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
                    <UserX className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {filteredUsers.filter(u => u.disabled).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Currently disabled
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    View and manage all registered users in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="flex justify-center items-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    <div className="rounded-md border">
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
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                              <TableCell>{user.email || 'Anonymous'}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {user.roles?.map((role) => (
                                    <Badge key={role} variant="secondary" className="text-xs">
                                      {role}
                                    </Badge>
                                  )) || <span className="text-muted-foreground">No roles</span>}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.disabled ? 'destructive' : 'default'}>
                                  {user.disabled ? 'Blocked' : 'Active'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {user.disabled ? (
                                      <DropdownMenuItem 
                                        onClick={() => openUserActionDialog(user, 'unblock')}
                                        className="cursor-pointer"
                                      >
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Unblock User
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem 
                                        onClick={() => openUserActionDialog(user, 'block')}
                                        className="cursor-pointer"
                                      >
                                        <UserX className="mr-2 h-4 w-4" />
                                        Block User
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem 
                                      onClick={() => openUserActionDialog(user, 'delete')}
                                      className="cursor-pointer text-red-600"
                                    >
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {view === 'content' && (
            <>
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
                <p className="text-muted-foreground">
                  Review and manage all uploaded content
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentStats.total}</div>
                    <p className="text-xs text-muted-foreground">All items</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Class Notes</CardTitle>
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentStats.notes}</div>
                    <p className="text-xs text-muted-foreground">Notes uploaded</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">PYQs</CardTitle>
                    <FileQuestion className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentStats.pyqs}</div>
                    <p className="text-xs text-muted-foreground">Previous papers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Important</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentStats.important}</div>
                    <p className="text-xs text-muted-foreground">Key questions</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Content</CardTitle>
                  <CardDescription>
                    View and manage all content uploaded to the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingContent ? (
                    <div className="flex justify-center items-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : !allContent || allContent.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No content found
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allContent.map((content) => (
                            <TableRow key={content.id}>
                              <TableCell className="font-medium max-w-xs truncate">
                                {content.title}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{content.type}</Badge>
                              </TableCell>
                              <TableCell>{content.category}</TableCell>
                              <TableCell>{content.subject}</TableCell>
                              <TableCell>{content.unit || 'N/A'}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openContentDeleteDialog(content)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* User Action Dialog */}
      <AlertDialog 
        open={userActionDialog.isOpen} 
        onOpenChange={(open) => !open && setUserActionDialog({ isOpen: false, user: null, action: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userActionDialog.action === 'delete' && 'Delete User'}
              {userActionDialog.action === 'block' && 'Block User'}
              {userActionDialog.action === 'unblock' && 'Unblock User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userActionDialog.action === 'delete' && 
                `Are you sure you want to permanently delete ${userActionDialog.user?.name}'s account? This action cannot be undone.`
              }
              {userActionDialog.action === 'block' && 
                `Are you sure you want to block ${userActionDialog.user?.name}? They will not be able to access their account.`
              }
              {userActionDialog.action === 'unblock' && 
                `Are you sure you want to unblock ${userActionDialog.user?.name}? They will regain access to their account.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUserAction} 
              disabled={isSubmitting}
              className={userActionDialog.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {userActionDialog.action === 'delete' && 'Delete'}
                  {userActionDialog.action === 'block' && 'Block'}
                  {userActionDialog.action === 'unblock' && 'Unblock'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Content Delete Dialog */}
      <AlertDialog 
        open={contentDeleteDialog.isOpen} 
        onOpenChange={(open) => !open && setContentDeleteDialog({ isOpen: false, contentId: null, contentTitle: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{contentDeleteDialog.contentTitle}"? 
              This action cannot be undone and will remove all associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleContentDelete} 
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
