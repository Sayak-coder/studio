import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Github, Linkedin, Twitter } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { creatorsData } from '@/lib/creators-data';

export default function CreatorsPage() {
  return (
    <div className="flex flex-col min-h-screen animated-gradient-background">
      <header className="fixed top-0 left-0 w-full z-50 p-4 flex justify-between items-center bg-transparent">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <ThemeToggle />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="text-center mb-12 animate-fade-in-down">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Meet the Creators
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">
            The passionate team behind EduBot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {creatorsData.map((creator, index) => (
            <Card
              key={creator.id}
              className="group relative overflow-hidden rounded-xl bg-card/60 backdrop-blur-md border-border/20 shadow-lg transition-all duration-300 transform hover:shadow-primary/20 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s`, animationFillMode: 'backwards' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src={creator.photoUrl}
                    alt={creator.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/50 shadow-md transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-accent animate-pulse-slow"></div>
                </div>
                <h3 className="text-2xl font-bold text-foreground">{creator.name}</h3>
                <p className="mt-4 text-muted-foreground text-sm flex-grow min-h-[60px]">{creator.bio}</p>
                <div className="mt-6 flex gap-4">
                  <a href={creator.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin className="h-6 w-6" />
                  </a>
                  <a href={creator.socials.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Github className="h-6 w-6" />
                  </a>
                  <a href={creator.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
