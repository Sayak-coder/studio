'use client';
import React from 'react';
import { Content } from './types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Trash2, FileSymlink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContentDisplayProps {
  contents: Content[] | null;
  isLoading: boolean;
  onEdit: (content: Content) => void;
  onDelete: (id: string) => void;
}

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

const ContentCard = ({ item, onEdit, onDelete }: { item: Content, onEdit: (content: Content) => void, onDelete: (id: string) => void }) => {
  const cardContent = (
    <Card className="min-w-[300px] max-w-[300px] h-full flex flex-col group animated-gradient-border transform transition-all duration-300 hover:-translate-y-2">
      <CardHeader>
        <CardTitle className="truncate">{item.title}</CardTitle>
        <CardDescription>Subject: {item.subject}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {item.fileUrl && (
          <Button variant="outline" size="sm" className="gap-2">
            <FileSymlink className="h-4 w-4" />
            View Attachment
          </Button>
        )}
        <div className="flex justify-end gap-2 ml-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => { stopPropagation(e); onEdit(item); }}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Edit</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { stopPropagation(e); onDelete(item.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Delete</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );

  if (item.fileUrl) {
    return (
      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

const ContentRow = ({ title, items, onEdit, onDelete }: { title: string, items: Content[], onEdit: (content: Content) => void, onDelete: (id: string) => void }) => {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
      <div className="relative">
        <div className="horizontal-scrollbar flex w-full space-x-6 pb-4">
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0" style={{width: '300px'}}>
              <ContentCard item={item} onEdit={onEdit} onDelete={onDelete} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default function ContentDisplay({ contents, isLoading, onEdit, onDelete }: ContentDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="flex space-x-6">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-64 w-[300px] rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!contents || contents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 py-24 text-center">
        <h3 className="text-2xl font-bold tracking-tight">No Contributions Yet</h3>
        <p className="text-muted-foreground mt-2">Click the "Add New" button to share your knowledge!</p>
      </div>
    );
  }
  
  const notes = contents.filter(c => c.type === 'Class Notes');
  const pyqs = contents.filter(c => c.type === 'PYQ');
  const importantQuestions = contents.filter(c => c.type === 'Important Question');

  return (
    <div className="space-y-12">
      <ContentRow title="My Class Notes" items={notes} onEdit={onEdit} onDelete={onDelete} />
      <ContentRow title="My Previous Year Questions" items={pyqs} onEdit={onEdit} onDelete={onDelete} />
      <ContentRow title="My Important Questions" items={importantQuestions} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
