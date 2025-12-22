'use client';
import React from 'react';
import { Content } from './types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, FileSymlink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContentCardProps {
  item: Content;
  onEdit: (content: Content) => void;
  onDelete: (id: string) => void;
  isEditable: boolean;
}

const ContentCard = ({ item, onEdit, onDelete, isEditable }: ContentCardProps) => {
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const CardInnerContent = (
    <div
      className={cn(
        'content-card group relative flex flex-col',
        'w-[280px]',
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background'
      )}
      tabIndex={0}
    >
      <div className="card-glass-pane absolute inset-0 rounded-[inherit]"></div>

      <div className="relative h-[160px] w-full flex-shrink-0">
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          {isEditable && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => {
                        stopPropagation(e);
                        onEdit(item);
                      }}
                      aria-label={`Edit ${item.title}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => {
                        stopPropagation(e);
                        onDelete(item.id);
                      }}
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {item.fileUrl ? (
             <FileSymlink className="h-10 w-10 text-white" />
          ) : (
             <div className="text-center text-white px-4">
                <p className="font-semibold">No File Attached</p>
             </div>
          )}
        </div>
        <div className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="relative flex flex-grow flex-col p-4">
        <div>
          <Badge
            variant="secondary"
            className="mb-2 self-start bg-black/20 text-white backdrop-blur-sm"
          >
            {item.type}
          </Badge>
          <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{item.subject}</p>
        </div>
        <div className="mt-4 max-h-0 text-sm text-foreground/80 opacity-0 transition-all duration-300 ease-in-out group-hover:max-h-40 group-hover:opacity-100">
          {item.content}
        </div>
        <p className="text-xs text-muted-foreground/80 mt-2 pt-2 border-t border-muted-foreground/20">
          By: {item.authorName}
        </p>
      </div>
    </div>
  );

  if (item.fileUrl) {
    return (
      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
        {CardInnerContent}
      </a>
    );
  }

  return CardInnerContent;
};

export default ContentCard;
