'use client';
import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { StudentContent } from './types';
import { Badge } from '@/components/ui/badge';

interface ContentCardProps {
  item: StudentContent;
}

const ContentCard = ({ item }: ContentCardProps) => {
  return (
    <Card className="group relative min-w-[200px] max-w-[200px] h-[240px] overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:z-10 hover:-translate-y-2 hover:scale-105 animated-gradient-border">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-300"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="relative flex flex-col justify-end h-full p-4 text-white">
        <h3 className="text-lg font-bold truncate">{item.title}</h3>
        <p className="text-sm text-muted-foreground text-white/80">{item.subject}</p>
        <div className="mt-2">
           <Badge variant="secondary">{item.type}</Badge>
        </div>
      </div>
    </Card>
  );
};

export default ContentCard;
