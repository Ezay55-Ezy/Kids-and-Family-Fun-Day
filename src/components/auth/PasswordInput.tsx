'use client';

import { useState, forwardRef } from 'react';

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      helperText,
      id,
      className = '',
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className={`label-base ${error ? 'text-coral' : ''}`}
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={`input-base pr-12 ${error ? 'input-error' : ''} ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            autoComplete={props.autoComplete || 'current-password'}
            {...props}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-coral flex items-center gap-1.5"
            role="alert"
            aria-live="polite"
          >
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-ink/50">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';