'use client';
import React from 'react';
import { ImagePlaceholder } from '@/lib/placeholder-images';
import ContentCard from './content-card';

interface ContentRowProps {
  title: string;
  items: ImagePlaceholder[];
}

const ContentRow = ({ title, items }: ContentRowProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-3xl font-bold tracking-tight mb-6">{title}</h2>
      <div className="relative">
        <div className="horizontal-scrollbar -mx-8 flex w-[calc(100%+4rem)] space-x-8 px-8 pb-4 sm:-mx-4 sm:w-[calc(100%+2rem)] sm:space-x-6 sm:px-4 md:-mx-8 md:w-[calc(100%+4rem)] md:space-x-8 md:px-8">
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0">
              <ContentCard item={item} />
            </div>
          ))}
           <div className="flex-shrink-0 w-1"></div>
        </div>
      </div>
    </section>
  );
};

export default ContentRow;
