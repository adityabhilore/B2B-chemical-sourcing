// src/components/ui/Checkbox.jsx
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Checkbox = forwardRef(function Checkbox({
  label, description, error, id, className, ...rest
}, ref) {
  const fieldId = id || `cb-${Math.random().toString(36).slice(2,9)}`;
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center h-5 mt-0.5">
        <input
          ref={ref}
          type="checkbox"
          id={fieldId}
          className={cn(
            'w-4 h-4 rounded border-slate-300 text-navy-600 cursor-pointer',
            'focus:ring-2 focus:ring-navy-500/30 focus:ring-offset-0',
            'transition-colors duration-150',
            error && 'border-red-400',
            className
          )}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...rest}
        />
      </div>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label htmlFor={fieldId} className="text-sm font-medium text-slate-700 cursor-pointer select-none">
              {label}
            </label>
          )}
          {description && <p className="text-xs text-slate-500">{description}</p>}
          {error && <p id={`${fieldId}-error`} className="text-xs text-red-600" role="alert">{error}</p>}
        </div>
      )}
    </div>
  );
});

export default Checkbox;
