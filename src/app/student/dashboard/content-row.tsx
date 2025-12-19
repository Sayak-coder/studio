'use client';
import React from 'react';
import { StudentContent } from './types';
import ContentCard from './content-card';

interface ContentRowProps {
  title: string;
  items: StudentContent[];
}

const ContentRow = ({ title, items }: ContentRowProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
      <div className="relative">
        <div className="horizontal-scrollbar flex w-full space-x-6 pb-4">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
           <div className="flex-shrink-0 w-1"></div>
        </div>
      </div>
    </section>
  );
};

export default ContentRow;
