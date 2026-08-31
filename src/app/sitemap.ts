import { MetadataRoute } from 'next';
import { api } from '@/lib/api';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://askara.co.id';
  const now = new Date().toISOString();

  // Core Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/industries`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/principals`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/career`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
  ];

  try {
    const [categories, products, careers, partners, articles] = await Promise.all([
      api.getCategories(true).catch(() => []),
      api.getProducts().catch(() => []),
      api.getCareers().catch(() => []),
      api.getPartners().catch(() => []),
      api.getArticles().catch(() => []),
    ]);

    // Product Category pages
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/products/${cat.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    }));

    // Product Detail pages
    const productRoutes: MetadataRoute.Sitemap = products.map((prod) => {
      const catSlug = prod.product_category?.slug || 'general';
      return {
        url: `${baseUrl}/products/${catSlug}/${prod.slug}`,
        lastModified: (prod as any).updated_at || now,
        changeFrequency: 'weekly',
        priority: 0.9,
      };
    });

    // Career Detail pages
    const careerRoutes: MetadataRoute.Sitemap = careers.map((job) => ({
      url: `${baseUrl}/career/${job.slug || job.id}`,
      lastModified: (job as any).updated_at || now,
      changeFrequency: 'weekly',
      priority: 0.75,
    }));

    // Partner / Principal Detail pages
    const partnerRoutes: MetadataRoute.Sitemap = partners.map((partner) => ({
      url: `${baseUrl}/principals/${partner.slug || partner.id}`,
      lastModified: (partner as any).updated_at || now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...careerRoutes, ...partnerRoutes];
  } catch (error) {
    console.warn('[Sitemap] Failed to fetch dynamic entities for sitemap:', error);
    return staticRoutes;
  }
}
