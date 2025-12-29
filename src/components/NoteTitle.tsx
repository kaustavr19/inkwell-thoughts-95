import React, { useState, useRef, useEffect } from 'react';

interface NoteTitleProps {
  title: string;
  onChange: (title: string) => void;
  savedAt?: Date | null;
}

export function NoteTitle({ title, onChange, savedAt }: NoteTitleProps) {
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

  const getTimeAgo = () => {
    if (!savedAt) return null;
    const now = new Date();
    const diffMs = now.getTime() - savedAt.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    return savedAt.toLocaleDateString();
  };

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
      
      {/* Saved indicator */}
      {savedAt && (
        <div className="masthead-meta">
          Saved locally • {getTimeAgo()}
        </div>
      )}
    </div>
  );
}