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
            "w-full max-w-[340px] md:w-[320px]",
            "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background",
        )}
        tabIndex={0}
        data-ai-hint={item.imageHint}
    >
      <div className="card-glass-pane absolute inset-0 rounded-[inherit]"></div>
      
       <div className="card-glow-border"></div>

      <div className="relative h-[220px] w-full flex-shrink-0">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>
      
      <div className="relative grid flex-grow grid-rows-[auto_1fr_0fr] p-4 transition-all duration-300 ease-in-out group-hover:grid-rows-[auto_1fr_1fr]">
        <div>
            <Badge variant="secondary" className="mb-2 self-start bg-black/20 text-white backdrop-blur-sm">{item.type}</Badge>
            <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.subject}</p>
        </div>
        
        <div className="self-end" />

        <div className="overflow-hidden">
             <p className="mt-4 text-sm text-foreground/80 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">{item.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
