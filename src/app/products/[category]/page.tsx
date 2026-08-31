import { api } from '@/lib/api';
import CategoryDetailClient from './CategoryDetailClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const categories = await api.getCategories();
    if (categories && categories.length > 0) {
      return categories.map((cat) => ({
        category: cat.slug,
      }));
    }
  } catch {
    // Fallback to default
  }
  return [
    { category: 'instrument' },
    { category: 'reagent-kimia' },
    { category: 'rapid-test' },
    { category: 'ipal' },
  ];
}

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function Page({ params }: PageProps) {
  return <CategoryDetailClient params={params} />;
}
