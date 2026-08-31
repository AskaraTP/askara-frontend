import { api } from '@/lib/api';
import CareerDetailClient from './CareerDetailClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const careers = await api.getCareers();
    if (careers && careers.length > 0) {
      return careers.map((job) => ({
        slug: job.slug || String(job.id),
      }));
    }
  } catch {
    // Fallback to default
  }
  return [{ slug: 'account-executive' }, { slug: '1' }];
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function Page({ params }: PageProps) {
  return <CareerDetailClient params={params} />;
}
