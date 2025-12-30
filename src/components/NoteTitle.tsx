import React, { useState, useRef, useEffect } from 'react';
import { SaveIndicator } from './SaveIndicator';
import { SaveStatus } from '@/hooks/useNote';

interface NoteTitleProps {
  title: string;
  onChange: (title: string) => void;
  savedAt?: Date | null;
  saveStatus?: SaveStatus;
  isCollapsed?: boolean;
}

export function NoteTitle({ title, onChange, savedAt, saveStatus = 'saved', isCollapsed = false }: NoteTitleProps) {
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

  // Collapsed state - shown via wrapper visibility
  if (isCollapsed) {
    return (
      <div className="masthead-collapsed">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="masthead-collapsed-input"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="masthead-collapsed-title"
            title="Click to rename"
          >
            {title}
          </button>
        )}
      </div>
    );
  }

  // Expanded state - centered masthead
  return (
    <div className="masthead">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="masthead-title-input"
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="masthead-title hover:text-primary transition-colors duration-200 cursor-text"
          title="Click to rename"
        >
          {title}
        </button>
      )}
      
      {/* Decorative rule */}
      <div className="masthead-rule" />
      
      {/* Saved indicator with live status */}
      <div className="masthead-meta">
        <SaveIndicator status={saveStatus} savedAt={savedAt || null} />
      </div>
    </div>
  );
}
