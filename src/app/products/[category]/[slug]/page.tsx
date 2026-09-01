import { api } from '@/lib/api';
import ProductDetailClient from './ProductDetailClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  const defaults = [
    { category: 'general', slug: 'detail' },
    { category: 'instrument', slug: 'biosystems-y15' },
  ];
  try {
    const products = await api.getProducts();
    if (products && products.length > 0) {
      const generated = products.map((prod) => ({
        category: prod.product_category?.slug || 'general',
        slug: prod.slug,
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
    slug: string;
  }>;
}

export default function Page({ params }: PageProps) {
  return <ProductDetailClient params={params} />;
}
