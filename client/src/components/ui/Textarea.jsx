// src/components/ui/Textarea.jsx
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Textarea = forwardRef(function Textarea({
  label, error, hint, id, rows = 4, required, className, ...rest
}, ref) {
  const fieldId = id || `ta-${Math.random().toString(36).slice(2,9)}`;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        className={cn('input-base resize-y', error && 'input-error', className)}
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

export default Textarea;
