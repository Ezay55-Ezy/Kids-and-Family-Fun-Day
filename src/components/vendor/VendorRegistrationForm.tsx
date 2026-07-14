'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface FormData {
  businessName: string;
  description: string;
  serviceName: string;
  serviceDescription: string;
  price: string;
}

interface FormErrors {
  businessName?: string;
  description?: string;
  serviceName?: string;
  price?: string;
  submit?: string;
}

export default function VendorRegistrationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    description: '',
    serviceName: '',
    serviceDescription: '',
    price: '',
  });

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    const trimmed = value.trim();

    switch (name) {
      case 'businessName':
        if (!trimmed) return 'Business name is required';
        if (trimmed.length < 2) return 'Business name must be at least 2 characters';
        if (trimmed.length > 100) return 'Business name must be at most 100 characters';
        return undefined;

      case 'description':
        if (trimmed && trimmed.length < 10) return 'Description must be at least 10 characters';
        if (trimmed.length > 500) return 'Description must be at most 500 characters';
        return undefined;

      case 'serviceName':
        if (!trimmed) return 'Service name is required';
        if (trimmed.length < 3) return 'Service name must be at least 3 characters';
        if (trimmed.length > 100) return 'Service name must be at most 100 characters';
        return undefined;

      case 'price':
        if (!trimmed) return 'Price is required';
        const num = Number(trimmed);
        if (isNaN(num) || num <= 0) return 'Price must be a positive number';
        return undefined;

      default:
        return undefined;
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: FormErrors = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      if (field === 'serviceDescription') return;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof FormData]) {
      const error = validateField(name as keyof FormData, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (name !== 'serviceDescription') {
      const error = validateField(name as keyof FormData, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
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
      const res = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName.trim(),
          description: formData.description.trim() || undefined,
          serviceName: formData.serviceName.trim(),
          serviceDescription: formData.serviceDescription.trim() || undefined,
          price: Number(formData.price),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }
        if (res.status === 409) {
          setErrors((prev) => ({ ...prev, submit: 'You already have a vendor profile. Redirecting...' }));
          setTimeout(() => router.push('/dashboard/vendor'), 1500);
          return;
        }
        setErrors((prev) => ({
          ...prev,
          submit: data.error || 'Failed to submit vendor application.',
        }));
        return;
      }

      await signOut({ callbackUrl: '/auth/login?vendor_registered=true' });
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
    'aria-invalid': (touched[name] && !!errors[name] ? 'true' : 'false') as 'true' | 'false',
    'aria-describedby': touched[name] && errors[name] ? `${name}-error` : undefined,
    disabled: isLoading,
  });

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6" noValidate>
      <div>
        <label htmlFor="businessName" className="label-base">
          Business Name
        </label>
        <input
          id="businessName"
          type="text"
          placeholder="e.g. Jumping Castles Ltd"
          className={`input-base ${touched.businessName && errors.businessName ? 'input-error' : ''}`}
          {...getFieldProps('businessName')}
          autoComplete="organization"
        />
        {touched.businessName && errors.businessName && (
          <p id="businessName-error" className="mt-1.5 text-sm text-coral" role="alert">
            {errors.businessName}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="label-base">
          About Your Business <span className="text-ink/40">(optional)</span>
        </label>
        <textarea
          id="description"
          placeholder="Tell us about your business and what makes you unique..."
          rows={3}
          className={`input-base resize-none ${touched.description && errors.description ? 'input-error' : ''}`}
          {...getFieldProps('description')}
        />
        {touched.description && errors.description && (
          <p id="description-error" className="mt-1.5 text-sm text-coral" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="serviceName" className="label-base">
          Service Name
        </label>
        <input
          id="serviceName"
          type="text"
          placeholder="e.g. Bouncy Castle Rental"
          className={`input-base ${touched.serviceName && errors.serviceName ? 'input-error' : ''}`}
          {...getFieldProps('serviceName')}
        />
        {touched.serviceName && errors.serviceName && (
          <p id="serviceName-error" className="mt-1.5 text-sm text-coral" role="alert">
            {errors.serviceName}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="serviceDescription" className="label-base">
          Service Description <span className="text-ink/40">(optional)</span>
        </label>
        <textarea
          id="serviceDescription"
          placeholder="Describe what you offer..."
          rows={3}
          className="input-base resize-none"
          {...getFieldProps('serviceDescription')}
        />
      </div>

      <div>
        <label htmlFor="price" className="label-base">
          Price (KSh)
        </label>
        <input
          id="price"
          type="number"
          min="1"
          step="0.01"
          placeholder="e.g. 500"
          className={`input-base ${touched.price && errors.price ? 'input-error' : ''}`}
          {...getFieldProps('price')}
        />
        {touched.price && errors.price && (
          <p id="price-error" className="mt-1.5 text-sm text-coral" role="alert">
            {errors.price}
          </p>
        )}
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
            Submitting...
          </>
        ) : (
          'Submit Application'
        )}
      </button>

      <p className="text-center text-sm text-ink/60">
        Your application will be reviewed by our team.
      </p>
    </form>
  );
}
