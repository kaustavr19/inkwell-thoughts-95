import { useState, useEffect, useCallback, RefObject } from 'react';

export function useScrollPosition(
  scrollRef: RefObject<HTMLElement>,
  threshold: number = 24
) {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    
    const scrollTop = element.scrollTop;
    setIsScrolled(scrollTop > threshold);
  }, [scrollRef, threshold]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial state
    handleScroll();

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [scrollRef, handleScroll]);

  return isScrolled;
}
