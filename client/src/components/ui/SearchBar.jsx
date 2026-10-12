// src/components/ui/SearchBar.jsx
// Props: value, onChange, onSubmit, placeholder, className, size(sm|md|lg)
import { useRef } from 'react';
import { cn } from '../../lib/utils';

const SIZES = {
  sm: 'py-2 text-sm pl-9 pr-4',
  md: 'py-2.5 text-sm pl-10 pr-5',
  lg: 'py-3.5 text-base pl-12 pr-6',
};
const ICON_SIZES = {
  sm: 'w-4 h-4 left-2.5',
  md: 'w-4 h-4 left-3',
  lg: 'w-5 h-5 left-4',
};

export default function SearchBar({
  value, onChange, onSubmit,
  placeholder = 'Search products by name, CAS number…',
  className, size = 'md', id,
}) {
  const inputRef = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(value);
  };
  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)} role="search">
      <svg
        className={cn('absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none', ICON_SIZES[size])}
        viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
      >
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/>
      </svg>
      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn('input-base w-full', SIZES[size])}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange?.(''); inputRef.current?.focus(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
          </svg>
        </button>
      )}
    </form>
  );
}
