import VendorMarketplaceSection from '@/components/vendor/VendorMarketplaceSection';

export const metadata = {
  title: 'Vendors',
  description: 'Browse vendors and services available at Kids & Family Fun Day Kenya events',
};

export default function VendorsPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pt-10 pb-4">
        <h1 className="font-display text-3xl font-bold text-ink">
          Vendor Marketplace
        </h1>
        <p className="text-ink/60 mt-2 max-w-xl">
          Browse trusted vendors offering catering, photography, entertainment, and more for family events.
        </p>
      </div>
      <VendorMarketplaceSection />
    </div>
  );
}
