'use client';
import React from 'react';
import { ImagePlaceholder } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  item: ImagePlaceholder;
}

const ContentCard = ({ item }: ContentCardProps) => {
  return (
    <div 
        className={cn(
            "content-card group relative flex flex-col",
            "w-full max-w-[340px] h-[440px] md:w-[320px] md:h-[420px]", // Responsive dimensions
            "focus-within:ring-2 focus-within:ring-amber-400 focus-within:ring-offset-2 focus-within:ring-offset-background"
        )}
        tabIndex={0}
        data-ai-hint={item.imageHint}
    >
      <div className="relative h-[220px] w-full flex-shrink-0">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>
      
      <div className="flex flex-grow flex-col p-4">
        <Badge variant="secondary" className="mb-2 self-start bg-secondary/80">{item.type}</Badge>
        <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{item.subject}</p>
        <p className="mt-4 flex-grow text-sm text-foreground/80 line-clamp-3">{item.description}</p>
      </div>
    </div>
  );
};

export default ContentCard;
