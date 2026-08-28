import {
  Product,
  ProductCategory,
  Article,
  Partner,
  Career,
  CareerApplication,
  Inquiry,
  HeroSlide,
  ShowcaseSlide,
  ShowcaseData,
  HomeSectionContent,
  Industry,
  AdminStats,
  AboutContent,
} from '@/types';
import { clientCache } from './cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

let inMemoryAuthToken: string | null = null;
let onUnauthorizedHandler: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  inMemoryAuthToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryAuthToken;
}

export function setOnUnauthorized(handler: () => void) {
  onUnauthorizedHandler = handler;
}

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    const backendBase = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${backendBase}${url}`;
  }
  return url;
}

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      if (onUnauthorizedHandler) {
        onUnauthorizedHandler();
      }
      throw new Error('Session expired or unauthorized. Please sign in again.');
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.data !== undefined ? data.data : data;
  } catch (error) {
    console.warn(`[API Client] fetch error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Public Catalog
  getCategories: async (activeOnly = true): Promise<ProductCategory[]> => {
    const cacheKey = `categories_active_${activeOnly}`;
    const cached = clientCache.get<ProductCategory[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetcher<ProductCategory[]>(`/categories?activeOnly=${activeOnly}`);
      clientCache.set(cacheKey, data, 180);
      return data;
    } catch {
      return [];
    }
  },

  getCategoryBySlug: async (slug: string): Promise<ProductCategory & { products: Product[] }> => {
    const cacheKey = `category_slug_${slug}`;
    const cached = clientCache.get<ProductCategory & { products: Product[] }>(cacheKey);
    if (cached) return cached;

    const data = await fetcher<ProductCategory & { products: Product[] }>(`/categories/${slug}`);
    clientCache.set(cacheKey, data, 180);
    return data;
  },

  getCategoryById: async (id: number | string): Promise<ProductCategory> => {
    return await fetcher<ProductCategory>(`/categories/id/${id}`);
  },

  getProducts: async (params?: { category?: string; featured?: boolean; search?: string }): Promise<Product[]> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.featured) query.append('featured', 'true');
    if (params?.search) query.append('search', params.search);
    query.append('activeOnly', 'true');

    const cacheKey = `products_${query.toString()}`;
    const cached = clientCache.get<Product[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetcher<Product[]>(`/products?${query.toString()}`);
      clientCache.set(cacheKey, data, 180);
      return data;
    } catch {
      return [];
    }
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const cacheKey = 'products_featured';
    const cached = clientCache.get<Product[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetcher<Product[]>('/products/featured');
      clientCache.set(cacheKey, data, 180);
      return data;
    } catch {
      return [];
    }
  },

  getProductBySlug: async (slug: string, categorySlug?: string): Promise<Product> => {
    const query = categorySlug ? `?categorySlug=${categorySlug}` : '';
    const cacheKey = `product_slug_${slug}_${categorySlug || ''}`;
    const cached = clientCache.get<Product>(cacheKey);
    if (cached) return cached;

    const data = await fetcher<Product>(`/products/${slug}${query}`);
    clientCache.set(cacheKey, data, 180);
    return data;
  },

  getArticles: async (limit?: number): Promise<Article[]> => {
    const cacheKey = `articles_limit_${limit || 'all'}`;
    const cached = clientCache.get<Article[]>(cacheKey);
    if (cached) return cached;

    try {
      const query = limit ? `?limit=${limit}&activeOnly=true` : '?activeOnly=true';
      const data = await fetcher<Article[]>(`/articles${query}`);
      clientCache.set(cacheKey, data, 180);
      return data;
    } catch {
      return [];
    }
  },

  getArticleById: async (id: number | string): Promise<Article> => {
    return await fetcher<Article>(`/articles/${id}`);
  },

  getPartners: async (): Promise<Partner[]> => {
    const cacheKey = 'partners_active';
    const cached = clientCache.get<Partner[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetcher<any>('/partners?activeOnly=true');
      const data = Array.isArray(res) ? res : (res?.data || []);
      clientCache.set(cacheKey, data, 180);
      return data;
    } catch {
      return [];
    }
  },

  getPartnerBySlug: async (slug: string): Promise<Partner> => {
    const cacheKey = `partner_slug_${slug}`;
    const cached = clientCache.get<Partner>(cacheKey);
    if (cached) return cached;

    const res = await fetcher<any>(`/partners/${slug}`);
    const data = res?.data || res;
    clientCache.set(cacheKey, data, 180);
    return data;
  },

  getCareers: async (): Promise<Career[]> => {
    const cacheKey = 'careers_active';
    const cached = clientCache.get<Career[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetcher<Career[]>('/careers?activeOnly=true');
      clientCache.set(cacheKey, data, 180);
      return data;
    } catch {
      return [];
    }
  },

  getCareerBySlug: async (slug: string): Promise<Career> => {
    return await fetcher<Career>(`/careers/${slug}`);
  },

  applyForCareer: async (payload: FormData | Record<string, any>): Promise<any> => {
    if (payload instanceof FormData) {
      const res = await fetch(`${API_BASE_URL}/careers/apply`, {
        method: 'POST',
        body: payload,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit job application');
      }
      return data;
    }

    return await fetcher<any>('/careers/apply', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  uploadCV: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('cv', file);

    const res = await fetch(`${API_BASE_URL}/upload/cv`, {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'CV upload failed');
    }
    return json;
  },

  // Homepage Dynamic Content
  getHeroSlides: async (): Promise<HeroSlide[]> => {
    const cacheKey = 'homepage_hero';
    const cached = clientCache.get<HeroSlide[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetcher<HeroSlide[]>('/homepage/hero?activeOnly=true');
      clientCache.set(cacheKey, data, 180);
      return data;
    } catch {
      return [];
    }
  },

  getShowcaseData: async (): Promise<ShowcaseData> => {
    const cacheKey = 'homepage_showcase';
    const cached = clientCache.get<ShowcaseData>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetcher<ShowcaseData>('/homepage/showcase?activeOnly=true');
      clientCache.set(cacheKey, data, 180);
      return data;
    } catch {
      return {
        section: {
          tag_en: 'WHO WE ARE',
          tag_id: 'TENTANG KAMI',
          title_en: 'Dedicated to Advancing Food Quality & Lab Solutions',
          title_id: 'Berdedikasi Memajukan Kualitas Pangan & Solusi Laboratorium',
          description_en: 'PT Askara Tekno Pangan is an innovative provider of laboratory instruments, solutions, and services for food quality testing and research.',
          description_id: 'PT Askara Tekno Pangan adalah penyedia instrumen, solusi, dan layanan laboratorium inovatif untuk pengujian dan riset kualitas pangan.',
          button_text_en: 'Learn More',
          button_text_id: 'Pelajari Selengkapnya',
          button_url: '/about'
        },
        slides: []
      };
    }
  },

  getAboutContent: async (): Promise<AboutContent> => {
    const cacheKey = 'about_content_data';
    const cached = clientCache.get<AboutContent>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetcher<AboutContent>('/about');
      clientCache.set(cacheKey, data, 180);
      return data;
    } catch {
      return {
        hero_badge_en: 'About PT Askara Tekno Pangan',
        hero_badge_id: 'Tentang PT Askara Tekno Pangan',
        hero_title_en: 'Empowering Food Quality Laboratories in Indonesia',
        hero_title_id: 'Memajukan Laboratorium Kualitas Pangan di Indonesia',
        hero_subtitle_en: 'Through trusted laboratory technology, professional support, and reliable solutions for the food and beverage industry.',
        hero_subtitle_id: 'Melalui teknologi laboratorium terpercaya, dukungan profesional, dan solusi handal untuk industri makanan & minuman.',
        who_we_are_tag_en: 'Who We Are',
        who_we_are_tag_id: 'Tentang Kami',
        who_we_are_heading_en: 'Your Trusted Partner for Food Quality Analysis',
        who_we_are_heading_id: 'Mitra Terpercaya Anda untuk Analisis Kualitas Pangan',
        who_we_are_p1_en: 'PT Askara Tekno Pangan is an Indonesian laboratory solution provider specializing in food quality analysis and analytical solutions.',
        who_we_are_p1_id: 'PT Askara Tekno Pangan adalah penyedia solusi laboratorium di Indonesia yang berfokus pada analisis mutu pangan dan solusi analitis.',
        who_we_are_p2_en: 'Established in 2019, Askara delivers reliable analytical instruments, reagents, and professional support to help laboratories achieve accurate and efficient testing performance.',
        who_we_are_p2_id: 'Didirikan pada tahun 2019, Askara menghadirkan instrumen analitis handal, reagen, serta dukungan profesional untuk membantu laboratorium mencapai performa pengujian yang akurat dan efisien.',
        who_we_are_points_en: [
          'Authorized distributor of BioSystems Food & Beverage',
          'Certified application scientists & field engineers across Indonesia',
          'Full warranty, calibration, and preventive maintenance support'
        ],
        who_we_are_points_id: [
          'Distributor resmi BioSystems Food & Beverage',
          'Application scientist & field engineer tersertifikasi di seluruh Indonesia',
          'Dukungan garansi penuh, kalibrasi, dan pemeliharaan preventif'
        ],
        who_we_are_images: [
          {
            image: '/images/y15.png',
            caption_en: 'BioSystems Y15 Automated Photometric Analyzer',
            caption_id: 'BioSystems Y15 Automated Photometric Analyzer',
            alt_text: 'BioSystems Y15 Analyzer'
          }
        ],
        why_choose_badge_en: 'Why Choose Askara',
        why_choose_badge_id: 'Mengapa Memilih Askara',
        why_choose_heading_en: 'Built for the Food & Beverage Industry',
        why_choose_heading_id: 'Dirancang untuk Industri Makanan & Minuman',
        why_choose_reasons: []
      };
    }
  },

  // Industries (Public)
  getIndustries: async (options?: { activeOnly?: boolean; homepageOnly?: boolean }): Promise<Industry[]> => {
    const cacheKey = `industries_${options?.activeOnly}_${options?.homepageOnly}`;
    const cached = clientCache.get<Industry[]>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams();
      if (options?.activeOnly) params.append('activeOnly', 'true');
      if (options?.homepageOnly) params.append('homepageOnly', 'true');
      const qs = params.toString() ? `?${params.toString()}` : '';
      const data = await fetcher<Industry[]>(`/industries${qs}`);
      clientCache.set(cacheKey, data, 180);
      return data;
    } catch {
      return [];
    }
  },

  getHomepageIndustries: async (): Promise<Industry[]> => {
    const cacheKey = 'industries_homepage';
    const cached = clientCache.get<Industry[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetcher<Industry[]>('/industries/homepage');
      clientCache.set(cacheKey, data, 180);
      return data;
    } catch {
      return [];
    }
  },

  getIndustryBySlug: async (slug: string): Promise<Industry> => {
    return await fetcher<Industry>(`/industries/${slug}`);
  },

  // Admin API
  admin: {
    login: async (credentials: { email: string; password: string }) => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      return data;
    },

    getStats: async (): Promise<AdminStats> => {
      return await fetcher<AdminStats>('/stats/overview');
    },

    // Products CRUD
    getAdminProducts: async (): Promise<Product[]> => {
      return await fetcher<Product[]>('/products');
    },
    getProductById: async (id: number | string): Promise<Product> => {
      return await fetcher<Product>(`/products/id/${id}`);
    },
    createProduct: async (payload: Partial<Product>): Promise<Product> => {
      clientCache.invalidate('products');
      return await fetcher<Product>('/products', { method: 'POST', body: JSON.stringify(payload) });
    },
    updateProduct: async (id: number | string, payload: Partial<Product>): Promise<Product> => {
      clientCache.invalidate('products');
      clientCache.invalidate(`product_slug_`);
      return await fetcher<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    deleteProduct: async (id: number | string) => {
      clientCache.invalidate('products');
      clientCache.invalidate(`product_slug_`);
      return await fetcher(`/products/${id}`, { method: 'DELETE' });
    },
    reorderProducts: async (orderedIds: (number | string)[]): Promise<Product[]> => {
      clientCache.invalidate('products');
      return await fetcher<Product[]>('/products/reorder', { method: 'PUT', body: JSON.stringify({ orderedIds }) });
    },

    // Categories CRUD
    getAdminCategories: async (): Promise<ProductCategory[]> => {
      return await fetcher<ProductCategory[]>('/categories');
    },
    getCategoryById: async (id: number | string): Promise<ProductCategory> => {
      return await fetcher<ProductCategory>(`/categories/id/${id}`);
    },
    createCategory: async (payload: Partial<ProductCategory>): Promise<ProductCategory> => {
      clientCache.invalidate('categories');
      return await fetcher<ProductCategory>('/categories', { method: 'POST', body: JSON.stringify(payload) });
    },
    updateCategory: async (id: number | string, payload: Partial<ProductCategory>): Promise<ProductCategory> => {
      clientCache.invalidate('categories');
      clientCache.invalidate('category_slug_');
      return await fetcher<ProductCategory>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    deleteCategory: async (id: number | string) => {
      clientCache.invalidate('categories');
      clientCache.invalidate('category_slug_');
      return await fetcher(`/categories/${id}`, { method: 'DELETE' });
    },
    reorderCategories: async (orderedIds: (number | string)[]): Promise<ProductCategory[]> => {
      clientCache.invalidate('categories');
      return await fetcher<ProductCategory[]>('/categories/reorder', { method: 'PUT', body: JSON.stringify({ orderedIds }) });
    },

    // Articles CRUD
    getAdminArticles: async (): Promise<Article[]> => {
      return await fetcher<Article[]>('/articles');
    },
    getArticleById: async (id: number | string): Promise<Article> => {
      return await fetcher<Article>(`/articles/${id}`);
    },
    createArticle: async (payload: Partial<Article>): Promise<Article> => {
      clientCache.invalidate('articles');
      return await fetcher<Article>('/articles', { method: 'POST', body: JSON.stringify(payload) });
    },
    updateArticle: async (id: number | string, payload: Partial<Article>): Promise<Article> => {
      clientCache.invalidate('articles');
      return await fetcher<Article>(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    deleteArticle: async (id: number | string) => {
      clientCache.invalidate('articles');
      return await fetcher(`/articles/${id}`, { method: 'DELETE' });
    },
    reorderArticles: async (orderedIds: (number | string)[]): Promise<Article[]> => {
      clientCache.invalidate('articles');
      return await fetcher<Article[]>('/articles/reorder', { method: 'PUT', body: JSON.stringify({ orderedIds }) });
    },

    // Partners CRUD
    getAdminPartners: async (): Promise<Partner[]> => {
      const res = await fetcher<any>('/partners');
      return Array.isArray(res) ? res : (res?.data || []);
    },
    getPartnerById: async (id: number | string): Promise<Partner> => {
      const res = await fetcher<any>(`/partners/${id}`);
      return res?.data || res;
    },
    createPartner: async (payload: Partial<Partner>): Promise<Partner> => {
      clientCache.invalidate('partners');
      const res = await fetcher<any>('/partners', { method: 'POST', body: JSON.stringify(payload) });
      return res?.data || res;
    },
    updatePartner: async (id: number | string, payload: Partial<Partner>): Promise<Partner> => {
      clientCache.invalidate('partners');
      clientCache.invalidate('partner_slug_');
      const res = await fetcher<any>(`/partners/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      return res?.data || res;
    },
    deletePartner: async (id: number | string) => {
      clientCache.invalidate('partners');
      clientCache.invalidate('partner_slug_');
      return await fetcher(`/partners/${id}`, { method: 'DELETE' });
    },
    reorderPartners: async (orderedIds: (number | string)[]): Promise<Partner[]> => {
      clientCache.invalidate('partners');
      const res = await fetcher<any>('/partners/reorder', { method: 'PUT', body: JSON.stringify({ orderedIds }) });
      return Array.isArray(res) ? res : (res?.data || []);
    },

    // Careers CRUD
    getAdminCareers: async (): Promise<Career[]> => {
      return await fetcher<Career[]>('/careers');
    },
    getCareerById: async (id: number | string): Promise<Career> => {
      return await fetcher<Career>(`/careers/admin/${id}`);
    },
    createCareer: async (payload: Partial<Career>): Promise<Career> => {
      clientCache.invalidate('careers');
      return await fetcher<Career>('/careers', { method: 'POST', body: JSON.stringify(payload) });
    },
    updateCareer: async (id: number | string, payload: Partial<Career>): Promise<Career> => {
      clientCache.invalidate('careers');
      return await fetcher<Career>(`/careers/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    deleteCareer: async (id: number | string) => {
      clientCache.invalidate('careers');
      return await fetcher(`/careers/${id}`, { method: 'DELETE' });
    },

    // Career Applications Management
    getAdminApplications: async (options?: { careerId?: number | string; status?: string }): Promise<CareerApplication[]> => {
      const params = new URLSearchParams();
      if (options?.careerId) params.append('career_id', String(options.careerId));
      if (options?.status) params.append('status', options.status);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetcher<any>(`/careers/admin/applications/all${qs}`);
      return Array.isArray(res) ? res : (res?.data || []);
    },
    getApplicationById: async (id: number | string): Promise<CareerApplication> => {
      const res = await fetcher<any>(`/careers/admin/applications/${id}`);
      return res?.data || res;
    },
    updateApplicationStatus: async (id: number | string, status: string): Promise<CareerApplication> => {
      const res = await fetcher<any>(`/careers/admin/applications/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return res?.data || res;
    },
    deleteApplication: async (id: number | string): Promise<any> => {
      return await fetcher(`/careers/admin/applications/${id}`, { method: 'DELETE' });
    },

    // Homepage Hero Slides CRUD
    getAdminHeroSlides: async (): Promise<HeroSlide[]> => {
      return await fetcher<HeroSlide[]>('/homepage/hero/admin');
    },
    getHeroSlideById: async (id: number | string): Promise<HeroSlide> => {
      return await fetcher<HeroSlide>(`/homepage/hero/${id}`);
    },
    createHeroSlide: async (payload: Partial<HeroSlide>): Promise<HeroSlide> => {
      clientCache.invalidate('homepage_hero');
      return await fetcher<HeroSlide>('/homepage/hero', { method: 'POST', body: JSON.stringify(payload) });
    },
    updateHeroSlide: async (id: number | string, payload: Partial<HeroSlide>): Promise<HeroSlide> => {
      clientCache.invalidate('homepage_hero');
      return await fetcher<HeroSlide>(`/homepage/hero/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    deleteHeroSlide: async (id: number | string) => {
      clientCache.invalidate('homepage_hero');
      return await fetcher(`/homepage/hero/${id}`, { method: 'DELETE' });
    },
    reorderHeroSlides: async (orderedIds: (number | string)[]): Promise<HeroSlide[]> => {
      clientCache.invalidate('homepage_hero');
      return await fetcher<HeroSlide[]>('/homepage/hero/reorder', { method: 'PUT', body: JSON.stringify({ orderedIds }) });
    },

    // Homepage Showcase & Section CRUD
    getAdminShowcaseData: async (): Promise<ShowcaseData> => {
      return await fetcher<ShowcaseData>('/homepage/showcase/admin');
    },
    getShowcaseSlideById: async (id: number | string): Promise<ShowcaseSlide> => {
      return await fetcher<ShowcaseSlide>(`/homepage/showcase/slides/${id}`);
    },
    updateWhoWeAreSection: async (payload: Partial<HomeSectionContent>): Promise<HomeSectionContent> => {
      clientCache.invalidate('homepage_showcase');
      return await fetcher<HomeSectionContent>('/homepage/showcase/section', { method: 'PUT', body: JSON.stringify(payload) });
    },
    createShowcaseSlide: async (payload: Partial<ShowcaseSlide>): Promise<ShowcaseSlide> => {
      clientCache.invalidate('homepage_showcase');
      return await fetcher<ShowcaseSlide>('/homepage/showcase/slides', { method: 'POST', body: JSON.stringify(payload) });
    },
    updateShowcaseSlide: async (id: number | string, payload: Partial<ShowcaseSlide>): Promise<ShowcaseSlide> => {
      clientCache.invalidate('homepage_showcase');
      return await fetcher<ShowcaseSlide>(`/homepage/showcase/slides/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    deleteShowcaseSlide: async (id: number | string) => {
      clientCache.invalidate('homepage_showcase');
      return await fetcher(`/homepage/showcase/slides/${id}`, { method: 'DELETE' });
    },
    reorderShowcaseSlides: async (orderedIds: (number | string)[]): Promise<ShowcaseSlide[]> => {
      clientCache.invalidate('homepage_showcase');
      return await fetcher<ShowcaseSlide[]>('/homepage/showcase/slides/reorder', { method: 'PUT', body: JSON.stringify({ orderedIds }) });
    },

    // Industries CRUD
    getAdminIndustries: async (): Promise<Industry[]> => {
      return await fetcher<Industry[]>('/industries');
    },
    getIndustryById: async (id: number | string): Promise<Industry> => {
      return await fetcher<Industry>(`/industries/${id}`);
    },
    createIndustry: async (payload: Partial<Industry>): Promise<Industry> => {
      clientCache.invalidate('industries');
      return await fetcher<Industry>('/industries', { method: 'POST', body: JSON.stringify(payload) });
    },
    updateIndustry: async (id: number | string, payload: Partial<Industry>): Promise<Industry> => {
      clientCache.invalidate('industries');
      return await fetcher<Industry>(`/industries/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    deleteIndustry: async (id: number | string) => {
      clientCache.invalidate('industries');
      return await fetcher(`/industries/${id}`, { method: 'DELETE' });
    },
    reorderIndustries: async (orderedIds: (number | string)[]): Promise<Industry[]> => {
      clientCache.invalidate('industries');
      return await fetcher<Industry[]>('/industries/reorder', { method: 'PUT', body: JSON.stringify({ orderedIds }) });
    },

    // File / Image Upload
    uploadImage: async (file: File): Promise<{ url: string; filename: string }> => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('image', file);

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (res.status === 401) {
        if (onUnauthorizedHandler) onUnauthorizedHandler();
        throw new Error('Session expired or unauthorized. Please sign in again.');
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Image upload failed');
      }

      return await res.json();
    },

    uploadMultipleImages: async (files: File[]): Promise<{ url: string; filename: string }[]> => {
      const token = getAuthToken();
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/upload/images`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (res.status === 401) {
        if (onUnauthorizedHandler) onUnauthorizedHandler();
        throw new Error('Session expired or unauthorized. Please sign in again.');
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Multiple images upload failed');
      }

      const json = await res.json();
      return json.files || [];
    },

    // About Us Content Management
    getAdminAboutContent: async (): Promise<AboutContent> => {
      return await fetcher<AboutContent>('/about');
    },
    updateAdminAboutContent: async (payload: Partial<AboutContent>): Promise<AboutContent> => {
      clientCache.invalidate('about_content_data');
      return await fetcher<AboutContent>('/about', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
  },
};
