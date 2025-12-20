'use client';
import React from 'react';
import { ImagePlaceholder } from '@/lib/placeholder-images';
import ContentCard from './content-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHorizontalScroll } from '@/hooks/use-horizontal-scroll';
import { cn } from '@/lib/utils';

interface ContentRowProps {
  title: string;
  items: ImagePlaceholder[];
}

const ContentRow = ({ title, items }: ContentRowProps) => {
  const { 
    scrollContainerRef, 
    scrollLeft, 
    scrollRight, 
    canScrollLeft, 
    canScrollRight,
  } = useHorizontalScroll();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
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

      <div 
        ref={scrollContainerRef}
        className="horizontal-scrollbar flex w-full space-x-6 pb-4"
        >
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 py-4">
              <ContentCard item={item} />
            </div>
          ))}
      </div>
    </section>
  );
};

export default ContentRow;
