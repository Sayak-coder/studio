import Link from 'next/link';
import { BookOpen, Users, GraduationCap, Briefcase, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';


export default function Home() {
  const portals = [
    {
      name: 'Student Portal',
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      description: 'Access notes, PYQs, and important questions before exams.',
      cta: 'Enter as Student',
      href: '/help/student',
      highlight: false,
      hoverClass: 'hover:border-primary/50 hover:shadow-lg',
    },
    {
      name: 'Class Representative (CR) Portal',
      icon: <Users className="h-10 w-10 text-primary" />,
      description: 'Manage, verify, and upload academic content for your class.',
      cta: 'Enter as CR',
      href: '/help/class-representative',
      highlight: true,
      hoverClass: 'animated-gradient-border',
    },
    {
      name: 'Senior Portal',
      icon: <GraduationCap className="h-10 w-10 text-primary" />,
      description: 'Guide juniors with curated notes and exam-focused insights.',
      cta: 'Enter as Senior',
      href: '/help/senior',
      highlight: false,
      hoverClass: 'hover:border-primary/50 hover:shadow-lg',
    },
    {
      name: 'Official Portal',
      icon: <Briefcase className="h-10 w-10 text-primary" />,
      description: 'Access and manage all user data with administrative privileges.',
      cta: 'Enter as Official',
      href: '/auth/official',
      highlight: false,
      hoverClass: 'hover:border-primary/50 hover:shadow-lg',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </header>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-24 md:py-32 text-center animate-fade-in-down">
          <div className="container px-4 md:px-6">
            <a href="#about-edubot" className="inline-flex justify-center items-center gap-4 cursor-pointer">
              <BrainCircuit className="h-12 w-12 md:h-16 md:w-16 text-primary" />
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-400">
                EduBot
              </h1>
            </a>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground animate-fade-in-up [animation-delay:0.2s]">
              Smarter exam preparation, powered by seniors.
            </p>
          </div>
        </section>

        {/* Main Interaction Section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
              {portals.map((portal, index) => (
                <Card
                  key={portal.name}
                  className={`flex flex-col text-center bg-card/80 backdrop-blur-sm rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-2 ${portal.hoverClass} ${portal.highlight ? 'border-primary/30' : ''} animate-fade-in-up`}
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
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-shadow">
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-400">
                What is EduBot?
              </h2>
              <p className="text-lg text-muted-foreground">
                EduBot is a collaborative platform designed to revolutionize exam preparation. It connects students, class representatives, and seniors to create a centralized hub for academic resources. Students can access curated notes, previous year questions (PYQs), and important topics, all verified and managed by their trusted class representatives and experienced seniors. Our mission is to make studying smarter, more efficient, and less stressful for everyone.
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
