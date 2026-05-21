import type { PortableTextBlock } from '@portabletext/types';

/** A Sanity image with hotspot/crop and required alt text on Project thumbnails. */
export interface SanityImage {
  _type: 'image';
  asset: {
    _ref?: string;
    _id?: string;
    url?: string;
  };
  alt?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

/** Resolved Mux asset reference (after `asset->` dereference in GROQ). */
export interface MuxAsset {
  _id: string;
  /** Public playback ID — what `<MuxPlayer>` consumes via `playback-id` prop. */
  playbackId?: string;
  /** Internal Mux asset ID. */
  assetId?: string;
  /** 'preparing' | 'ready' | 'errored'. */
  status?: string;
}

export interface MuxVideo {
  asset?: MuxAsset;
}

export type ProjectType = 'reel' | 'landscape';

export type ProjectCategory =
  // reels
  | 'performance-ads'
  | 'ugc'
  | 'motion-graphics'
  | 'brand'
  // landscape
  | 'youtube'
  | 'brand-films'
  | 'documentary';

export interface ClientRef {
  _id: string;
  name: string;
  /** Pre-resolved logo URL (via `"logoUrl": logo.asset->url` projection). */
  logoUrl?: string;
  isPublic: boolean;
}

export interface Project {
  _id: string;
  title: string;
  slug?: { current: string };
  type: ProjectType;
  category?: ProjectCategory;
  thumbnail: SanityImage;
  muxVideo: MuxVideo;
  client?: ClientRef;
  roleTag?: string;
  strategicNote?: string;
  isRetainer: boolean;
  isFeatured: boolean;
  order?: number;
  publishedAt: string;
}

export interface ApproachStep {
  title: string;
  description: string;
}

export interface SiteSettings {
  heroHeadline?: string;
  heroSubline?: string;
  aboutBody?: PortableTextBlock[];
  toolsList?: string[];
  approachSteps?: ApproachStep[];
  contactHeadline?: string;
  whatsappNumber?: string;
  emailAddress?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}
