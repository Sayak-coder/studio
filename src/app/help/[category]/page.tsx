import Link from 'next/link';

export default function AuthPage({ params }: { params: { category: string } }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8 capitalize">{params.category.replace('-', ' ')} Portal</h1>
      <div className="flex gap-4">
        <Link href={`/auth/signin/${params.category}`} className="p-4 bg-blue-500 text-white rounded-lg">
          Sign In
        </Link>
        <Link href={`/auth/signup/${params.category}`} className="p-4 bg-green-500 text-white rounded-lg">
          Sign Up
        </Link>
      </div>
    </div>
  );
}