// src/components/ui/Badge.jsx
// variant: order status, product status, stock status, custom
import { cn } from '../../lib/utils';

// All status → visual mapping (extend as needed)
const STATUS_STYLES = {
  // Order statuses
  PENDING:     'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED:   'bg-blue-100 text-blue-800 border-blue-200',
  PROCESSING:  'bg-violet-100 text-violet-800 border-violet-200',
  SHIPPED:     'bg-sky-100 text-sky-800 border-sky-200',
  DELIVERED:   'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED:   'bg-red-100 text-red-700 border-red-200',
  // Product/blog statuses
  ACTIVE:      'bg-emerald-100 text-emerald-800 border-emerald-200',
  DRAFT:       'bg-slate-100 text-slate-600 border-slate-200',
  ARCHIVED:    'bg-slate-100 text-slate-500 border-slate-200',
  PUBLISHED:   'bg-emerald-100 text-emerald-800 border-emerald-200',
  // Stock statuses
  IN_STOCK:    'bg-emerald-100 text-emerald-800 border-emerald-200',
  LOW_STOCK:   'bg-amber-100 text-amber-800 border-amber-200',
  OUT_OF_STOCK:'bg-red-100 text-red-700 border-red-200',
  ON_REQUEST:  'bg-navy-100 text-navy-700 border-navy-200',
  // Generic
  info:    'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger:  'bg-red-50 text-red-700 border-red-200',
  navy:    'bg-navy-50 text-navy-700 border-navy-200',
  teal:    'bg-teal-50 text-teal-700 border-teal-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

const DOT_STYLES = {
  PENDING: 'bg-amber-500', CONFIRMED: 'bg-blue-500', PROCESSING: 'bg-violet-500',
  SHIPPED: 'bg-sky-500', DELIVERED: 'bg-emerald-500', CANCELLED: 'bg-red-500',
  ACTIVE: 'bg-emerald-500', DRAFT: 'bg-slate-400', ARCHIVED: 'bg-slate-400',
  PUBLISHED: 'bg-emerald-500', IN_STOCK: 'bg-emerald-500', LOW_STOCK: 'bg-amber-500',
  OUT_OF_STOCK: 'bg-red-500', ON_REQUEST: 'bg-navy-500',
  info: 'bg-blue-500', success: 'bg-emerald-500', warning: 'bg-amber-500',
  danger: 'bg-red-500', navy: 'bg-navy-500', teal: 'bg-teal-500', neutral: 'bg-slate-400',
};

/**
 * Badge / StatusPill
 * @param {string} status — one of the keys above, or a custom className via `className`
 * @param {boolean} dot   — show leading dot indicator
 * @param {'sm'|'md'} size
 */
export default function Badge({ status = 'neutral', dot = false, size = 'md', children, className }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.neutral;
  const dotStyle = DOT_STYLES[status] || DOT_STYLES.neutral;
  const label = children ?? status.replace(/_/g, ' ');
  return (
    <span className={cn(
      'badge border',
      style,
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyle)} aria-hidden="true" />}
      {label}
    </span>
  );
}
