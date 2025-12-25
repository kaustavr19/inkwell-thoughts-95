import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface DrawingStroke {
  id: string;
  tool: 'pen' | 'highlighter';
  color: string;
  size: number;
  points: { x: number; y: number; pressure?: number }[];
}

export interface NoteData {
  id: string;
  title: string;
  content: string;
  drawings: DrawingStroke[];
  theme: 'light' | 'dark' | 'nightlight';
  layout: 'split' | 'write' | 'preview';
  updatedAt: string;
  createdAt: string;
}

interface InkPadDB extends DBSchema {
  notes: {
    key: string;
    value: NoteData;
    indexes: { 'by-updated': string };
  };
  settings: {
    key: string;
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<InkPadDB>> | null = null;

function getDB(): Promise<IDBPDatabase<InkPadDB>> {
  if (!dbPromise) {
    dbPromise = openDB<InkPadDB>('inkpad-db', 1, {
      upgrade(db) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('by-updated', 'updatedAt');
        db.createObjectStore('settings');
      },
    });
  }
  return dbPromise;
}

export async function saveNote(note: NoteData): Promise<void> {
  const db = await getDB();
  await db.put('notes', { ...note, updatedAt: new Date().toISOString() });
}

export async function loadNote(id: string): Promise<NoteData | undefined> {
  const db = await getDB();
  return db.get('notes', id);
}

export async function loadLatestNote(): Promise<NoteData | undefined> {
  const db = await getDB();
  const notes = await db.getAllFromIndex('notes', 'by-updated');
  return notes.length > 0 ? notes[notes.length - 1] : undefined;
}

export async function getAllNotes(): Promise<NoteData[]> {
  const db = await getDB();
  return db.getAll('notes');
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('notes', id);
}

export async function saveSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('settings', value, key);
}

export async function loadSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get('settings', key) as Promise<T | undefined>;
}

export function createNewNote(): NoteData {
  return {
    id: crypto.randomUUID(),
    title: 'Untitled',
    content: '',
    drawings: [],
    theme: 'light',
    layout: 'split',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

export function exportToMarkdown(note: NoteData): string {
  const frontmatter = `---
title: "${note.title.replace(/"/g, '\\"')}"
updatedAt: "${note.updatedAt}"
theme: "${note.theme}"
layout: "${note.layout}"
---

`;

  const metadata = `
<!-- INKPAD_DATA_START
${JSON.stringify({ drawings: note.drawings, id: note.id, createdAt: note.createdAt })}
INKPAD_DATA_END -->`;

  return frontmatter + note.content + metadata;
}

export function importFromMarkdown(markdown: string): Partial<NoteData> {
  const result: Partial<NoteData> = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Parse frontmatter
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/title:\s*"([^"]*)"/);
    const themeMatch = frontmatter.match(/theme:\s*"([^"]*)"/);
    const layoutMatch = frontmatter.match(/layout:\s*"([^"]*)"/);
    const updatedMatch = frontmatter.match(/updatedAt:\s*"([^"]*)"/);

    if (titleMatch) result.title = titleMatch[1];
    if (themeMatch) result.theme = themeMatch[1] as NoteData['theme'];
    if (layoutMatch) result.layout = layoutMatch[1] as NoteData['layout'];
    if (updatedMatch) result.updatedAt = updatedMatch[1];

    markdown = markdown.slice(frontmatterMatch[0].length);
  }

  // Parse InkPad metadata
  const metadataMatch = markdown.match(/<!-- INKPAD_DATA_START\n([\s\S]*?)\nINKPAD_DATA_END -->/);
  if (metadataMatch) {
    try {
      const metadata = JSON.parse(metadataMatch[1]);
      if (metadata.drawings) result.drawings = metadata.drawings;
      if (metadata.id) result.id = metadata.id;
      if (metadata.createdAt) result.createdAt = metadata.createdAt;
    } catch (e) {
      console.warn('Failed to parse InkPad metadata', e);
    }
    markdown = markdown.replace(metadataMatch[0], '').trim();
  }

  result.content = markdown;
  result.drawings = result.drawings || [];

  return result;
}

export async function compressImage(file: File, maxWidth = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/webp', 0.85));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
