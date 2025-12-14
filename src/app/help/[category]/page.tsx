import Link from 'next/link';

export default function AuthPage({ params }: { params: { category: string } }) {
  const categoryTitle = params.category.replace(/-/g, ' ') + ' Portal';
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-8 capitalize bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">{categoryTitle}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            href={`/auth/signin/${params.category}`} 
            className="p-6 bg-card/80 backdrop-blur-sm border rounded-lg hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 text-foreground"
          >
            <h2 className="text-2xl font-semibold">Sign In</h2>
            <p className="text-muted-foreground mt-2">Existing user? Log in here.</p>
          </Link>
          <Link 
            href={`/auth/signup/${params.category}`} 
            className="p-6 bg-card/80 backdrop-blur-sm border rounded-lg hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 text-foreground"
          >
            <h2 className="text-2xl font-semibold">Sign Up</h2>
             <p className="text-muted-foreground mt-2">New user? Create an account.</p>
          </Link>
        </div>
         <Link href="/" className="mt-8 inline-block text-primary hover:underline">
            &larr; Back to Home
          </Link>
      </div>
    </div>
  );
}
