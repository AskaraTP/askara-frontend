import { api } from '@/lib/api';
import CategoryDetailClient from './CategoryDetailClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  const defaults = [
    { category: 'general' },
    { category: 'instrument' },
    { category: 'rapid-test' },
  ];
  try {
    const categories = await api.getCategories();
    if (categories && categories.length > 0) {
      const generated = categories.map((cat) => ({
        category: cat.slug,
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
    category: string;
  }>;
}

export default function Page({ params }: PageProps) {
  return <CategoryDetailClient params={params} />;
}
