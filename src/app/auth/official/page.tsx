'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function OfficialLoginPage() {
  const router = useRouter();
  const [officialId, setOfficialId] = useState('');
  const { toast } = useToast();

  const handleLogin = () => {
    if (officialId === 'office2058') {
      // We will implement the redirect to the user data page later
      toast({
        title: 'Access Granted',
        description: 'Redirecting to officials dashboard...',
      });
      // router.push('/official/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'The Official ID you entered is incorrect.',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Official Portal</CardTitle>
          <CardDescription>Enter your unique ID to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="officialId">Unique Official ID</Label>
              <Input
                id="officialId"
                placeholder="Your Official ID"
                value={officialId}
                onChange={(e) => setOfficialId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:shadow-lg">
            Proceed
          </Button>
          <Button variant="link" onClick={() => router.push('/')} className="text-primary">
            &larr; Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
