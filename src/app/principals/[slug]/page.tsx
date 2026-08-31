import { api } from '@/lib/api';
import PrincipalDetailClient from './PrincipalDetailClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const partners = await api.getPartners();
    if (partners && partners.length > 0) {
      return partners.map((partner) => ({
        slug:
          partner.slug ||
          partner.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') ||
          String(partner.id),
      }));
    }
  } catch {
    // Fallback to default
  }
  return [{ slug: 'biosystems' }, { slug: '1' }];
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function Page({ params }: PageProps) {
  return <PrincipalDetailClient params={params} />;
}
