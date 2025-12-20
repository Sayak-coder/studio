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
    scrollAmount,
  } = useHorizontalScroll(items.length);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="group/row relative py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
           <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={cn(
              'h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm transition-opacity disabled:opacity-50',
              !canScrollLeft && 'opacity-50 cursor-not-allowed'
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
              'h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm transition-opacity disabled:opacity-50',
               !canScrollRight && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
            <div
                ref={scrollContainerRef}
                className="flex flex-nowrap gap-6 transition-transform duration-500 ease-in-out"
                style={{
                    transform: `translateX(-${scrollAmount}px)`,
                    willChange: 'transform',
                }}
            >
            {items.map((item, index) => (
                <div key={index} className="flex-shrink-0">
                <ContentCard item={item} />
                </div>
            ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default ContentRow;
