'use client';
import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { PlusCircle, Book, Edit, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { firebaseApp } from '@/firebase/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SeniorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(firebaseApp);
  
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/auth/signin/senior');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

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
  
  if (loading) {
    return (
       <div className="container mx-auto p-4 md:p-8">
          <Skeleton className="h-8 w-1/3 mb-8" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-64 mt-12" />
      </div>
    )
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30 text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 py-4 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Senior Contributor Portal
          </h1>
          <div className="flex items-center gap-4">
             <p className="text-sm text-muted-foreground hidden sm:block">Welcome, {user.displayName || 'Senior'}!</p>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="container mx-auto">
          {/* Add Notes Card */}
          <Dialog>
            <DialogTrigger asChild>
              <Card className="w-full cursor-pointer bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 animated-gradient-border">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <PlusCircle className="h-12 w-12 text-primary" />
                    <div>
                      <CardTitle className="text-2xl font-bold">Create New Content</CardTitle>
                      <CardDescription className="text-base">Share your knowledge by adding notes, past papers, or important questions.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-card">
              <DialogHeader>
                <DialogTitle>Create a New Note</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add new academic content. Your contribution helps countless juniors.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input id="title" placeholder="e.g. Advanced Data Structures" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">
                    Subject
                  </Label>
                  <Input id="subject" placeholder="e.g. Computer Science" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Content Type
                  </Label>
                  <Input id="type" placeholder="e.g. Class Notes, PYQ, Important Question" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right pt-2">
                    Content
                  </Label>
                  <Textarea id="content" placeholder="Start writing your notes here... You can use Markdown for formatting." className="col-span-3 min-h-[200px]" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Contribution</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* My Contributions Section */}
          <div className="mt-12">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Book className="h-8 w-8 text-primary" />
                  My Contributions
                </CardTitle>
                <CardDescription>
                  Here is a list of all the content you have shared. You can edit or manage them from here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* This is a placeholder. In a real app, you would map over the user's notes. */}
                <div className="border rounded-lg p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                    <div>
                        <h3 className="font-semibold">Introduction to Algorithms</h3>
                        <p className="text-sm text-muted-foreground">Subject: Computer Science | Type: Class Notes</p>
                    </div>
                    <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Note</span>
                    </Button>
                </div>
                 <p className="text-center text-muted-foreground mt-8">No other contributions yet. Start by creating new content!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
