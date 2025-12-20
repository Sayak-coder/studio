'use client';
import React from 'react';
import { ImagePlaceholder } from '@/lib/placeholder-images';
import ContentCard from './content-card';

interface ContentRowProps {
  items: ImagePlaceholder[];
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

const ContentRow = ({ items, scrollContainerRef }: ContentRowProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div ref={scrollContainerRef} className="horizontal-scrollbar flex w-full space-x-6 pb-4">
      {items.map((item) => (
        <div key={item.id} className="flex-shrink-0 py-4">
          <ContentCard item={item} />
        </div>
      ))}
    </div>
  );
};

export default ContentRow;
