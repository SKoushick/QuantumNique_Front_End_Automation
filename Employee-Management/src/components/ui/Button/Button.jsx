/**
 * Reusable Button component
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

/**
 * @param {object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'success'|'outline'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.loading]
 * @param {boolean} [props.disabled]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {boolean} [props.fullWidth]
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${className}`}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin btn__spinner" aria-hidden="true" />
      ) : leftIcon ? (
        <span className="btn__icon btn__icon--left" aria-hidden="true">{leftIcon}</span>
      ) : null}
      {children && <span className="btn__label">{children}</span>}
      {!loading && rightIcon && (
        <span className="btn__icon btn__icon--right" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
}
