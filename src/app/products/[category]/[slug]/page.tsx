import { api } from '@/lib/api';
import ProductDetailClient from './ProductDetailClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const products = await api.getProducts();
    if (products && products.length > 0) {
      return products.map((prod) => ({
        category: prod.product_category?.slug || 'general',
        slug: prod.slug,
      }));
    }
  } catch {
    // Fallback to default
  }
  return [
    { category: 'instrument', slug: 'biosystems-y15' },
    { category: 'rapid-test', slug: 'gluten-test-kit' },
    { category: 'rapid-test', slug: 'histamine-test-kit' },
  ];
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
