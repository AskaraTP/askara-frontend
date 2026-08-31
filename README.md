# PT Askara Tekno Pangan — Frontend Documentation

Production-grade, modern web platform for **PT Askara Tekno Pangan** built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**.

---

## 🌟 Key Architecture Highlights

- **Static Export & SSG Compilation**: Configured for high-speed edge delivery and static prerendering (100% clean static builds across all 62+ routes).
- **Hybrid Routing Strategy**:
  - **Public Consumer SEO Routes**: Semantic, permalink dynamic routes (`/products/[category]/[slug]`, `/career/[slug]`, `/principals/[slug]`) with `generateStaticParams()` for optimal Google indexing.
  - **Admin CMS Routes**: Clean, standardized **Query Parameter Pattern** (`/admin/<module>/edit?id=...` & `/admin/<module>/detail?id=...`) wrapped inside React `<Suspense>` boundaries to eliminate nested dummy folders and prevent build deopt.
- **Pure Database-Driven Dynamic Rendering**: Zero static text flashing or blinking on page refresh; all dynamic CMS data (Hero sliders, Who We Are, Showcase, Products, Industries, Partners, Articles, About Us) bind directly to the backend API.
- **Enterprise SEO & Structured Data**: Built-in Schema.org JSON-LD (`Organization`, `WebSite` with `SearchAction`, `BreadcrumbList`, `CollectionPage`), dynamic `sitemap.xml`, `robots.txt`, and Google Search Console verification.
- **Bilingual Internationalization (i18n)**: Seamless English (`en`) & Indonesian (`id`) support for UI layout labels, paired with dual-language database model fields (`name_en`/`name_id`, `description_en`/`description_id`).

---

## 📁 Directory Structure

```text
frontend/
├── public/
│   └── images/                       # Ported product imagery, partner logos, banners, placeholders
│
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (public)/                 # Public Client Pages
│   │   │   ├── page.tsx              # Homepage (Hero Slider, Who We Are, Showcase, Partners, etc.)
│   │   │   ├── about/                # About Us (Company Profile, Video/Slider, Why Choose Us)
│   │   │   ├── products/             # Product Catalog & Dynamic Category / Product Detail Pages
│   │   │   │   ├── [category]/       # Category Showcase
│   │   │   │   │   └── [slug]/       # Full Product Spec Sheet & Brochure Download
│   │   │   ├── industries/           # Industry Sectors (F&B, Seafood, Dairy, Beverage, etc.)
│   │   │   ├── principals/           # Technology Partners & Principal Directory
│   │   │   │   └── [slug]/           # Principal Profile, Distributed Products & Photo Gallery
│   │   │   ├── articles/             # Knowledge Hub, News & LinkedIn Articles
│   │   │   ├── career/               # Job Vacancies & Online Application Form
│   │   │   │   └── [slug]/           # Vacancy Detail & Resume Upload
│   │   │   ├── contact/              # Direct Consultation & Inquiry Form
│   │   │   ├── sitemap.ts            # Dynamic sitemap.xml generator
│   │   │   └── robots.ts             # Search engine crawling rules (robots.txt)
│   │   │
│   │   ├── admin/                    # Built-in CMS Admin Portal
│   │   │   ├── login/                # Admin Authentication Portal
│   │   │   ├── dashboard/            # Overview Analytics & Quick Navigation Cards
│   │   │   ├── homepage/             # Sliders & Who We Are Dual-Language CMS
│   │   │   │   ├── hero/             # Hero Slider CRUD (create/, edit?id=..., detail?id=...)
│   │   │   │   └── showcase/         # Showcase Slider CRUD (create/, edit?id=..., detail?id=...)
│   │   │   ├── about/                # About Us Page CMS (Hero, Sliders, Points, Why Choose Cards)
│   │   │   ├── products/             # Products Catalog CMS (create/, edit?id=...)
│   │   │   ├── categories/           # Product Categories CMS (create/, edit?id=...)
│   │   │   ├── industries/           # Industry Sectors CMS (create/, edit?id=..., detail?id=...)
│   │   │   ├── partners/             # Principals CMS (create/, edit?id=..., detail?id=...)
│   │   │   ├── articles/             # Articles & Insights CMS (create/, edit?id=...)
│   │   │   └── careers/              # Vacancies CMS & Applicant Submissions Management
│   │   │
│   │   ├── layout.tsx                # Root layout with Providers & Organization JSON-LD
│   │   └── globals.css               # Global CSS & Tailwind imports
│   │
│   ├── components/
│   │   ├── layout/                   # Navbar, Footer, CTA, Mobile Nav
│   │   ├── products/                 # ProductCard, SpecTable, QuoteModal, CategoryFilter
│   │   ├── admin/                    # AdminLayout, AdminImageUpload, StatusToggle, StatsCard
│   │   ├── seo/                      # JsonLd structured data renderer
│   │   └── ui/                       # Skeletons, Spinners, Toast, Confirm Modals
│   │
│   ├── context/
│   │   ├── AuthContext.tsx           # Admin JWT state & persistent localStorage authentication
│   │   └── UIContext.tsx             # Global notification toasts and confirmation dialogs
│   │
│   ├── hooks/
│   │   └── useDynamicRouteParams.ts  # Next.js App Router dynamic parameter extractor helper
│   │
│   ├── i18n/
│   │   ├── context.tsx               # Client-side Language Context & getLocalizedText() helper
│   │   ├── en.json                   # English persistent UI strings
│   │   └── id.json                   # Indonesian persistent UI strings
│   │
│   ├── lib/
│   │   ├── api.ts                    # Strongly typed API client with JWT interception & retry
│   │   └── errorHandler.ts           # Standardized error parser
│   │
│   └── types/
│       └── index.ts                  # Centralized TypeScript entity definitions
│
├── next.config.ts                    # Next.js export & image optimization configuration
├── tailwind.config.ts                # Custom Tailwind color palette (brand, slate, etc.)
└── tsconfig.json                     # TypeScript strict configuration
```

---

## 🛠️ Getting Started (Local Development)

### 1. Prerequisites
- Node.js 18.x or 20.x LTS
- Backend API running on `http://localhost:5000` (or remote backend URL)

### 2. Environment Configuration
Create `.env.local` in the `frontend/` directory:

```env
# Backend API Base Endpoint
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Canonical Production URL (used for SEO schemas & OpenGraph)
NEXT_PUBLIC_SITE_URL=https://askara.co.id
```

### 3. Install Dependencies & Start Dev Server
```bash
# Install dependencies
npm install

# Run development server with Hot Module Replacement (HMR)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Static Export

The project compiles 100% cleanly as a production bundle:

```bash
# Run Next.js production build and static export
npm run build

# Run linting check
npm run lint
```

When `npm run build` completes:
- All static HTML, JS, and CSS assets are exported to `.next` / `out`.
- All admin pages are compiled as static routes: `○ (Static)`.
- All public dynamic slug pages are prerendered as static HTML: `● (SSG)`.

---

## 🔐 Admin Panel Portal

- **URL**: `http://localhost:3000/admin/login`
- **Default Username / Email**: `admin@askara.co.id`
- **Default Password**: `admin123`

### Features:
1. **Homepage Management**: Live reordering & dual-language editing for Hero Sliders, Showcase Sliders, and Who We Are banner.
2. **About Us Page CMS**: Visual editor for Hero headings, multi-image carousel slider, advantage checkmarks, and Why Choose reason cards.
3. **Products & Categories**: Full product specifications (`Key | Value`), image uploads, PDF brochure attachments, and featured badges.
4. **Industries**: Manage industry icons, descriptions, target product category mappings, and homepage featured flags.
5. **Principals & Technology Partners**: Profile management with multi-image field documentation gallery and lightbox previews.
6. **Articles & Insights**: Knowledge hub articles with LinkedIn sharing URLs.
7. **Careers & Job Applicants**: Post vacancies and review incoming candidate applications with downloadable CVs.

---

## 🔍 SEO & Webmaster Checklist

1. **Google Search Console**: Verification token is managed in `src/app/layout.tsx`:
   ```tsx
   verification: {
     google: '6wWUjHw0t33QvweuT_eZP8v6jsMOsA0pPtWukN6Ov78',
   }
   ```
2. **Sitemap**: Auto-generated dynamically at `https://askara.co.id/sitemap.xml`.
3. **Robots.txt**: Served automatically at `https://askara.co.id/robots.txt`.
