import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { VAPID_PUBLIC_KEY } from '@/services/push-service';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { adminNavItems, adminBottomNav } from '@/components/dashboard/nav-items';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  try {
    await requireAdmin(session.user.id);
  } catch {
    redirect('/dashboard');
  }

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        id: session.user.id,
        role: session.user.role,
      }}
      navItems={adminNavItems}
      bottomNavItems={adminBottomNav}
      initialUnreadCount={0}
      vapidPublicKey={VAPID_PUBLIC_KEY}
    >
      {children}
    </DashboardShell>
  );
}
