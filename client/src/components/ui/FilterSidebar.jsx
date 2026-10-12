import { useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * Responsive filter panel. Props: title, children (filter controls), className,
 * defaultOpen. On mobile it can be collapsed; desktop remains visible.
 */
export default function FilterSidebar({ title = 'Filters', children, className, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return <aside className={cn('rounded-xl border border-slate-200 bg-white', className)} aria-label={title}>
    <button type="button" className="flex w-full items-center justify-between p-4 text-left font-semibold text-slate-900 md:pointer-events-none" aria-expanded={open} onClick={() => setOpen(v => !v)}>
      {title}<span className="text-slate-500 md:hidden" aria-hidden="true">{open ? '−' : '+'}</span>
    </button>
    <div className={cn('border-t border-slate-100 p-4', !open && 'hidden md:block')}>{children}</div>
  </aside>;
}
