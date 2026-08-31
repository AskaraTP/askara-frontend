'use client';

import { useParams } from 'next/navigation';
import { use } from 'react';

const NON_ID_SEGMENTS = new Set([
  'admin',
  'industries',
  'articles',
  'products',
  'partners',
  'careers',
  'career',
  'categories',
  'hero',
  'showcase',
  'inquiries',
  'create',
  'edit',
  '[id]',
  '[slug]',
  'undefined',
  'null',
]);

/**
 * Extracts a dynamic param (like id, slug, category) reliably in both
 * standard SSR and Next.js static export environments.
 */
export function useDynamicId(staticParams?: Promise<{ id?: string }> | { id?: string }): string {
  const routeParams = useParams();

  // 1. Check window.location.pathname in browser for real URL
  if (typeof window !== 'undefined') {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const editIndex = pathSegments.indexOf('edit');
    if (editIndex > 0) {
      const segmentId = pathSegments[editIndex - 1];
      if (segmentId && !NON_ID_SEGMENTS.has(segmentId.toLowerCase())) {
        return decodeURIComponent(segmentId);
      }
    } else if (pathSegments[0] === 'admin' && pathSegments.length >= 3) {
      const candidate = pathSegments[2];
      if (candidate && !NON_ID_SEGMENTS.has(candidate.toLowerCase())) {
        return decodeURIComponent(candidate);
      }
    } else if (pathSegments[0] === 'admin' && pathSegments.length <= 2) {
      // List page e.g. /admin/industries or /admin/articles -> no item ID
      return '';
    } else if (pathSegments.length >= 2) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && !NON_ID_SEGMENTS.has(lastSegment.toLowerCase())) {
        return decodeURIComponent(lastSegment);
      }
    }
  }

  // 2. Check next/navigation useParams()
  if (routeParams?.id) {
    const id = Array.isArray(routeParams.id) ? routeParams.id[0] : routeParams.id;
    if (id && !NON_ID_SEGMENTS.has(id.toLowerCase())) return id;
  }

  // 3. Fallback to passed static params if available
  if (staticParams) {
    try {
      if (typeof (staticParams as any).then === 'function') {
        const resolved = use(staticParams as Promise<{ id?: string }>);
        if (resolved?.id && !NON_ID_SEGMENTS.has(resolved.id.toLowerCase())) return resolved.id;
      } else if ((staticParams as any).id) {
        const id = (staticParams as any).id;
        if (id && !NON_ID_SEGMENTS.has(String(id).toLowerCase())) return String(id);
      }
    } catch {
      // ignore
    }
  }

  return '';
}

export function useDynamicSlug(staticParams?: Promise<{ slug?: string; category?: string }> | { slug?: string; category?: string }): { slug: string; category: string } {
  const routeParams = useParams();
  let slug = '';
  let category = '';

  // 1. Extract from window.location.pathname
  if (typeof window !== 'undefined') {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const applyIndex = pathSegments.indexOf('apply');
    if (applyIndex > 0) {
      slug = decodeURIComponent(pathSegments[applyIndex - 1] || '');
    } else if (pathSegments.length >= 2 && (
      pathSegments[0] === 'products' ||
      pathSegments[0] === 'principals' ||
      pathSegments[0] === 'career' ||
      pathSegments[0] === 'industries' ||
      pathSegments[0] === 'articles'
    )) {
      if (pathSegments[0] === 'products') {
        category = decodeURIComponent(pathSegments[1] || '');
        if (pathSegments.length >= 3) {
          slug = decodeURIComponent(pathSegments[2] || '');
        }
      } else {
        slug = decodeURIComponent(pathSegments[1] || '');
      }
    }
  }

  // 2. Check useParams
  if (!slug && routeParams?.slug) {
    const s = Array.isArray(routeParams.slug) ? routeParams.slug[0] : routeParams.slug;
    if (s && !NON_ID_SEGMENTS.has(s.toLowerCase())) slug = s;
  }
  if (!category && routeParams?.category) {
    category = Array.isArray(routeParams.category) ? routeParams.category[0] : routeParams.category;
  }

  // 3. Fallback to passed static params
  if ((!slug || !category) && staticParams) {
    try {
      if (typeof (staticParams as any).then === 'function') {
        const resolved = use(staticParams as Promise<{ slug?: string; category?: string }>);
        if (!slug && resolved?.slug && !NON_ID_SEGMENTS.has(resolved.slug.toLowerCase())) slug = resolved.slug;
        if (!category && resolved?.category) category = resolved.category;
      } else {
        if (!slug && (staticParams as any).slug && !NON_ID_SEGMENTS.has(String((staticParams as any).slug).toLowerCase())) slug = (staticParams as any).slug;
        if (!category && (staticParams as any).category) category = (staticParams as any).category;
      }
    } catch {
      // ignore
    }
  }

  return { slug, category };
}
