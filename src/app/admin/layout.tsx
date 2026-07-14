import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true, image: true },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        id: session.user.id,
        role: user.role,
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
