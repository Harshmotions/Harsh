import { createClient } from 'next-sanity';
import imageUrlBuilder, { type SanityImageSource } from '@sanity/image-url';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

if (!projectId) {
  throw new Error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID — check .env.local',
  );
}

const isDev = process.env.NODE_ENV !== 'production';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // CDN in prod for speed; live API in dev so Studio edits show immediately.
  useCdn: !isDev,
  perspective: 'published',
});

const builder = imageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Typed Sanity fetch helper for server components.
 * In dev: revalidate: 0 (no cache) so Studio edits show immediately.
 * In prod: revalidate: 60s for fast page loads. Override per-call when needed.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = isDev ? 0 : 60,
  tags,
}: {
  query: string;
  params?: Record<string, unknown>;
  revalidate?: number | false;
  tags?: string[];
}): Promise<T> {
  return sanityClient.fetch<T>(query, params, {
    next: {
      revalidate: revalidate === false ? undefined : revalidate,
      tags,
    },
  });
}
