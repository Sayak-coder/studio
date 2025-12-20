'use client';
import React from 'react';
import Link from 'next/link';
import { ImagePlaceholder } from '@/lib/placeholder-images';
import ContentRow from './content-row';

interface SubjectSectionProps {
  subject: string;
  items: ImagePlaceholder[];
  category: string;
}

const SubjectSection = ({ subject, items, category }: SubjectSectionProps) => {
  if (!items || items.length === 0) {
    return null;
  }
  
  const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-');
  const categorySlug = category.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="py-2">
      <Link href={`/student/${categorySlug}/${subjectSlug}`} passHref>
        <h2 className="text-3xl font-bold tracking-tight mb-4 hover:text-primary transition-colors cursor-pointer">
          {subject}
        </h2>
      </Link>
      <ContentRow title={subject} items={items} />
    </div>
  );
};

export default SubjectSection;
