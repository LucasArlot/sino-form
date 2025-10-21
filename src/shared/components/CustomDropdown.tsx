import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Extracted from QuoteForm.tsx to make the dropdown reusable across the application.
 * Props and behaviour are kept identical so that the visual result remains unchanged.
 */
interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  compact?: boolean;
  unitSelector?: boolean;
  disabled?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  compact = false,
  unitSelector = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside (desktop) or touching outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      
      // Prevent body scroll on mobile when dropdown is open
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        if (isMobile) {
          document.body.style.overflow = '';
        }
      };
    }
  }, [isOpen]);

  // Auto-position to stay within the main container (.quote-form-container)
  useEffect(() => {
    if (!(isOpen && listRef.current && triggerRef.current)) return;

    const listElement = listRef.current;
    const containerEl = triggerRef.current!.closest('.quote-form-container') as HTMLElement | null;
    const isMobile = window.innerWidth <= 768;

    const adjustWithinContainer = () => {
      // For mobile, use fixed positioning (handled by CSS)
      if (isMobile) {
        // Mobile positioning is handled by CSS with fixed positioning
        return;
      }

      const triggerRect = triggerRef.current!.getBoundingClientRect();

      const containerRect = containerEl
        ? containerEl.getBoundingClientRect()
        : ({ top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight } as DOMRect);

      // Compute available space inside the container
      const verticalSpaceBelow = Math.max(0, containerRect.bottom - triggerRect.bottom - 10);
      const verticalSpaceAbove = Math.max(0, triggerRect.top - containerRect.top - 10);
      const horizontalSpaceRight = Math.max(0, containerRect.right - triggerRect.left);
      const horizontalSpaceLeft = Math.max(0, triggerRect.right - containerRect.left);

      listElement.classList.remove('show-above', 'adjust-left', 'adjust-right');

      if (verticalSpaceBelow < 200 && verticalSpaceAbove > verticalSpaceBelow) {
        listElement.classList.add('show-above');
      }

      const estimatedWidth = 200; // conservative estimate
      if (horizontalSpaceRight < estimatedWidth) {
        listElement.classList.add('adjust-right');
      } else if (horizontalSpaceLeft < estimatedWidth) {
        listElement.classList.add('adjust-left');
      }

      // Provide CSS variables for height calculations
      listElement.style.setProperty('--available-space-bottom', `${verticalSpaceBelow}px`);
      listElement.style.setProperty('--available-space-top', `${verticalSpaceAbove}px`);
      listElement.style.setProperty('--dropdown-top', `${triggerRect.bottom}px`);

      // Expand the main container's bottom padding while open to avoid clipping
      if (containerEl) {
        const listRect = listElement.getBoundingClientRect();
        const overflowBottom = Math.max(0, listRect.bottom - containerRect.bottom);
        const safeArea = overflowBottom > 0 ? Math.ceil(overflowBottom + 12) : 0; // a bit of buffer
        containerEl.style.setProperty('--dropdown-safe-area', `${safeArea}px`);
      }
    };

    adjustWithinContainer();
    const onResizeOrScroll = () => adjustWithinContainer();
    window.addEventListener('resize', onResizeOrScroll, { passive: true });
    window.addEventListener('scroll', onResizeOrScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('resize', onResizeOrScroll);
      window.removeEventListener('scroll', onResizeOrScroll, { capture: true } as any);
      if (containerEl) containerEl.style.setProperty('--dropdown-safe-area', '0px');
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Extract emoji and plain label parts for robust rendering across devices
  // Robustly detect leading emoji, including regional indicator flags (e.g., 🇫🇷)
  const extractEmoji = (text: string): string => {
    const trimmed = (text || '').trim();
    if (!trimmed) return '';
    const firstToken = trimmed.split(/\s+/)[0];
    const hasFlagIndicators = /[\u{1F1E6}-\u{1F1FF}]/u.test(firstToken);
    const hasPictograph = /\p{Extended_Pictographic}/u.test(firstToken);
    return hasFlagIndicators || hasPictograph ? firstToken : '';
  };
  const stripLeadingEmoji = (text: string): string => {
    const trimmed = (text || '').trim();
    const firstToken = trimmed.split(/\s+/)[0] ?? '';
    const isEmoji = /[\u{1F1E6}-\u{1F1FF}]/u.test(firstToken) || /\p{Extended_Pictographic}/u.test(firstToken);
    return isEmoji ? trimmed.slice(firstToken.length).trimStart() : trimmed;
  };

  const flagEmoji = selectedOption ? extractEmoji(selectedOption.label) : '';
  const labelText = selectedOption ? stripLeadingEmoji(selectedOption.label) : placeholder;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const dropdownClasses = [
    'custom-dropdown',
    compact ? 'compact' : '',
    unitSelector ? 'unit-selector' : '',
    disabled ? 'disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={dropdownRef} className={dropdownClasses}>
      <button
        ref={triggerRef}
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onTouchEnd={(e) => {
          // Prevent double-tap zoom on mobile
          e.preventDefault();
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-dropdown-text">
          <span className="flag" aria-hidden>{flagEmoji}</span>
          <span className="label">{labelText}</span>
        </span>
        <ChevronDown size={16} className="custom-dropdown-icon" />
      </button>

      <div ref={listRef} className={`custom-dropdown-list ${isOpen ? 'show' : ''}`} role="listbox">
        {options.map((option) => (
          <div
            key={option.value}
            className={`custom-dropdown-option ${value === option.value ? 'selected' : ''}`}
            onClick={() => handleSelect(option.value)}
            onTouchEnd={(e) => {
              // Prevent double-tap zoom and ensure proper touch handling
              e.preventDefault();
              handleSelect(option.value);
            }}
            role="option"
            aria-selected={value === option.value}
          >
            <span className="custom-dropdown-option-text">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomDropdown;
