// src/components/ui/Button.jsx
// Props: variant, size, loading, disabled, leftIcon, rightIcon, ...rest
import { cn } from '../../lib/utils';
import Spinner from './Spinner';

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  outline:   'btn-outline',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
};

const sizes = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

/**
 * Button component
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} variant
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size
 * @param {boolean} loading
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn('btn', variants[variant], sizes[size], className)}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" className="text-current" />
      ) : leftIcon ? (
        <span aria-hidden="true" className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && (
        <span aria-hidden="true" className="shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}
