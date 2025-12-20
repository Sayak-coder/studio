'use client';
import React from 'react';
import Link from 'next/link';
import { ImagePlaceholder } from '@/lib/placeholder-images';
import ContentRow from './content-row';
import { useHorizontalScroll } from '@/hooks/use-horizontal-scroll';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectSectionProps {
  subject: string;
  items: ImagePlaceholder[];
  category: string;
}

const SubjectSection = ({ subject, items, category }: SubjectSectionProps) => {
  const { scrollContainerRef, scrollLeft, scrollRight, canScrollLeft, canScrollRight } = useHorizontalScroll();
  
  if (!items || items.length === 0) {
    return null;
  }
  
  const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-');
  const categorySlug = category.toLowerCase().replace(/\s+/g, '-');

  return (
    <section className="py-2">
      <div className="mb-4 flex items-center justify-between">
         <Link href={`/student/${categorySlug}/${subjectSlug}`} passHref>
            <h2 className="text-3xl font-bold tracking-tight hover:text-primary transition-colors cursor-pointer">
              {subject}
            </h2>
          </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={cn(
              'h-9 w-9 cursor-pointer rounded-full bg-background/80 backdrop-blur-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50',
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={cn(
              'h-9 w-9 cursor-pointer rounded-full bg-background/80 backdrop-blur-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50',
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <ContentRow items={items} scrollContainerRef={scrollContainerRef} />
    </section>
  );
};

export default SubjectSection;
