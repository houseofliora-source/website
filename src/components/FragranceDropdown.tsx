import React, { useState, useRef, useEffect, useId } from 'react';
import { FragranceItem } from '../types';
import { ChevronDown, Check, AlertTriangle } from 'lucide-react';

export interface FragranceDropdownProps {
  fragrances: FragranceItem[];
  selectedFragrance: string;
  onSelect: (fragranceName: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  showChosenConfirmation?: boolean;
  showDescription?: boolean;
  variant?: 'standard' | 'compact';
  className?: string;
  id?: string;
}

export const FragranceDropdown: React.FC<FragranceDropdownProps> = ({
  fragrances = [],
  selectedFragrance,
  onSelect,
  disabled = false,
  label = 'Select Fragrance / Aroma Profile:',
  required = true,
  showChosenConfirmation = true,
  showDescription = true,
  variant = 'standard',
  className = '',
  id,
}) => {
  const generatedId = useId();
  const dropdownId = id || `fragrance-dropdown-${generatedId}`;
  const listboxId = `${dropdownId}-listbox`;
  const labelId = `${dropdownId}-label`;

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const hasNoActiveFragrances = fragrances.length === 0;

  // Selected fragrance object to show full description directly underneath
  const currentFragranceItem = fragrances.find(
    (f) => f.name.toLowerCase() === (selectedFragrance || '').toLowerCase()
  ) || fragrances.find(f => f.name === selectedFragrance);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Keep focusedIndex in sync with selectedFragrance when opened
  useEffect(() => {
    if (isOpen) {
      const idx = fragrances.findIndex(
        (f) => f.name.toLowerCase() === (selectedFragrance || '').toLowerCase()
      );
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, selectedFragrance, fragrances]);

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const optionElement = listRef.current.children[focusedIndex] as HTMLElement;
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleSelectOption = (fragranceName: string) => {
    onSelect(fragranceName);
    setIsOpen(false);
    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || hasNoActiveFragrances) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % fragrances.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + fragrances.length) % fragrances.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < fragrances.length) {
          handleSelectOption(fragrances[focusedIndex].name);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        if (buttonRef.current) buttonRef.current.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  if (hasNoActiveFragrances) {
    return (
      <div className={`space-y-2 ${className}`}>
        {variant === 'standard' && (
          <label id={labelId} className="font-semibold text-[#24211D] uppercase tracking-wider text-xs block">
            {label} {required && <span className="text-rose-600">*</span>}
          </label>
        )}
        <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>No fragrance available right now — please contact the store</span>
        </div>
      </div>
    );
  }

  const isCompact = variant === 'compact';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Label and Confirmation Row (Standard mode) */}
      {!isCompact && (
        <div className="flex flex-wrap items-center justify-between gap-1 text-xs mb-2">
          <label id={labelId} htmlFor={dropdownId} className="font-semibold text-[#24211D] uppercase tracking-wider block">
            {label} {required && <span className="text-rose-600">*</span>}
          </label>
          {showChosenConfirmation && selectedFragrance && (
            <span className="text-[11px] text-[#7A6F62]">
              Chosen: <strong className="text-[#8C5E35]">{selectedFragrance}</strong>
            </span>
          )}
        </div>
      )}

      {/* Dropdown Trigger Field */}
      <button
        ref={buttonRef}
        type="button"
        id={dropdownId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={!isCompact ? labelId : undefined}
        aria-label={isCompact ? label : undefined}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full text-left transition-all cursor-pointer flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-[#8C5E35]/30 ${
          isCompact
            ? 'min-h-[38px] px-3 py-1.5 text-xs bg-white/90 border border-[#D5C7B7] rounded-xl hover:border-[#8C5E35]'
            : 'min-h-[52px] px-4 py-3 text-sm bg-white/85 hover:bg-white border rounded-2xl shadow-xs'
        } ${
          isOpen
            ? 'border-[#8C5E35] ring-2 ring-[#8C5E35]/20 bg-white'
            : 'border-[#EAE0D5] hover:border-[#8C5E35]/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="font-medium text-[#24211D] break-words flex-1 leading-snug">
          {selectedFragrance || 'Select Fragrance...'}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#8C5E35] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Option List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#FAF8F5]/98 backdrop-blur-xl border border-[#EAE0D5] rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            className={`overflow-y-auto overscroll-contain py-1 divide-y divide-[#EAE0D5]/50 ${
              isCompact ? 'max-h-[220px]' : 'max-h-[320px]'
            }`}
          >
            {fragrances.map((f, idx) => {
              const isSelected =
                f.name.toLowerCase() === (selectedFragrance || '').toLowerCase();
              const isFocused = focusedIndex === idx;

              return (
                <li
                  key={f.id}
                  id={`${listboxId}-option-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectOption(f.name)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`min-h-[44px] px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F2ECE3] text-[#8C5E35] font-semibold'
                      : isFocused
                      ? 'bg-[#FAF6F0] text-[#24211D]'
                      : 'text-[#5A5248] hover:bg-[#FAF6F0] hover:text-[#24211D]'
                  }`}
                >
                  <span className="break-words whitespace-normal text-sm leading-snug flex-1">
                    {f.name}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#8C5E35] shrink-0 ml-2" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Selected Fragrance Description (Standard mode directly underneath dropdown) */}
      {!isCompact && showDescription && currentFragranceItem?.description && (
        <p className="text-xs text-[#5A5248] leading-relaxed pt-2 font-sans break-words animate-fade-in">
          {currentFragranceItem.description}
        </p>
      )}
    </div>
  );
};
