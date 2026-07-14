'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { PasswordInput } from './PasswordInput';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 1,
  },
} as const;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [remember, setRemember] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const registered = searchParams.get('registered') === 'true';
  const vendorRegistered = searchParams.get('vendor_registered') === 'true';
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    const trimmed = value.trim();

    switch (name) {
      case 'email':
        if (!trimmed) return 'Email is required';
        if (!VALIDATION.email.pattern.test(trimmed)) return 'Invalid email address';
        return undefined;

      case 'password':
        if (!value) return 'Password is required';
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
      const result = await signIn('credentials', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
        ...(remember ? { maxAge: 30 * 24 * 60 * 60 } : {}),
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setErrors((prev) => ({
            ...prev,
            submit: 'Invalid email or password. Please try again.',
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            submit: 'Something went wrong. Please try again.',
          }));
        }
        return;
      }

      if (result?.ok) {
        try {
          const sessionRes = await fetch('/api/auth/session');
          const sessionData = await sessionRes.json();
          const role = sessionData?.user?.role;
          const roleRedirect =
            role === 'ADMIN' ? '/admin' :
            role === 'VENDOR' ? '/vendor' :
            '/dashboard';
          router.push(callbackUrl !== '/dashboard' ? callbackUrl : roleRedirect);
        } catch {
          router.push(callbackUrl);
        }
        router.refresh();
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        submit: 'Something went wrong. Please try again.',
      }));
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
    autoComplete: name === 'email' ? 'email' : 'current-password',
  });

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6" noValidate>
      {registered && (
        <div className="rounded-lg bg-grass/10 border border-grass/20 p-4 text-sm text-grass" role="alert">
          <p className="font-medium">Account created successfully!</p>
          <p className="mt-1">Please sign in to continue.</p>
        </div>
      )}

      {vendorRegistered && (
        <div className="rounded-lg bg-sun/10 border border-sun/20 p-4 text-sm text-sun" role="alert">
          <p className="font-medium">Vendor application submitted!</p>
          <p className="mt-1">Please sign in again to access your vendor dashboard.</p>
        </div>
      )}

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
          placeholder="Enter your password"
          {...getFieldProps('password')}
        />
      <div className="mt-2 text-right">
        <Link href="/auth/forgot-password" className="text-sm text-coral hover:underline">
          Forgot password?
        </Link>
      </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="remember"
          name="remember"
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded border-ink/20 text-coral focus:ring-coral"
          disabled={isLoading}
        />
        <label htmlFor="remember" className="text-sm text-ink/70 cursor-pointer select-none">
          Remember me
        </label>
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
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </button>

      <p className="text-center text-sm text-ink/60">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="link-text">
          Create one
        </Link>
      </p>
    </form>
  );
}
