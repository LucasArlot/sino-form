import { useState, useRef, useEffect, type FC, type ReactNode } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import '../styles/customSelect.css';
import { attachDropdownDebug } from '@/lib/debugDropdown';

interface Option {
  value: string;
  label: string;
  flag?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  renderOption?: (option: Option) => ReactNode;
  renderValue?: (option: Option) => ReactNode;
}

const CustomSelect: FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  className = '',
  renderOption,
  renderValue,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({
    showAbove: false,
    adjustRight: false,
    adjustLeft: false,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option: Option) => option.value === value);

  const filteredOptions = searchable
    ? options.filter((option: Option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  // Auto-positioning bounded to the main form container and visible viewport above footer
  useEffect(() => {
    const adjustDropdownPosition = () => {
      if (!dropdownRef.current || !triggerRef.current || !isOpen) return;

      if (!dropdownRef.current.dataset.debugAdjustLogged) {
        // eslint-disable-next-line no-console
        console.log('[dropdown-debug] adjust run - custom-select-dropdown');
        dropdownRef.current.dataset.debugAdjustLogged = '1';
      }

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const containerEl = triggerRef.current.closest('.quote-form-container') as HTMLElement | null;
      const containerRect = containerEl
        ? containerEl.getBoundingClientRect()
        : ({ top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight } as DOMRect);

      // Respect fixed footer height so the dropdown never hides behind it
      const footerEl = document.querySelector('.form-footer') as HTMLElement | null;
      const footerHeight = footerEl ? footerEl.getBoundingClientRect().height : 0;
      const viewportBottom = window.innerHeight - footerHeight;

      const dropdownHeight = Math.min(300, filteredOptions.length * 48 + (searchable ? 60 : 0)); // Estimate dropdown height

      // Calculate available space within the visible area (container bottom and top of footer)
      const visualBottom = Math.min(containerRect.bottom, viewportBottom);
      const spaceBelow = Math.max(0, visualBottom - triggerRect.bottom - 6);
      const spaceAbove = Math.max(0, triggerRect.top - containerRect.top - 20);
      const spaceRight = Math.max(0, containerRect.right - triggerRect.left);
      const spaceLeft = Math.max(0, triggerRect.right - containerRect.left);

      const newPosition = {
        showAbove: false,
        adjustRight: false,
        adjustLeft: false,
      };

      // Vertical positioning - show above if not enough space below
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        newPosition.showAbove = true;
      }

      // Horizontal positioning - adjust if dropdown would overflow
      const dropdownMinWidth = 200;
      if (spaceRight < dropdownMinWidth) {
        newPosition.adjustRight = true;
      } else if (spaceLeft < dropdownMinWidth) {
        newPosition.adjustLeft = true;
      }

      setDropdownPosition(newPosition);

      // Set CSS custom properties for dynamic max-height calculation
      dropdownRef.current.style.setProperty('--dropdown-top', `${triggerRect.bottom}px`);
      dropdownRef.current.style.setProperty('--available-space-bottom', `${spaceBelow}px`);
      dropdownRef.current.style.setProperty('--available-space-above', `${spaceAbove}px`);

      // Verify CSS vars on element vs parent
      // eslint-disable-next-line no-console
      console.log('[dropdown-debug] vars on element', {
        onElement: {
          '--available-space-bottom': dropdownRef.current.style.getPropertyValue('--available-space-bottom') || null,
          '--dropdown-top': dropdownRef.current.style.getPropertyValue('--dropdown-top') || null,
        },
        onParent: {
          '--available-space-bottom': dropdownRef.current.parentElement?.style.getPropertyValue('--available-space-bottom') || null,
          '--dropdown-top': dropdownRef.current.parentElement?.style.getPropertyValue('--dropdown-top') || null,
        },
      });

      // Expand the container's bottom padding to avoid clipping while open
      if (containerEl && dropdownRef.current) {
        const listRect = dropdownRef.current.getBoundingClientRect();
        const overflowBottom = Math.max(0, listRect.bottom - visualBottom);
        const safeArea = overflowBottom > 0 ? Math.ceil(overflowBottom + 12) : 0;
        containerEl.style.setProperty('--dropdown-safe-area', `${safeArea}px`);
      }
    };

    if (isOpen) {
      // Delay to ensure dropdown is rendered
      const timer = setTimeout(adjustDropdownPosition, 10);

      // Also adjust on window resize / scroll
      window.addEventListener('resize', adjustDropdownPosition, { passive: true } as any);
      window.addEventListener('scroll', adjustDropdownPosition, { passive: true, capture: true } as any);

      const detachDebug = attachDropdownDebug({
        listEl: dropdownRef.current!,
        triggerEl: triggerRef.current,
        containerEl: triggerRef.current?.closest('.quote-form-container') as HTMLElement | null,
        type: 'custom-select-dropdown',
      });

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', adjustDropdownPosition as any);
        window.removeEventListener('scroll', adjustDropdownPosition as any, true);
        const containerEl = triggerRef.current?.closest('.quote-form-container') as HTMLElement | null;
        if (containerEl) containerEl.style.setProperty('--dropdown-safe-area', '0px');
        detachDebug();
      };
    }
  }, [isOpen, filteredOptions.length, searchable]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Build dropdown classes
  const dropdownClasses = [
    'custom-select-dropdown',
    'glassmorphism',
    dropdownPosition.showAbove ? 'show-above' : '',
    dropdownPosition.adjustRight ? 'adjust-right' : '',
    dropdownPosition.adjustLeft ? 'adjust-left' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`custom-select-wrapper ${className}`} ref={wrapperRef}>
      <div
        ref={triggerRef}
        className={`custom-select-trigger glassmorphism ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
      >
        <div className="custom-select-value">
          {selectedOption ? (
            renderValue ? (
              renderValue(selectedOption)
            ) : (
              selectedOption.label
            )
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={20} className={`custom-select-arrow ${isOpen ? 'open' : ''}`} />
      </div>
      {isOpen && (
        <div ref={dropdownRef} className={dropdownClasses}>
          {searchable && (
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="custom-select-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option: Option) => (
                <div
                  key={option.value}
                  className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {renderOption ? renderOption(option) : option.label}
                </div>
              ))
            ) : (
              <div className="no-results">No options found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
