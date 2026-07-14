import { Suspense } from 'react';
import AuthBrandPanel from '@/components/auth/AuthBrandPanel';
import TicketDivider from '@/components/auth/TicketDivider';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your Kids & Family Fun Day Kenya account',
};

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-ink mb-4 tracking-tight">
          Welcome back
        </h1>
        <p className="font-body text-lg text-ink/60 leading-relaxed">
          Sign in to manage your bookings, tickets, and preferences.
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="h-12 rounded-lg bg-ink/5 animate-pulse" />
        <div className="h-12 rounded-lg bg-ink/5 animate-pulse" />
        <div className="h-12 rounded-lg bg-ink/5 animate-pulse" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="auth-panel flex-1">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>

      <TicketDivider className="hidden lg:block" />

      <div className="hidden lg:flex lg:flex-1 min-h-screen">
        <AuthBrandPanel />
      </div>
    </div>
  );
}
