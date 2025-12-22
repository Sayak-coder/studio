'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OthersContributionsRedirect() {
    const router = useRouter();
    React.useEffect(() => {
        router.replace('/class-representative/dashboard');
    }, [router]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <p>Redirecting to dashboard...</p>
        </div>
    );
}
