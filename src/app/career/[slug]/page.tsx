import { api } from '@/lib/api';
import CareerDetailClient from './CareerDetailClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  const defaults = [{ slug: 'account-executive' }, { slug: '1' }];
  try {
    const careers = await api.getCareers();
    if (careers && careers.length > 0) {
      const generated = careers.map((job) => ({
        slug: job.slug || String(job.id),
      }));
      return [...defaults, ...generated];
    }
  } catch {
    // Fallback to default
  }
  return defaults;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function Page({ params }: PageProps) {
  return <CareerDetailClient params={params} />;
}
