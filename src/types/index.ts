export type Locale = 'en' | 'id';

export interface ProductCategory {
  id: number;
  name_en: string;
  name_id: string;
  slug: string;
  description_en: string | null;
  description_id: string | null;
  image: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  products?: Product[];
}

export interface Product {
  id: number;
  product_category_id: number | null;
  category_slug?: string | null;
  name_en: string;
  name_id: string;
  slug: string;
  principal: string | null;
  short_description_en: string | null;
  short_description_id: string | null;
  description_en: string | null;
  description_id: string | null;
  image: string | null;
  specifications: string | null;
  applications_en: string | null;
  applications_id: string | null;
  features_en: string | null;
  features_id: string | null;
  brochure: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at?: string;
  product_category?: ProductCategory | null;
}

export interface Article {
  id: number;
  title_en: string;
  title_id: string;
  category_en: string | null;
  category_id: string | null;
  image: string | null;
  published_at: string;
  linkedin_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface PartnerGalleryItem {
  id?: string;
  url: string;
  caption_en?: string;
  caption_id?: string;
  date?: string;
}

export interface Partner {
  id: number;
  name: string;
  slug?: string;
  logo: string | null;
  country?: string | null;
  category?: string | null;
  description_en?: string | null;
  description_id?: string | null;
  documentation_gallery?: PartnerGalleryItem[];
  website_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Career {
  id: number;
  slug?: string;
  job_title_en: string;
  job_title_id: string;
  department_en?: string | null;
  department_id?: string | null;
  location_en: string | null;
  location_id: string | null;
  employment_type_en: string | null;
  employment_type_id: string | null;
  experience_level_en?: string | null;
  experience_level_id?: string | null;
  linkedin_url: string | null;
  description_en?: string | null;
  description_id?: string | null;
  responsibilities_en?: string | null;
  responsibilities_id?: string | null;
  requirements_en?: string | null;
  requirements_id?: string | null;
  benefits_en?: string | null;
  benefits_id?: string | null;
  salary_range?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface CareerApplication {
  id: number;
  career_id: number | null;
  career_title?: string | null;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  cover_letter?: string | null;
  cv_url: string;
  cv_filename?: string | null;
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface Inquiry {
  id: number;
  product_id: number | null;
  product_name: string | null;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  message: string;
  status: 'new' | 'in_progress' | 'contacted' | 'closed';
  created_at?: string;
}

export interface HeroSlide {
  id: number;
  title_en: string;
  title_id: string;
  subtitle_en: string;
  subtitle_id: string;
  image: string;
  primary_btn_text_en: string;
  primary_btn_text_id: string;
  primary_btn_url: string;
  secondary_btn_text_en: string;
  secondary_btn_text_id: string;
  secondary_btn_url: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface ShowcaseSlide {
  id: number;
  image: string;
  title_en: string;
  title_id: string;
  caption_en: string;
  caption_id: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface HomeSectionContent {
  id?: number;
  section_key?: string;
  tag_en: string;
  tag_id: string;
  title_en: string;
  title_id: string;
  description_en: string;
  description_id: string;
  button_text_en: string;
  button_text_id: string;
  button_url: string;
}

export interface ShowcaseData {
  section: HomeSectionContent;
  slides: ShowcaseSlide[];
}

export interface Industry {
  id: number;
  slug: string;
  name_en?: string;
  name_id?: string;
  title_en?: string;
  title_id?: string;
  subtitle_en?: string;
  subtitle_id?: string;
  description_en: string;
  description_id: string;
  icon?: string;
  icon_name?: string;
  image?: string;
  tags_en: string[];
  tags_id: string[];
  target_category_slug?: string;
  show_on_homepage?: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalArticles: number;
  totalPartners: number;
  totalCareers: number;
  activeCareers: number;
  totalInquiries?: number;
  newInquiries?: number;
  recentInquiries?: Inquiry[];
  recentProducts: Product[];
}

export interface AboutSlideImage {
  image: string;
  caption_en?: string;
  caption_id?: string;
  alt_text?: string;
  sort_order?: number;
}

export interface AboutReason {
  icon: string;
  title_en: string;
  title_id: string;
  desc_en: string;
  desc_id: string;
  sort_order?: number;
}

export interface AboutContent {
  id?: number;
  key?: string;
  hero_badge_en: string;
  hero_badge_id: string;
  hero_title_en: string;
  hero_title_id: string;
  hero_subtitle_en: string;
  hero_subtitle_id: string;

  who_we_are_tag_en: string;
  who_we_are_tag_id: string;
  who_we_are_heading_en: string;
  who_we_are_heading_id: string;
  who_we_are_p1_en: string;
  who_we_are_p1_id: string;
  who_we_are_p2_en: string;
  who_we_are_p2_id: string;
  who_we_are_points_en: string[];
  who_we_are_points_id: string[];
  who_we_are_images: AboutSlideImage[];

  why_choose_badge_en: string;
  why_choose_badge_id: string;
  why_choose_heading_en: string;
  why_choose_heading_id: string;
  why_choose_reasons: AboutReason[];
  updated_at?: string;
}

