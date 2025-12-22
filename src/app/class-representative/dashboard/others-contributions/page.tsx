'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
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

import { useCollection, useFirestore, useUser } from '@/firebase';
import withAuth from '@/hoc/withAuth';

import { Content } from '../types';
import ContentCard from '../content-card';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';


function OthersContributionsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const othersContentQuery = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'content'), where('authorId', '!=', user.uid));
  }, [firestore, user?.uid]);

  const { data: othersContents, isLoading: isLoadingOthersContent } = useCollection<Content>(othersContentQuery);

  const SidebarContent = () => (
     <>
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">CR Dashboard</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
              <Button variant='ghost' className="w-full justify-start text-base gap-3" asChild>
                <Link href="/class-representative/dashboard"><Home />Dashboard</Link>
              </Button>
              <Button variant='ghost' className="w-full justify-start text-base gap-3" disabled>
                <FilePlus />Add Content
              </Button>
               <Button variant='ghost' className="w-full justify-start text-base gap-3" asChild>
                <Link href="/class-representative/dashboard/my-contributions"><User />Your Contributions</Link>
              </Button>
               <Button variant='secondary' className="w-full justify-start text-base gap-3" asChild>
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
               <Button variant='ghost' className="w-full justify-start text-base gap-3" asChild>
                <Link href="/class-representative/dashboard"><Home />Dashboard</Link>
              </Button>
            </SheetClose>
             <SheetClose asChild>
                <Button variant='ghost' className="w-full justify-start text-base gap-3" disabled>
                   <FilePlus />Add Content
                 </Button>
             </SheetClose>
            <SheetClose asChild>
              <Button variant='ghost' className="w-full justify-start text-base gap-3" asChild>
                <Link href="/class-representative/dashboard/my-contributions"><User />Your Contributions</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button variant='secondary' className="w-full justify-start text-base gap-3" asChild>
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
               <h1 className="text-xl font-semibold">Others' Contributions</h1>
            </div>
          
            <div className="flex items-center gap-2 md:gap-4">
              <p className="text-sm text-muted-foreground hidden sm:block">Welcome, {user?.displayName || 'Class Rep'}!</p>
              <ThemeToggle />
            </div>
        </header>

        <div className="flex-1 space-y-12 p-4 md:p-8">
            {isLoadingOthersContent ? (
                <div className="flex h-64 w-full flex-col items-center justify-center bg-background">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading other contributions...</p>
                </div>
            ) : othersContents && othersContents.length > 0 ? (
                 <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {othersContents.map((item) => (
                      <div key={item.id} className="py-4 flex justify-center">
                        <ContentCard 
                          item={item} 
                          onEdit={() => {}}
                          onDelete={() => {}}
                          isEditable={false} // CRs can't edit others' content from this view
                        />
                      </div>
                    ))}
                  </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                  <h3 className="text-2xl font-bold tracking-tight">No Other Contributions Found</h3>
                  <p className="text-muted-foreground mt-2">There is no content from other users yet.</p>
                </div>
            )}
        </div>
      </main>
      
    </div>
  );
}

export default withAuth(OthersContributionsPage, 'class-representative');
