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
  
  const categoryTitle = category === 'pyq' ? 'PYQs' : category === 'imp-questions' ? 'Important Questions' : category.charAt(0).toUpperCase() + category.slice(1);
  const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-');
  const categorySlug = category.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="py-6">
      <Link href={`/student/${categorySlug}/${subjectSlug}`} passHref>
        <h2 className="text-3xl font-bold tracking-tight mb-4 hover:text-primary transition-colors cursor-pointer">
          {subject} {categoryTitle}
        </h2>
      </Link>
      <ContentRow items={items} />
    </div>
  );
};

export default SubjectSection;
