import { Suspense } from 'react';
import AdminVendorsContent from './AdminVendorsContent';

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={<div className="space-y-4">{[1, 2, 3].map((i) => (<div key={i} className="h-20 rounded-xl bg-ink/5 animate-pulse" />))}</div>}>
      <AdminVendorsContent />
    </Suspense>
  );
}
