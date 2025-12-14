import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, UserCheck } from 'lucide-react';

const portals = [
  {
    name: 'Student Portal',
    slug: 'student',
    icon: <GraduationCap className="h-10 w-10 text-primary group-hover:text-white transition-colors duration-300" />,
    description: 'Access notes, PYQs, and important questions before exams.',
    cta: 'Enter as Student',
    hoverClass: 'hover:bg-primary/90 hover:shadow-soft-lg',
  },
  {
    name: 'Class Representative (CR) Portal',
    slug: 'class-representative',
    icon: <Users className="h-10 w-10 text-primary group-hover:text-white transition-colors duration-300" />,
    description: 'Manage, verify, and upload academic content for your class.',
    cta: 'Enter as CR',
    highlightClass: 'border-primary/50 shadow-soft-lg',
    hoverClass: 'hover:bg-primary/90 hover:shadow-soft-lg',
  },
  {
    name: 'Senior Portal',
    slug: 'senior',
    icon: <UserCheck className="h-10 w-10 text-primary group-hover:text-white transition-colors duration-300" />,
    description: 'Guide juniors with curated notes and exam-focused insights.',
    cta: 'Enter as Senior',
    hoverClass: 'hover:bg-primary/90 hover:shadow-soft-lg',
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4 sm:p-8 overflow-hidden">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-6xl md:text-8xl font-bold text-primary tracking-tighter fade-in" style={{ animationDelay: '0.2s' }}>
          EduBot
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 slide-up" style={{ animationDelay: '0.4s' }}>
          Smarter exam preparation, powered by seniors.
        </p>
         <p className="max-w-2xl text-md text-foreground/60 slide-up" style={{ animationDelay: '0.6s' }}>
          Your AI-powered assistant for all things education. Choose your portal to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10 max-w-6xl w-full">
        {portals.map((portal, index) => (
          <div key={portal.slug} className="fade-in" style={{ animationDelay: `${0.8 + index * 0.2}s` }}>
            <Link href={`/help/${portal.slug}`} passHref>
              <Card 
                className={`group relative text-center h-full flex flex-col justify-between p-8 rounded-2xl bg-card/80 backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-2 ${portal.hoverClass} ${portal.highlightClass || ''}`}
              >
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all duration-300 group-hover:bg-white/20">
                    {portal.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-primary group-hover:text-white transition-colors duration-300">{portal.name}</h2>
                  <p className="text-muted-foreground text-base group-hover:text-white/80 transition-colors duration-300">{portal.description}</p>
                </div>
                <Button variant="secondary" className="w-full mt-8 bg-primary/10 text-primary group-hover:bg-white group-hover:text-primary transition-all duration-300">
                  {portal.cta}
                </Button>
              </Card>
            </Link>
          </div>
        ))}
      </div>
       <footer className="w-full text-center p-8 mt-16 fade-in" style={{ animationDelay: '1.6s' }}>
        <p className="text-foreground/60">
          EduBot — Built by students, trusted by students.
        </p>
        <div className="flex justify-center gap-4 mt-2">
            <Link href="#" className="text-sm text-primary hover:underline">About</Link>
            <Link href="#" className="text-sm text-primary hover:underline">Contact</Link>
            <Link href="#" className="text-sm text-primary hover:underline">Privacy</Link>
        </div>
      </footer>
    </main>
  );
}
