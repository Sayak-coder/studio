'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function OfficialLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // For now, we will just redirect to the dashboard.
    // In a real application, you would have a secure authentication method here.
    router.push('/official/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to Official Portal...</p>
      </div>
    </div>
  );
}
