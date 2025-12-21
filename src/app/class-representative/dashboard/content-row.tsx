'use client';
import React from 'react';
import { Content } from './types';
import ContentCard from './content-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHorizontalScroll } from '@/hooks/use-horizontal-scroll';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentRowProps {
  title: string;
  items: Content[] | null;
  isLoading: boolean;
  onEdit: (content: Content) => void;
  onDelete: (id: string) => void;
  isEditable: boolean;
}

const ContentRow = ({ title, items, isLoading, onEdit, onDelete, isEditable }: ContentRowProps) => {
  const { scrollContainerRef, scrollLeft, scrollRight, canScrollLeft, canScrollRight } = useHorizontalScroll();
  
  if (isLoading) {
    return (
      <section>
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="flex space-x-6 pb-4">
          {[...Array(3)].map((_, j) => (
            <Skeleton key={j} className="h-[280px] w-[280px] rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) {
     return (
      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-4">{title}</h2>
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 py-16 text-center">
            <h3 className="text-xl font-bold tracking-tight">No Contributions Found</h3>
            <p className="text-muted-foreground mt-2 text-sm">There are no items to display in this section yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={cn('h-9 w-9 cursor-pointer rounded-full bg-background/80 backdrop-blur-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50')}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={cn('h-9 w-9 cursor-pointer rounded-full bg-background/80 backdrop-blur-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50')}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <div ref={scrollContainerRef} className="horizontal-scrollbar flex w-full space-x-6 pb-4">
        {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 py-4">
            <ContentCard 
              item={item} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              isEditable={isEditable}
            />
            </div>
        ))}
       </div>
    </section>
  );
};

export default ContentRow;
