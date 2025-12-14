import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, UserCheck, Briefcase } from 'lucide-react';

const categories = [
  {
    name: 'Student',
    slug: 'student',
    icon: <GraduationCap className="h-12 w-12 text-primary" />,
    description: 'Get help with courses, schedules, and student life.',
  },
  {
    name: 'Class Representative',
    slug: 'class-representative',
    icon: <Users className="h-12 w-12 text-primary" />,
    description: 'Access tools and information for representing your class.',
  },
  {
    name: 'Senior',
    slug: 'senior',
    icon: <UserCheck className="h-12 w-12 text-primary" />,
    description: 'Find resources for graduation, careers, and alumni services.',
  },
  {
    name: 'Officials',
    slug: 'officials',
    icon: <Briefcase className="h-12 w-12 text-primary" />,
    description: 'Access administrative tools and view student data.',
  }
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold text-primary tracking-tight sm:text-6xl">
          EduBot Central
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground/80">
          Your AI-powered assistant for all things education. Choose your category to get started.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 md:gap-12 max-w-7xl w-full">
        {categories.map((category) => (
          <Link key={category.slug} href={`/help/${category.slug}`} passHref>
            <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-accent cursor-pointer text-center h-full flex flex-col justify-start bg-card">
              <CardHeader className="flex-grow-0">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                  {category.icon}
                </div>
                <CardTitle className="font-headline text-2xl font-semibold text-primary">{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
