'use client';
import React from 'react';
import { ImagePlaceholder } from '@/lib/placeholder-images';
import ContentCard from './content-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface ContentRowProps {
  title: string;
  items: ImagePlaceholder[];
}

const ContentRow = ({ title, items }: ContentRowProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
       <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <div className="flex gap-2">
                <CarouselPrevious className="relative translate-x-0 translate-y-0 top-0 left-0 static md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                <CarouselNext className="relative translate-x-0 translate-y-0 top-0 right-0 static md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
        <CarouselContent className="-ml-4">
          {items.map((item, index) => (
            <CarouselItem key={index} className="pl-4 basis-auto">
              <ContentCard item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default ContentRow;
