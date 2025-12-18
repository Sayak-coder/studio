'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query, doc } from 'firebase/firestore';
import { BrainCircuit, Loader2, Users, ShieldAlert, LogOut } from 'lucide-react';
import { useFirestore, useUser, useMemoFirebase, useDoc, useCollection, useFirebase } from '@/firebase';
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
  const [isRoleVerified, setIsRoleVerified] = useState(false);

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
  
  // Step 2: Effect to check the user's role and enable the main query.
  useEffect(() => {
    if (userProfile && (userProfile.role === 'official' || userProfile.role === 'admin')) {
      setIsRoleVerified(true);
    } else if (userProfile) {
      // If profile is loaded but not an official, explicitly deny access
      setIsRoleVerified(false);
    }
  }, [userProfile]);

  // Step 3: Once role is verified, construct the query to get all users.
  const usersQuery = useMemoFirebase(() => {
    // Only run this query if the user's role has been verified as official/admin
    if (firestore && isRoleVerified) {
      return query(collection(firestore, 'users'));
    }
    return null; // Otherwise, the query is null and won't run
  }, [firestore, isRoleVerified]);

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


  if (isUserLoading || isLoadingProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verifying credentials...</p>
      </div>
    );
  }

  // A specific state for when user is authenticated but not an admin/official, after their profile has loaded.
  if (user && !isLoadingProfile && !isRoleVerified) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
         <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl text-destructive">
                    <ShieldAlert className="h-8 w-8"/>
                    Access Denied
                </CardTitle>
                <CardDescription>
                    Your account does not have the required privileges for this portal.
                </CardDescription>
            </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground">
                    This dashboard is for authorized personnel only. If you believe this is a mistake, please contact your administrator.
                </p>
                <Button variant="link" className="mt-4" onClick={() => router.push('/')}>
                  Return to Home
                </Button>
            </CardContent>
         </Card>
      </div>
    );
  }

  const filteredUsers = allUsers?.filter(u => ['student', 'class-representative', 'senior'].includes(u.role));


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
              <CardTitle className='flex items-center gap-2'><Users className="h-6 w-6" /> User Access Log</CardTitle>
              <CardDescription>This log shows a list of registered students, class representatives, and seniors.</CardDescription>
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
                  {isLoadingUsers && isRoleVerified && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                           <p className="ml-4 text-muted-foreground">Loading user data...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {usersError && (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-destructive">
                          Error: Could not load user data.
                          <p className="text-xs text-muted-foreground mt-2">{usersError?.message}</p>
                        </TableCell>
                      </TableRow>
                  )}
                  {!isLoadingUsers && filteredUsers?.length === 0 && isRoleVerified &&(
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No relevant users found in the system.
                        </TableCell>
                      </TableRow>
                  )}
                  {filteredUsers?.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={(u.role === 'admin' || u.role === 'official') ? 'default' : 'secondary'} className='capitalize'>{u.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {u.id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
