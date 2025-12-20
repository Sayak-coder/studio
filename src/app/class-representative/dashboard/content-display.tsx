'use client';
import React from 'react';
import { Content } from './types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, FileSymlink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContentDisplayProps {
  item: Content;
  onEdit?: (content: Content) => void;
  onDelete?: (id: string) => void;
  isEditable?: boolean;
}

export default function ContentDisplayCard({ item, onEdit, onDelete, isEditable = false }: ContentDisplayProps) {
  return (
    <Card className="min-w-[300px] max-w-[300px] flex flex-col group animated-gradient-border transform transition-all duration-300 hover:-translate-y-2">
      <CardHeader>
        <CardTitle className="truncate">{item.title}</CardTitle>
        <CardDescription>Subject: {item.subject}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
        <p className="text-xs text-muted-foreground/80 mt-2">By: {item.authorName}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {item.fileUrl && (
          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <FileSymlink className="h-4 w-4" />
              View Attachment
            </Button>
          </a>
        )}

        {isEditable && onEdit && onDelete && (
          <div className="flex justify-end gap-2 ml-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Edit</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Delete</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
