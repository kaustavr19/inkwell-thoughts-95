import React, { useState, useEffect, useRef } from 'react';
import { SaveStatus } from '@/hooks/useNote';

interface SaveIndicatorProps {
  status: SaveStatus;
  savedAt: Date | null;
}

export function SaveIndicator({ status, savedAt }: SaveIndicatorProps) {
  const [displayText, setDisplayText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (status === 'saving') {
      setDisplayText('Saving…');
    } else if (status === 'saved' && savedAt) {
      setDisplayText(`Saved ${getTimeAgo(savedAt)}`);
      
      // Update the time periodically
      intervalRef.current = setInterval(() => {
        setDisplayText(`Saved ${getTimeAgo(savedAt)}`);
      }, 10000);
    } else if (status === 'unsaved') {
      setDisplayText('Editing…');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, savedAt]);

  return (
    <span className="save-indicator">
      {displayText}
    </span>
  );
}
