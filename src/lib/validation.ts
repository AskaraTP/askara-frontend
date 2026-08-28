/**
 * Centralized Input Validation Engine
 * Provides unified schemas, formatters, and validators across Askara web and admin app.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Common Regex Patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validate Category Input Form
 */
export interface CategoryInput {
  name_en: string;
  name_id?: string;
  slug?: string;
  description_en?: string;
  description_id?: string;
  image?: string;
  sort_order?: number | string;
  is_active?: boolean;
}

export function validateCategory(data: CategoryInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name_en || !data.name_en.trim()) {
    errors.name_en = 'Category name (English) is required.';
  } else if (data.name_en.trim().length < 2) {
    errors.name_en = 'Category name must be at least 2 characters.';
  }

  if (data.name_id && data.name_id.trim().length > 0 && data.name_id.trim().length < 2) {
    errors.name_id = 'Category name (Indonesian) must be at least 2 characters if provided.';
  }

  if (data.slug && data.slug.trim()) {
    const cleanSlug = data.slug.trim().toLowerCase();
    if (!SLUG_REGEX.test(cleanSlug)) {
      errors.slug = 'Slug must only contain lowercase letters, numbers, and hyphens (e.g. food-safety).';
    }
  }

  if (data.sort_order !== undefined && data.sort_order !== '') {
    const num = Number(data.sort_order);
    if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
      errors.sort_order = 'Sort order must be a positive integer.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate Article & News Input Form
 */
export interface ArticleInput {
  title_en: string;
  title_id?: string;
  category_en: string;
  category_id?: string;
  image?: string;
  published_at?: string;
  linkedin_url?: string;
  sort_order?: number | string;
  is_active?: boolean;
}

export function validateArticle(data: ArticleInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title_en || !data.title_en.trim()) {
    errors.title_en = 'Article title (English) is required.';
  } else if (data.title_en.trim().length < 3) {
    errors.title_en = 'Title must be at least 3 characters.';
  }

  if (!data.title_id || !data.title_id.trim()) {
    errors.title_id = 'Article title (Indonesian) is required for bilingual support.';
  } else if (data.title_id.trim().length < 3) {
    errors.title_id = 'Title must be at least 3 characters.';
  }

  if (!data.category_en || !data.category_en.trim()) {
    errors.category_en = 'Category selection is required.';
  }

  if (data.linkedin_url && data.linkedin_url.trim()) {
    const url = data.linkedin_url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      errors.linkedin_url = 'LinkedIn URL must start with http:// or https://';
    } else if (!URL_REGEX.test(url)) {
      errors.linkedin_url = 'Please enter a valid URL.';
    }
  }

  if (data.sort_order !== undefined && data.sort_order !== '') {
    const num = Number(data.sort_order);
    if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
      errors.sort_order = 'Sort order must be a non-negative integer.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate Product Input Form
 */
export interface ProductInput {
  name_en: string;
  name_id?: string;
  slug?: string;
  product_category_id: number | string;
  principal?: string;
  short_description_en?: string;
  short_description_id?: string;
  description_en?: string;
  description_id?: string;
  sort_order?: number | string;
}

export function validateProduct(data: ProductInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name_en || !data.name_en.trim()) {
    errors.name_en = 'Product name (English) is required.';
  }

  if (!data.product_category_id || data.product_category_id === '') {
    errors.product_category_id = 'Please select a valid product category.';
  }

  if (data.slug && data.slug.trim()) {
    const cleanSlug = data.slug.trim().toLowerCase();
    if (!SLUG_REGEX.test(cleanSlug)) {
      errors.slug = 'Slug format is invalid. Use lowercase alphanumeric with dashes.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate Contact & Inquiry Form
 */
export interface ContactInput {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject?: string;
  message: string;
}

export function validateContact(data: ContactInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Full name is required.';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!data.message || !data.message.trim()) {
    errors.message = 'Message content is required.';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate Admin Login Form
 */
export interface LoginInput {
  email: string;
  password?: string;
}

export function validateLogin(data: LoginInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!data.password || !data.password.trim()) {
    errors.password = 'Password is required.';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Auto-generate URL slug from title/name
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validate Career Job Application Form
 */
export interface CareerApplicationInput {
  full_name: string;
  email: string;
  phone: string;
  linkedin_url?: string;
  portfolio_url?: string;
  cover_letter?: string;
}

export const MAX_CV_SIZE_BYTES = 30 * 1024 * 1024; // 30 Megabytes
export const ALLOWED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export function validateCareerApplication(
  data: CareerApplicationInput,
  cvFile?: File | null,
  cvUrl?: string | null
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.full_name || !data.full_name.trim()) {
    errors.full_name = 'Full name is required.';
  } else if (data.full_name.trim().length < 2) {
    errors.full_name = 'Name must be at least 2 characters.';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'Phone / WhatsApp number is required.';
  } else if (data.phone.trim().length < 8) {
    errors.phone = 'Please provide a valid phone number with at least 8 digits.';
  }

  if (data.linkedin_url && data.linkedin_url.trim()) {
    const url = data.linkedin_url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      errors.linkedin_url = 'LinkedIn URL must start with http:// or https://';
    } else if (!URL_REGEX.test(url)) {
      errors.linkedin_url = 'Please enter a valid LinkedIn URL.';
    }
  }

  if (data.portfolio_url && data.portfolio_url.trim()) {
    const url = data.portfolio_url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      errors.portfolio_url = 'Portfolio URL must start with http:// or https://';
    } else if (!URL_REGEX.test(url)) {
      errors.portfolio_url = 'Please enter a valid URL.';
    }
  }

  // Validate CV document file
  if (!cvFile && !cvUrl) {
    errors.cv = 'CV / Resume document is required (PDF, DOC, or DOCX up to 30MB).';
  } else if (cvFile) {
    // Check file size limit (30MB)
    if (cvFile.size > MAX_CV_SIZE_BYTES) {
      const sizeMB = (cvFile.size / (1024 * 1024)).toFixed(1);
      errors.cv = `File size (${sizeMB} MB) exceeds maximum limit of 30 MB.`;
    }

    // Check file extension
    const ext = cvFile.name.substring(cvFile.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_CV_EXTENSIONS.includes(ext)) {
      errors.cv = 'Only PDF (.pdf), Word (.doc, .docx) formats are supported.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

