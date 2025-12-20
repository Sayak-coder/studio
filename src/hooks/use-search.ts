'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ImagePlaceholder, PlaceHolderImages } from '@/lib/placeholder-images';
import { useDebounce } from './use-debounce';

const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'edubot_recent_searches';

export const useSearch = (onSearchChange: (results: ImagePlaceholder[] | null) => void) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    try {
      const storedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, []);

  const filteredResults = useMemo(() => {
    if (!debouncedQuery) {
      return [];
    }
    const lowerCaseQuery = debouncedQuery.toLowerCase().trim();
    
    // Map keywords to content types
    const categoryKeywords: { [key: string]: ImagePlaceholder['type'] } = {
      'notes': 'Class Notes',
      'class notes': 'Class Notes',
      'pyq': 'PYQ',
      'pyqs': 'PYQ',
      'previous year question': 'PYQ',
      'previous year questions': 'PYQ',
      'important question': 'Important Question',
      'important questions': 'Important Question',
      'video': 'Video',
      'videos': 'Video',
    };

    const matchedCategory = categoryKeywords[lowerCaseQuery];

    if (matchedCategory) {
      // If the query is a category keyword, filter by type
      return PlaceHolderImages.filter(item => item.type === matchedCategory);
    } else {
      // Otherwise, search by title and subject
      return PlaceHolderImages.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerCaseQuery) ||
          item.subject.toLowerCase().includes(lowerCaseQuery)
      );
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (debouncedQuery) {
      onSearchChange(filteredResults);
    } else {
      onSearchChange(null); // Reset/clear search results
    }
    setActiveIndex(-1); // Reset active index on new results
  }, [filteredResults, debouncedQuery, onSearchChange]);

  const addRecentSearch = useCallback((searchTerm: string) => {
    if (!searchTerm) return;
    try {
      setRecentSearches((prev) => {
        const newSearches = [searchTerm, ...prev.filter((s) => s !== searchTerm)].slice(
          0,
          MAX_RECENT_SEARCHES
        );
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
        return newSearches;
      });
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, []);
  
  const clearRecentSearches = useCallback(() => {
    try {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
       console.error("Could not access localStorage:", error);
    }
  }, []);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
  };
  
  const selectItem = (item: string) => {
    handleQueryChange(item);
    addRecentSearch(item);
    setIsFocused(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const items = debouncedQuery ? filteredResults : recentSearches;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < items.length) {
        const selectedItem = items[activeIndex];
        const searchTerm = typeof selectedItem === 'string' ? selectedItem : selectedItem.title;
        selectItem(searchTerm);
      } else if (query) {
        addRecentSearch(query);
        setIsFocused(false);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  return {
    query,
    handleQueryChange,
    filteredResults,
    recentSearches,
    clearRecentSearches,
    addRecentSearch,
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    isFocused,
    setIsFocused,
    selectItem,
  };
};
