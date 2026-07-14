import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { VAPID_PUBLIC_KEY } from '@/services/push-service';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { customerNavItems, customerBottomNav } from '@/components/dashboard/nav-items';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
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
      navItems={customerNavItems}
      bottomNavItems={customerBottomNav}
      initialUnreadCount={0}
      vapidPublicKey={VAPID_PUBLIC_KEY}
    >
      {children}
    </DashboardShell>
  );
}
