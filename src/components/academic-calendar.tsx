'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AcademicCalendar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Academic Calendar 2026
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Academic Calendar 2026</DialogTitle>
        </DialogHeader>
        <div className="relative w-full">
          <Image
            src="/academic-calendar-2026.jpg"
            alt="Academic Calendar 2026 - RCC Institute of Information Technology"
            width={1200}
            height={900}
            className="w-full h-auto rounded-lg"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
