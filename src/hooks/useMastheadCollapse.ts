import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * Hook that uses IntersectionObserver with a sentinel element to detect
 * when the masthead should collapse. This is more reliable than scroll events.
 * 
 * @param scrollContainerRef - Ref to the scrollable container
 * @returns [sentinelRef, isCollapsed] - Ref to attach to sentinel, collapse state
 */
export function useMastheadCollapse(
  scrollContainerRef: RefObject<HTMLElement>
): [RefObject<HTMLDivElement>, boolean] {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollContainer = scrollContainerRef.current;

    if (!sentinel || !scrollContainer) return;

    // Create observer with scroll container as root
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Collapsed when sentinel is not visible (scrolled past threshold)
        setIsCollapsed(!entry.isIntersecting);
      },
      {
        root: scrollContainer,
        rootMargin: '-24px 0px 0px 0px', // 24px threshold from top
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [scrollContainerRef]);

  return [sentinelRef, isCollapsed];
}
