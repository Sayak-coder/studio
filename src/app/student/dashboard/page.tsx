'use client';

import { Book, Bot, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AICategoryHelp from './category-help';

export default function StudentDashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 py-4 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-400">
            Student Dashboard
          </h1>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* PYQs Card */}
            <Card className="animated-gradient-border transform transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">PYQs</CardTitle>
                <Book className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access Previous Year Questions to ace your exams.
                </p>
              </CardContent>
            </Card>

            {/* Class Notes Card */}
            <Card className="animated-gradient-border transform transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Class Notes</CardTitle>
                <FileText className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Find all your class notes, compiled and verified.
                </p>
              </CardContent>
            </Card>

            {/* Important Questions Card */}
            <Card className="animated-gradient-border transform transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  Important Questions
                </CardTitle>
                <FileText className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A curated list of important questions for all subjects.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI-Powered Study Helper Section */}
          <div className="mt-12">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Bot className="h-8 w-8 text-primary" />
                  AI-Powered Study Helper
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AICategoryHelp />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
