import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileDown, ChevronDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ExportDropdownProps {
  onExportMd: () => void;
  onExportPdf: () => void;
}

export function ExportDropdown({ onExportMd, onExportPdf }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [openUpward, setOpenUpward] = useState(false);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Determine if dropdown should open upward
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 120);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleExportMd = () => {
    onExportMd();
    setIsOpen(false);
  };

  const handleExportPdf = () => {
    onExportPdf();
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      // Simple focus management
      const items = dropdownRef.current?.querySelectorAll('[role="menuitem"]');
      if (items) {
        const currentIndex = Array.from(items).findIndex(el => el === document.activeElement);
        const nextIndex = e.key === 'ArrowDown' 
          ? Math.min(currentIndex + 1, items.length - 1)
          : Math.max(currentIndex - 1, 0);
        (items[nextIndex] as HTMLElement).focus();
      }
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={buttonRef}
            className={`dock-btn ${isOpen ? 'active' : ''}`}
            onClick={handleToggle}
            aria-haspopup="menu"
            aria-expanded={isOpen}
          >
            <Download className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
          Export
        </TooltipContent>
      </Tooltip>

      {isOpen && (
        <div
          className={`export-dropdown ${openUpward ? 'export-dropdown-up' : ''}`}
          role="menu"
          onKeyDown={handleKeyDown}
        >
          <button
            className="export-dropdown-item"
            role="menuitem"
            onClick={handleExportMd}
          >
            <FileDown className="w-4 h-4" />
            <span>Download as Markdown</span>
            <span className="export-dropdown-ext">.md</span>
          </button>
          <button
            className="export-dropdown-item"
            role="menuitem"
            onClick={handleExportPdf}
          >
            <FileText className="w-4 h-4" />
            <span>Download as PDF</span>
            <span className="export-dropdown-ext">.pdf</span>
          </button>
        </div>
      )}
    </div>
  );
}
