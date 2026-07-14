'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PasswordInput } from './PasswordInput';
import { registerUser, RegisterError } from '@/services/auth-client';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  submit?: string;
}

interface FieldRefs {
  firstName?: HTMLInputElement;
  lastName?: HTMLInputElement;
  email?: HTMLInputElement;
  password?: HTMLInputElement;
  confirmPassword?: HTMLInputElement;
}

const VALIDATION = {
  firstName: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  lastName: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[A-Z])(?=.*\d).+$/,
  },
} as const;

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    const trimmed = value.trim();

    switch (name) {
      case 'firstName':
        if (!trimmed) return 'First name is required';
        if (trimmed.length < VALIDATION.firstName.minLength)
          return `First name must be at least ${VALIDATION.firstName.minLength} character`;
        if (trimmed.length > VALIDATION.firstName.maxLength)
          return `First name must be at most ${VALIDATION.firstName.maxLength} characters`;
        if (!VALIDATION.firstName.pattern.test(trimmed))
          return 'First name can only contain letters, spaces, hyphens, and apostrophes';
        return undefined;

      case 'lastName':
        if (!trimmed) return 'Last name is required';
        if (trimmed.length < VALIDATION.lastName.minLength)
          return `Last name must be at least ${VALIDATION.lastName.minLength} character`;
        if (trimmed.length > VALIDATION.lastName.maxLength)
          return `Last name must be at most ${VALIDATION.lastName.maxLength} characters`;
        if (!VALIDATION.lastName.pattern.test(trimmed))
          return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        return undefined;

      case 'email':
        if (!trimmed) return 'Email is required';
        if (!VALIDATION.email.pattern.test(trimmed)) return 'Invalid email address';
        return undefined;

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < VALIDATION.password.minLength)
          return `Password must be at least ${VALIDATION.password.minLength} characters`;
        if (!VALIDATION.password.pattern.test(value))
          return 'Password must contain at least one uppercase letter and one number';
        return undefined;

      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return undefined;

      default:
        return undefined;
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: FormErrors = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof FormData]) {
      const error = validateField(name as keyof FormData, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Partial<Record<keyof FormData, boolean>>
    );
    setTouched(allTouched);

    if (!validateAllFields()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));

    try {
      await registerUser({
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      router.push('/auth/login?registered=true');
      router.refresh();
    } catch (error) {
      if (error instanceof RegisterError) {
        if (error.code === 'EMAIL_ALREADY_IN_USE') {
          setErrors((prev) => ({ ...prev, email: error.message }));
        } else {
          setErrors((prev) => ({ ...prev, submit: error.message }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: 'Something went wrong. Please try again.',
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldProps = (name: keyof FormData) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': touched[name] && !!errors[name] ? 'true' as const : 'false' as const,
    'aria-describedby': touched[name] && errors[name] ? `${name}-error` : undefined,
    disabled: isLoading,
    autoComplete: name === 'email' ? 'email' : name === 'password' ? 'new-password' : name === 'confirmPassword' ? 'new-password' : name,
  });

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="label-base">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            className={`input-base ${touched.firstName && errors.firstName ? 'input-error' : ''}`}
            {...getFieldProps('firstName')}
            aria-describedby={touched.firstName && errors.firstName ? 'firstName-error' : undefined}
          />
          {touched.firstName && errors.firstName && (
            <p id="firstName-error" className="mt-1.5 text-sm text-coral" role="alert">
              {errors.firstName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="label-base">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            className={`input-base ${touched.lastName && errors.lastName ? 'input-error' : ''}`}
            {...getFieldProps('lastName')}
            aria-describedby={touched.lastName && errors.lastName ? 'lastName-error' : undefined}
          />
          {touched.lastName && errors.lastName && (
            <p id="lastName-error" className="mt-1.5 text-sm text-coral" role="alert">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="label-base">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`input-base ${touched.email && errors.email ? 'input-error' : ''}`}
          {...getFieldProps('email')}
          aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
        />
        {touched.email && errors.email && (
          <p id="email-error" className="mt-1.5 text-sm text-coral" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <PasswordInput
          id="password"
          label="Password"
          error={touched.password ? errors.password : undefined}
          helperText="At least 8 characters with 1 uppercase letter and 1 number"
          {...getFieldProps('password')}
        />
      </div>

      <div>
        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
          {...getFieldProps('confirmPassword')}
        />
      </div>

      {errors.submit && (
        <div className="rounded-lg bg-coral/10 border border-coral/20 p-3 text-sm text-coral" role="alert">
          {errors.submit}
        </div>
      )}

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </button>

      <p className="text-center text-sm text-ink/60">
        Already have an account?{' '}
        <Link href="/auth/login" className="link-text">
          Sign in
        </Link>
      </p>
    </form>
  );
}