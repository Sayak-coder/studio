'use client';

import React, { useState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';

import { useUser, useFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import ContentForm from './content-form';
import { Content } from './types';


const dashboardItems = [
  {
    title: 'Class Notes',
    description: 'Access and manage verified class notes.',
    icon: <BookCopy className="h-8 w-8 text-primary" />,
    href: '/class-representative/notes',
  },
  {
    title: 'Important Questions',
    description: 'Curate and share key questions for exams.',
    icon: <HelpCircle className="h-8 w-8 text-primary" />,
    href: '/class-representative/important-questions',
  },
  {
    title: 'PYQ',
    description: 'Upload and organize previous year question papers.',
    icon: <FileText className="h-8 w-8 text-primary" />,
    href: '/class-representative/pyq',
  },
];

export default function CRDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);


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
            {dashboardItems.map(item => (
                <Button
                    key={item.title}
                    variant='ghost'
                    className="w-full justify-start text-base gap-3"
                    asChild
                >
                    <Link href={item.href}>{item.icon}{item.title}</Link>
                </Button>
            ))}
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
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex w-[280px] flex-col p-0">
                    <div className="flex h-16 items-center border-b px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                        <BrainCircuit className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold">EduBot CR</span>
                        </Link>
                    </div>
                    <nav className="flex-1 space-y-2 p-4">
                        <SheetClose asChild>
                            <Button
                                variant='secondary'
                                className="w-full justify-start text-base gap-3"
                                asChild
                                >
                                <Link href="/class-representative/dashboard"><LayoutDashboard />Dashboard</Link>
                            </Button>
                        </SheetClose>
                         <SheetClose asChild>
                            <Button
                                variant='ghost'
                                className="w-full justify-start text-base gap-3"
                                onClick={handleAddNew}
                                >
                                <FilePlus />Add Content
                            </Button>
                        </SheetClose>
                        {dashboardItems.map(item => (
                            <SheetClose asChild key={item.title}>
                                <Button
                                    variant='ghost'
                                    className="w-full justify-start text-base gap-3"
                                    asChild
                                >
                                    <Link href={item.href}>{item.icon}{item.title}</Link>
                                </Button>
                            </SheetClose>
                        ))}
                    </nav>
                    <div className="mt-auto p-4">
                        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-base gap-3">
                            <LogOut /> Sign Out
                        </Button>
                    </div>
                </SheetContent>
              </Sheet>
               <h1 className="text-xl font-semibold md:hidden">CR Dashboard</h1>
            </div>
          <div className="flex items-center gap-2 md:gap-4">
            <p className="hidden text-sm text-muted-foreground sm:block">
              Welcome back, {user.displayName || 'CR'}!
            </p>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 space-y-8 p-4 md:p-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">CR Dashboard</h1>
                <p className="text-muted-foreground mt-2">Manage all your academic resources from one place.</p>
            </div>
             <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {dashboardItems.map((item) => (
                <Link href={item.href} key={item.title} passHref>
                    <Card className="animated-gradient-border group transform cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                        {React.cloneElement(item.icon, { className: "h-8 w-8 text-primary group-hover:scale-110 transition-transform"})}
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                        {item.description}
                        </p>
                    </CardContent>
                    </Card>
                </Link>
                ))}
            </div>
        </div>
      </main>
      
       <ContentForm 
          isOpen={isFormOpen}
          onClose={closeForm}
          editingContent={editingContent}
          user={user}
       />
    </div>
  );
}
