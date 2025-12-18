'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query } from 'firebase/firestore';
import { BrainCircuit, Loader2, Users } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'senior' | 'class-representative' | 'admin';
};

export default function OfficialDashboard() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // Redirect to login if user is not authenticated after loading
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/official');
    }
  }, [user, isUserLoading, router]);


  const usersQuery = useMemoFirebase(() => {
    // IMPORTANT: Only create the query if firestore and the user are available.
    // This prevents the query from running before authentication is ready.
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, user]);

  const { data: users, isLoading: isLoadingUsers, error } = useCollection<UserProfile>(usersQuery);

  if (isUserLoading || (!users && isLoadingUsers)) {
      return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
            <Users className="h-6 w-6 text-primary" />
            <p className="text-lg font-semibold">User Management</p>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <Card>
            <CardHeader>
              <CardTitle>All Registered Users</CardTitle>
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
                          No users found.
                        </TableCell>
                      </TableRow>
                  )}
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className='capitalize'>{user.role}</Badge>
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
