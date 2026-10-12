// src/components/ui/Spinner.jsx
// Props: size (sm|md|lg), className
import { cn } from '../../lib/utils';

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };

export default function Spinner({ size = 'md', className }) {
  return (
    <svg
      className={cn('animate-spin-slow text-current', sizes[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading…"
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
