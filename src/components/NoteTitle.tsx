import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface NoteTitleProps {
  title: string;
  onChange: (title: string) => void;
}

export function NoteTitle({ title, onChange }: NoteTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim()) {
      onChange(editValue.trim());
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="bg-transparent border-b border-primary/50 px-1 py-0.5 text-lg font-semibold focus:outline-none focus:border-primary"
          style={{ minWidth: '120px' }}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-lg font-semibold hover:text-primary transition-colors cursor-text"
      title="Click to rename"
    >
      {title}
    </button>
  );
}
