
'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

const CARD_WIDTH_WITH_GAP = 300; // Adjusted for card width + gap

export const useHorizontalScroll = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollability = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    // Check if we can scroll left (not at the beginning)
    setCanScrollLeft(scrollLeft > 0);
    // Check if we can scroll right (not at the end)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for precision
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Initial check
      updateScrollability();
      // Listen for scroll events on the container
      container.addEventListener('scroll', updateScrollability);
      // Also check on resize
      window.addEventListener('resize', updateScrollability);
      
      // Cleanup
      return () => {
        container.removeEventListener('scroll', updateScrollability);
        window.removeEventListener('resize', updateScrollability);
      };
    }
  }, [updateScrollability]);
  
  const scrollBy = (amount: number) => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  }

  const scrollLeft = () => {
    scrollBy(-CARD_WIDTH_WITH_GAP);
  };

  const scrollRight = () => {
    scrollBy(CARD_WIDTH_WITH_GAP);
  };
  
  return {
    scrollContainerRef,
    scrollLeft,
    scrollRight,
    canScrollLeft,
    canScrollRight,
  };
};
