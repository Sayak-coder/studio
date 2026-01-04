import Link from 'next/link';
import { BookOpen, Users, GraduationCap, Briefcase, BrainCircuit, Bot, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import AICategoryHelp from './category-help';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


export default function Home() {
  const portals = [
    {
      name: 'Student Portal',
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      description: 'Access notes, PYQs, and important questions before exams.',
      cta: 'Enter as Student',
      href: '/student/dashboard',
    },
    {
      name: 'Class Representative (CR) Portal',
      icon: <Users className="h-10 w-10 text-primary" />,
      description: 'Manage, verify, and upload academic content for your class.',
      cta: 'Enter as CR',
      href: '/class-representative/dashboard',
    },
    {
      name: 'Senior Portal',
      icon: <GraduationCap className="h-10 w-10 text-primary" />,
      description: 'Guide juniors with curated notes and exam-focused insights.',
      cta: 'Enter as Senior',
      href: '/senior/dashboard',
    },
    {
      name: 'Official Portal',
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      description: 'Admins and officials: Manage users and oversee content.',
      cta: 'Enter Official Portal',
      href: '/official',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </header>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 text-center animate-fade-in-down overflow-hidden animated-gradient-background">
           <div className="absolute inset-0 bg-background/50 dark:bg-background/70"></div>
          <div className="container relative px-4 md:px-6">
            <a href="#about-edubot" className="inline-flex justify-center items-center gap-4 cursor-pointer">
              <BrainCircuit className="h-12 w-12 md:h-16 md:w-16 text-primary" />
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                EduBot
              </h1>
            </a>
            <div className="mt-4 text-lg md:text-xl text-muted-foreground animate-fade-in-up [animation-delay:0.2s]">
              Smarter exam preparation, powered by{' '}
              <Button variant="link" asChild className="p-0 text-lg md:text-xl font-bold">
                <Link href="/creators">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent cursor-pointer">
                    Catalyst
                  </span>
                </Link>
              </Button>
            </div>
             {/* AI-Powered Study Helper Section */}
            <div className="mt-12 max-w-2xl mx-auto">
              <Card className="bg-card/80 backdrop-blur-sm text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Bot className="h-8 w-8 text-primary" />
                    AI-Powered Study Helper
                  </CardTitle>
                   <CardDescription>
                    Enter a topic to get a quick summary and find related subjects.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AICategoryHelp />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Interaction Section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
              {portals.map((portal, index) => (
                <Card
                  key={portal.name}
                  className={`flex flex-col text-center bg-card/80 backdrop-blur-sm rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <CardHeader className="items-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110">
                      {portal.icon}
                    </div>
                    <CardTitle className="text-2xl font-semibold">{portal.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <CardDescription className="mb-6 text-base">{portal.description}</CardDescription>
                    <Link href={portal.href} passHref>
                      <Button className="w-full">
                        {portal.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about-edubot" className="py-24 md:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                What is EduBot?
              </h2>
              <p className="text-lg text-muted-foreground">
                EduBot is your ultimate exam sidekick! It brings together students, class reps, and seniors to share curated notes, past papers (PYQs), and key topics. Everything is verified, so you can study smarter, not harder. Say goodbye to exam stress and hello to streamlined success.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="py-6 bg-secondary/50">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>EduBot — Built by students, trusted by students.</p>
        </div>
      </footer>
    </div>
  );
}
