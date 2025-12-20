'use client';
import React, { useRef, useEffect } from 'react';
import { Search, X, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/hooks/use-search';
import { ImagePlaceholder } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  onSearchChange: (results: ImagePlaceholder[] | null) => void;
}

const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="font-bold text-primary">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};


export default function GlobalSearch({ onSearchChange }: GlobalSearchProps) {
  const {
    query,
    handleQueryChange,
    filteredResults,
    recentSearches,
    clearRecentSearches,
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    isFocused,
    setIsFocused,
    selectItem,
  } = useSearch(onSearchChange);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsFocused]);
  
  const showResults = isFocused && (query.length > 0 || recentSearches.length > 0);

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search notes, PYQs, videos..."
          className="w-full rounded-full bg-secondary/80 pl-10 pr-10 text-base focus:ring-2 focus:ring-primary/50"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
            onClick={() => handleQueryChange('')}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full z-20 mt-2 w-full overflow-hidden rounded-lg border bg-background shadow-lg">
          <ul className="max-h-[400px] overflow-y-auto">
            {query.length > 0 ? (
              // Show search results
              filteredResults.length > 0 ? (
                filteredResults.map((item, index) => (
                  <li
                    key={item.id}
                    className={cn(
                      'cursor-pointer p-3 hover:bg-muted',
                      activeIndex === index && 'bg-muted'
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectItem(item.title)}
                  >
                    <div className="font-semibold">
                      <HighlightedText text={item.title} highlight={query} />
                    </div>
                    <div className="text-sm text-muted-foreground">{item.subject}</div>
                  </li>
                ))
              ) : (
                <li className="p-3 text-center text-muted-foreground">No results found.</li>
              )
            ) : (
              // Show recent searches
              <>
                <div className="flex items-center justify-between p-3">
                    <h4 className="font-semibold text-muted-foreground">Recent Searches</h4>
                    {recentSearches.length > 0 && (
                        <Button variant="link" className="h-auto p-0 text-sm" onClick={clearRecentSearches}>
                            Clear
                        </Button>
                    )}
                </div>
                {recentSearches.length > 0 ? (
                    recentSearches.map((term, index) => (
                    <li
                        key={term + index}
                        className={cn(
                            'flex cursor-pointer items-center gap-3 p-3 hover:bg-muted',
                            activeIndex === index && 'bg-muted'
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectItem(term)}
                    >
                        <History className="h-4 w-4 text-muted-foreground" />
                        <span>{term}</span>
                    </li>
                    ))
                ) : (
                     <li className="p-3 text-center text-muted-foreground">No recent searches.</li>
                )}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
