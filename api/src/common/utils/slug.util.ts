/**
 * Derive a URL-safe slug from a string or category URL path.
 * e.g. "Mobile Phones" → "mobile-phones"
 * e.g. "https://www.daraz.com.bd/mobile-phones/" → "mobile-phones"
 */
export function slugify(input: string): string {
  let text = input.trim();

  try {
    const parsed = new URL(text);
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      text = segments[segments.length - 1];
    }
  } catch {
    // not a URL — treat as plain text
  }

  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'category';
}

/** Human-readable name from a slug: "mobile-phones" → "Mobile Phones" */
export function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
