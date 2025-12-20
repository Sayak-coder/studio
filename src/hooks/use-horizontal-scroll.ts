
'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

const CARD_WIDTH_WITH_GAP = 284; // 260px card + 24px gap

export const useHorizontalScroll = (itemCount: number) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateScrollability = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { clientWidth } = scrollContainerRef.current;
    const cardsInView = Math.floor(clientWidth / CARD_WIDTH_WITH_GAP);
    const maxIndex = Math.max(0, itemCount - cardsInView);

    setCanScrollLeft(currentIndex > 0);
    setCanScrollRight(currentIndex < maxIndex);
  }, [currentIndex, itemCount]);

  useEffect(() => {
    updateScrollability();
    window.addEventListener('resize', updateScrollability);
    return () => window.removeEventListener('resize', updateScrollability);
  }, [updateScrollability]);

  const scrollTo = useCallback((index: number) => {
    if (!scrollContainerRef.current) return;

    const { clientWidth } = scrollContainerRef.current;
    const cardsInView = Math.floor(clientWidth / CARD_WIDTH_WITH_GAP);
    const maxIndex = Math.max(0, itemCount - cardsInView);
    const newIndex = Math.max(0, Math.min(index, maxIndex));

    setCurrentIndex(newIndex);

    const scrollAmount = newIndex * CARD_WIDTH_WITH_GAP;
    scrollContainerRef.current.style.transform = `translateX(-${scrollAmount}px)`;
  }, [itemCount]);

  const scrollLeft = () => {
    scrollTo(currentIndex - 1);
  };

  const scrollRight = () => {
    scrollTo(currentIndex + 1);
  };
  
  return {
    scrollContainerRef,
    scrollLeft,
    scrollRight,
    canScrollLeft,
    canScrollRight,
  };
};
