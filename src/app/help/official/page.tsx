'use client';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function OfficialHelpPage() {
  
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-8 bg-background">
       <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-8 capitalize bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Official Portal
        </h1>
        <div className="grid grid-cols-1 gap-4">
          <Link
            href="/auth/signin/official"
            className="p-6 bg-card/80 backdrop-blur-sm border rounded-lg hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 text-foreground"
          >
            <h2 className="text-2xl font-semibold">Sign In as Official</h2>
            <p className="text-muted-foreground mt-2">Access the administrative dashboard.</p>
          </Link>
        </div>
        <Link href="/" className="mt-8 inline-block text-primary hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
