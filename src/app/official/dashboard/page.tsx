'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query, where, doc } from 'firebase/firestore';
import { BrainCircuit, Loader2, Users, ShieldAlert, LogOut } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc, useFirebase } from '@/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'senior' | 'class-representative' | 'admin' | 'official';
};

export default function OfficialDashboard() {
  const router = useRouter();
  const firestore = useFirestore();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  // Redirect to login if user is not authenticated after loading
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/help/official');
    }
  }, [user, isUserLoading, router]);

  // Step 1: Fetch the current user's profile to verify their role.
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userDocRef);

  // Step 2: Determine if the user has admin-like privileges.
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'official';

  // Step 3: Only create the query to fetch official users if the current user is confirmed to be an admin.
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    // This query now specifically filters for users with the 'official' role.
    return query(collection(firestore, 'users'), where('role', '==', 'official'));
  }, [firestore, isAdmin]);

  // The useCollection hook will now wait until usersQuery is not null.
  const { data: users, isLoading: isLoadingUsers, error } = useCollection<UserProfile>(usersQuery);

  const handleSignOut = async () => {
    try {
      if(auth) await auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/help/official');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'Could not sign you out. Please try again.',
      });
    }
  };


  if (isUserLoading || isLoadingProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verifying credentials...</p>
      </div>
    );
  }

  // A specific state for when user is authenticated but not an admin.
  if (user && !isAdmin && !isLoadingProfile) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
         <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl text-destructive">
                    <ShieldAlert className="h-8 w-8"/>
                    Access Denied
                </CardTitle>
                <CardDescription>
                    Your account does not have administrative privileges.
                </CardDescription>
            </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground">
                    Please contact your system administrator if you believe this is a mistake.
                </p>
                <Button asChild variant="link" className="mt-4">
                  <Link href="/">Return to Home</Link>
                </Button>
            </CardContent>
         </Card>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-secondary/30 text-foreground">
      <main className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-7 w-7 text-primary" />
            <span className="text-xl">EduBot Official Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <p className="hidden sm:block">Welcome, {userProfile?.name || 'Official'}</p>
            <Button variant="ghost" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'><Users className="h-6 w-6" /> Official Portal Access Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>User ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers &&
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!isLoadingUsers && error && (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-destructive">
                          Error: You do not have permission to view users.
                          <p className="text-xs text-muted-foreground mt-2">{error.message}</p>
                        </TableCell>
                      </TableRow>
                  )}
                  {!isLoadingUsers && !error && users && users.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No official logins found.
                        </TableCell>
                      </TableRow>
                  )}
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={(user.role === 'admin' || user.role === 'official') ? 'default' : 'secondary'} className='capitalize'>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {user.id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               {isLoadingUsers && (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
