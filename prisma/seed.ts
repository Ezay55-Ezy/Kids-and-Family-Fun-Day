import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const sponsors = [
    {
      companyName: 'Safaricom Foundation',
      slug: 'safaricom-foundation',
      description: "Kenya's leading telecommunications company supporting youth and family development programs.",
      logoUrl: 'https://logo.clearbit.com/safaricom.co.ke',
      websiteUrl: 'https://www.safaricom.co.ke',
      tier: 'PLATINUM' as const,
      displayOrder: 1,
      isPublished: true,
    },
    {
      companyName: 'KCB Foundation',
      slug: 'kcb-foundation',
      description: "Kenya Commercial Bank's social investment arm empowering communities through education and enterprise.",
      logoUrl: 'https://logo.clearbit.com/kcbgroup.com',
      websiteUrl: 'https://www.kcbgroup.com',
      tier: 'GOLD' as const,
      displayOrder: 2,
      isPublished: true,
    },
    {
      companyName: 'Bidco Africa',
      slug: 'bidco-africa',
      description: 'Leading East African consumer goods manufacturer committed to family wellness.',
      logoUrl: 'https://logo.clearbit.com/bidcoafrica.com',
      websiteUrl: 'https://www.bidcoafrica.com',
      tier: 'GOLD' as const,
      displayOrder: 3,
      isPublished: true,
    },
    {
      companyName: 'Naivas Supermarket',
      slug: 'naivas-supermarket',
      description: "Kenya's largest supermarket chain, serving families across the nation.",
      logoUrl: 'https://logo.clearbit.com/naivas.co.ke',
      websiteUrl: 'https://www.naivas.co.ke',
      tier: 'SILVER' as const,
      displayOrder: 4,
      isPublished: true,
    },
    {
      companyName: 'Brookside Dairy',
      slug: 'brookside-dairy',
      description: 'Premium dairy products for healthy, happy families.',
      logoUrl: 'https://logo.clearbit.com/brookside.co.ke',
      websiteUrl: 'https://www.brookside.co.ke',
      tier: 'SILVER' as const,
      displayOrder: 5,
      isPublished: true,
    },
    {
      companyName: 'Java House',
      slug: 'java-house',
      description: "Kenya's favourite family restaurant chain — great food, great times.",
      logoUrl: 'https://logo.clearbit.com/javahouseafrica.co.ke',
      websiteUrl: 'https://www.javahouseafrica.co.ke',
      tier: 'SILVER' as const,
      displayOrder: 6,
      isPublished: true,
    },
    {
      companyName: 'Kuku Foods',
      slug: 'kuku-foods',
      description: 'Affordable poultry and protein products for Kenyan families.',
      logoUrl: 'https://logo.clearbit.com/kukfoods.com',
      websiteUrl: 'https://www.kukfoods.com',
      tier: 'BRONZE' as const,
      displayOrder: 7,
      isPublished: true,
    },
    {
      companyName: 'Twiga Foods',
      slug: 'twiga-foods',
      description: 'Tech-driven food supply company connecting farms to families.',
      logoUrl: 'https://logo.clearbit.com/twiga.com',
      websiteUrl: 'https://www.twiga.com',
      tier: 'BRONZE' as const,
      displayOrder: 8,
      isPublished: true,
    },
    {
      companyName: 'Strathmore University',
      slug: 'strathmore-university',
      description: "Leading private university nurturing Kenya's next generation.",
      logoUrl: 'https://logo.clearbit.com/strathmore.edu',
      websiteUrl: 'https://www.strathmore.edu',
      tier: 'BRONZE' as const,
      displayOrder: 9,
      isPublished: true,
    },
    {
      companyName: 'Unilever Kenya',
      slug: 'unilever-kenya',
      description: 'Global consumer goods company making everyday life better for Kenyan families.',
      logoUrl: 'https://logo.clearbit.com/unilever.co.ke',
      websiteUrl: 'https://www.unilever.co.ke',
      tier: 'PLATINUM' as const,
      displayOrder: 10,
      isPublished: true,
    },
  ];

  const newsletters = [
    { email: 'wambui.kamau@gmail.com' },
    { email: 'james.odhiambo@outlook.com' },
    { email: 'fatuma.ali@yahoo.com' },
    { email: 'peter.mwangi@gmail.com' },
    { email: 'grace.njeri@icloud.com' },
    { email: 'samuel.kipchoge@gmail.com' },
    { email: 'mary.akinyi@outlook.com' },
    { email: 'david.tenai@yahoo.com' },
    { email: 'faith.wanjiku@gmail.com' },
    { email: 'brian.omondi@gmail.com' },
    { email: 'esther.korir@outlook.com' },
    { email: 'joseph.kariuki@gmail.com' },
    { email: 'rose.adhiambo@yahoo.com' },
    { email: 'daniel.nyambura@gmail.com' },
    { email: 'susan.wairimu@outlook.com' },
  ];

  console.log('Seeding sponsors...');
  for (const sponsor of sponsors) {
    await prisma.sponsor.upsert({
      where: { slug: sponsor.slug },
      update: { logoUrl: sponsor.logoUrl },
      create: sponsor,
    });
  }
  console.log(`  ✓ ${sponsors.length} sponsors seeded`);

  console.log('Seeding newsletter subscribers...');
  for (const sub of newsletters) {
    await prisma.newsletterSubscriber.upsert({
      where: { email: sub.email },
      update: {},
      create: sub,
    });
  }
  console.log(`  ✓ ${newsletters.length} newsletter subscribers seeded`);

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
