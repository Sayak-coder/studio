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
    canScrollRight 
  } = useHorizontalScroll(items.length);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="group/row relative py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="overflow-hidden"
        >
            <div
            className="flex flex-nowrap gap-6 transition-transform duration-500 ease-in-out"
            style={{ willChange: 'transform' }}
            >
            {items.map((item, index) => (
                <div key={index} className="flex-shrink-0">
                <ContentCard item={item} />
                </div>
            ))}
            </div>
        </div>
        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm transition-opacity opacity-0 group-hover/row:opacity-100 disabled:opacity-0 cursor-pointer'
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm transition-opacity opacity-0 group-hover/row:opacity-100 disabled:opacity-0 cursor-pointer'
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </section>
  );
};

export default ContentRow;
