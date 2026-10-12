import { useId } from 'react';
import { cn } from '../../lib/utils';

/**
 * FormField groups a label, control, hint, and validation message.
 * Props: label, hint, error, required, htmlFor, className, children.
 * Pass the generated id to the child control, or set htmlFor explicitly.
 */
export default function FormField({ label, hint, error, required = false, htmlFor, className, children }) {
  const generatedId = useId();
  const controlId = htmlFor || generatedId;
  const messageId = error ? `${controlId}-error` : hint ? `${controlId}-hint` : undefined;

  return (
    <div className={cn('w-full', className)}>
      {label && <label htmlFor={controlId} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
      </label>}
      {typeof children === 'function' ? children({ id: controlId, 'aria-describedby': messageId, 'aria-invalid': Boolean(error) }) : children}
      {error && <p id={`${controlId}-error`} role="alert" className="mt-1.5 text-xs text-red-700">{error}</p>}
      {!error && hint && <p id={`${controlId}-hint`} className="mt-1.5 text-xs text-slate-600">{hint}</p>}
    </div>
  );
}
