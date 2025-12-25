import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NoteData,
  DrawingStroke,
  saveNote,
  loadLatestNote,
  createNewNote,
  exportToMarkdown,
  importFromMarkdown,
} from '@/lib/storage';

const AUTOSAVE_DELAY = 3000;

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

export function useNote() {
  const [note, setNote] = useState<NoteData | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  // Load note on mount
  useEffect(() => {
    async function loadInitialNote() {
      try {
        const existingNote = await loadLatestNote();
        if (existingNote) {
          setNote(existingNote);
          lastSavedRef.current = JSON.stringify(existingNote);
        } else {
          const newNote = createNewNote();
          setNote(newNote);
          await saveNote(newNote);
          lastSavedRef.current = JSON.stringify(newNote);
        }
      } catch (error) {
        console.error('Failed to load note:', error);
        const newNote = createNewNote();
        setNote(newNote);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialNote();
  }, []);

  // Autosave logic
  const scheduleSave = useCallback((updatedNote: NoteData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('unsaved');

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        await saveNote(updatedNote);
        lastSavedRef.current = JSON.stringify(updatedNote);
        setSaveStatus('saved');
      } catch (error) {
        console.error('Failed to save note:', error);
        setSaveStatus('unsaved');
      }
    }, AUTOSAVE_DELAY);
  }, []);

  // Update content
  const updateContent = useCallback(
    (content: string) => {
      setNote((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, content };
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave]
  );

  // Update title
  const updateTitle = useCallback(
    (title: string) => {
      setNote((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, title };
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave]
  );

  // Update theme
  const updateTheme = useCallback(
    (theme: NoteData['theme']) => {
      setNote((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, theme };
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave]
  );

  // Update layout
  const updateLayout = useCallback(
    (layout: NoteData['layout']) => {
      setNote((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, layout };
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave]
  );

  // Update drawings
  const updateDrawings = useCallback(
    (drawings: DrawingStroke[]) => {
      setNote((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, drawings };
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave]
  );

  // Add a stroke
  const addStroke = useCallback(
    (stroke: DrawingStroke) => {
      setNote((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, drawings: [...prev.drawings, stroke] };
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave]
  );

  // Remove a specific stroke by id
  const removeStroke = useCallback(
    (strokeId: string) => {
      setNote((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, drawings: prev.drawings.filter(s => s.id !== strokeId) };
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave]
  );

  // Undo last stroke
  const undoStroke = useCallback(() => {
    setNote((prev) => {
      if (!prev || prev.drawings.length === 0) return prev;
      const updated = { ...prev, drawings: prev.drawings.slice(0, -1) };
      scheduleSave(updated);
      return updated;
    });
  }, [scheduleSave]);

  // Clear all drawings
  const clearDrawings = useCallback(() => {
    setNote((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, drawings: [] };
      scheduleSave(updated);
      return updated;
    });
  }, [scheduleSave]);

  // Export note
  const exportNote = useCallback(() => {
    if (!note) return;

    const markdown = exportToMarkdown(note);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [note]);

  // Import note
  const importNote = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const imported = importFromMarkdown(text);
        const newNote: NoteData = {
          ...createNewNote(),
          ...imported,
          title: imported.title || file.name.replace(/\.md$/, ''),
        };
        setNote(newNote);
        await saveNote(newNote);
        lastSavedRef.current = JSON.stringify(newNote);
        setSaveStatus('saved');
      } catch (error) {
        console.error('Failed to import note:', error);
        throw error;
      }
    },
    []
  );

  // Create new note
  const createNew = useCallback(async () => {
    const newNote = createNewNote();
    setNote(newNote);
    await saveNote(newNote);
    lastSavedRef.current = JSON.stringify(newNote);
    setSaveStatus('saved');
  }, []);

  // Force save
  const forceSave = useCallback(async () => {
    if (!note) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSaveStatus('saving');
    try {
      await saveNote(note);
      lastSavedRef.current = JSON.stringify(note);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Failed to save note:', error);
      setSaveStatus('unsaved');
    }
  }, [note]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    note,
    isLoading,
    saveStatus,
    updateContent,
    updateTitle,
    updateTheme,
    updateLayout,
    updateDrawings,
    addStroke,
    removeStroke,
    undoStroke,
    clearDrawings,
    exportNote,
    importNote,
    createNew,
    forceSave,
  };
}
