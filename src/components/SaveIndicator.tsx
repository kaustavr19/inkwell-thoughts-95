import React from 'react';
import { SaveStatus } from '@/hooks/useNote';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface SaveIndicatorProps {
  status: SaveStatus;
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {status === 'saved' && (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span>Saved locally</span>
        </>
      )}
      {status === 'saving' && (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === 'unsaved' && (
        <>
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>Unsaved changes</span>
        </>
      )}
    </div>
  );
}
