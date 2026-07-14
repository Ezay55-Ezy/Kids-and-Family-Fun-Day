import { Suspense } from 'react';
import AuthBrandPanel from '@/components/auth/AuthBrandPanel';
import TicketDivider from '@/components/auth/TicketDivider';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Register',
  description: 'Create your account for Kids & Family Fun Day Kenya',
};

function RegisterFormFallback() {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-ink mb-4 tracking-tight">
          Create your account
        </h1>
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="h-12 rounded-lg bg-ink/5 animate-pulse" />
        <div className="h-12 rounded-lg bg-ink/5 animate-pulse" />
        <div className="h-12 rounded-lg bg-ink/5 animate-pulse" />
      </div>
    </div>
  );
}

async function RegisterContent({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const params = await searchParams;
  const registered = params.registered === 'true';

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-ink mb-4 tracking-tight">
          Create your account
        </h1>
        <p className="font-body text-lg text-ink/60 leading-relaxed">
          Join thousands of families discovering Kenya&apos;s best family events.
          Get early access to tickets, exclusive offers, and more.
        </p>
      </div>

      {registered && (
        <div className="mb-8 rounded-lg bg-grass/10 border border-grass/20 p-4 text-sm text-grass" role="alert">
          <p className="font-medium">Account created successfully!</p>
          <p className="mt-1">Please sign in to continue.</p>
        </div>
      )}

      <RegisterForm />
    </div>
  );
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="auth-panel flex-1">
        <Suspense fallback={<RegisterFormFallback />}>
          <RegisterContent searchParams={searchParams} />
        </Suspense>
      </div>

      <TicketDivider className="hidden lg:block" />

      <div className="hidden lg:flex lg:flex-1 min-h-screen">
        <AuthBrandPanel />
      </div>
    </div>
  );
}
