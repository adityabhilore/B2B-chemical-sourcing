// src/components/ui/Select.jsx
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Select = forwardRef(function Select({
  label, error, hint, id, required, className,
  placeholder = 'Select…', options = [], children, ...rest
}, ref) {
  const fieldId = id || `sel-${Math.random().toString(36).slice(2,9)}`;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={!!error}
          className={cn(
            'input-base appearance-none pr-10 cursor-pointer',
            error && 'input-error',
            className
          )}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt =>
            typeof opt === 'string'
              ? <option key={opt} value={opt}>{opt}</option>
              : <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
          )}
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
          </svg>
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

export default Select;
