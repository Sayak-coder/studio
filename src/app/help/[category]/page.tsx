import { HelpForm } from '@/components/help/HelpForm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const categoryMap: { [key: string]: string } = {
  'student': 'Student',
  'class-representative': 'Class Representative',
  'senior': 'Senior'
};

export function generateStaticParams() {
  return Object.keys(categoryMap).map((key) => ({
    category: key,
  }));
}

export default function HelpPage({ params }: { params: { category: string } }) {
  const categoryTitle = categoryMap[params.category];

  if (!categoryTitle) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
        </div>
        <div className="text-center">
            <h1 className="font-headline text-4xl font-bold text-primary tracking-tight mb-2">
              {categoryTitle} Help
            </h1>
            <p className="text-center text-lg text-muted-foreground mb-8">
              Ask our AI assistant anything. How can we help you today?
            </p>
        </div>
        <HelpForm category={categoryTitle as 'Student' | 'Class Representative' | 'Senior'} />
      </div>
    </main>
  );
}
