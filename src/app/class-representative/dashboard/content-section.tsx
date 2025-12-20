'use client';
import React from 'react';
import { Content } from './types';
import { Skeleton } from '@/components/ui/skeleton';
import ContentDisplayCard from './content-display';

interface ContentSectionProps {
  title: string;
  contents: Content[] | null;
  isLoading: boolean;
  onEdit?: (content: Content) => void;
  onDelete?: (id: string) => void;
  isEditable?: boolean;
}

export default function ContentSection({ title, contents, isLoading, onEdit, onDelete, isEditable }: ContentSectionProps) {

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="flex space-x-6">
          {[...Array(3)].map((_, j) => (
            <Skeleton key={j} className="h-64 w-[300px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!contents || contents.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 py-16 text-center">
            <h3 className="text-xl font-bold tracking-tight">No Contributions Found</h3>
            <p className="text-muted-foreground mt-2 text-sm">There are no items to display in this section yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
      <div className="relative">
        <div className="horizontal-scrollbar flex w-full space-x-6 pb-4">
          {contents.map((item) => (
            <ContentDisplayCard 
              key={item.id} 
              item={item} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              isEditable={isEditable}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
