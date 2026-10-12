// src/components/ui/States.jsx — Skeleton, EmptyState, ErrorState
import { cn } from '../../lib/utils';
import Button from './Button';

/* ─── Skeleton ─────────────────────────────────────────────── */
export function Skeleton({ className, lines = 1, height }) {
  if (lines > 1) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{ height: height || 16, width: i === lines - 1 ? '60%' : '100%' }}
            className="skeleton rounded"
          />
        ))}
      </div>
    );
  }
  return (
    <div
      style={{ height: height || 16 }}
      className={cn('skeleton rounded', className)}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="w-full" height={180} />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton height={12} className="w-1/3" />
        <Skeleton height={16} />
        <Skeleton height={14} className="w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-100">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" height={32} />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton height={14} className="w-1/3" />
        <Skeleton height={12} className="w-1/2" />
      </div>
      <Skeleton height={24} className="w-20 rounded-full" />
      <Skeleton height={32} className="w-8 rounded" />
    </div>
  );
}

/* ─── EmptyState ───────────────────────────────────────────── */
export function EmptyState({
  icon: Icon,
  title = 'Nothing here yet',
  description,
  action,
  actionLabel,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center gap-4', className)}>
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
        {Icon ? (
          <Icon className="w-8 h-8" />
        ) : (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
      </div>
      {action && actionLabel && (
        <Button variant="primary" size="sm" onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
}

/* ─── ErrorState ───────────────────────────────────────────── */
export function ErrorState({ title = 'Something went wrong', message, onRetry, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center gap-4', className)}>
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-400">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {message && <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>
      )}
    </div>
  );
}
