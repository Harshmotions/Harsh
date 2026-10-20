// The portfolio's videos. content/work.json is written by scripts/publish-work.mjs, which
// encodes everything in the export folder and uploads it to the Cloudflare R2 bucket served
// at MEDIA_BASE. Plain MP4 (no streaming player): one request starts playback.
import data from '@/content/work.json';

export const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE ?? 'https://media.motionbyharsh.com';

export interface WorkItem {
  slug: string;
  title: string;
  /** Optional one-liner (from a same-named .txt next to the export). */
  note?: string;
  /** The original frame size: the full-size player keeps this shape. */
  width: number;
  height: number;
  /** Seconds. */
  duration: number;
  /** Paths inside the bucket. */
  poster: string;
  /** Up to 1080p, high bitrate: desktop full-size player. */
  hd: string;
  /** Up to 720p, light: card previews everywhere, and the full-size player on phones. */
  sd: string;
  /** Square stills from across the video, for the hero's cursor trail. */
  trail?: string[];
}

/** A home page showreel: silent, leading black trimmed, poster = its first frame. */
export type Showreel = Pick<WorkItem, 'width' | 'height' | 'duration' | 'poster' | 'hd' | 'sd'>;

const manifest = data as { items: WorkItem[]; hero?: { desktop?: Showreel; mobile?: Showreel } };

export const work: WorkItem[] = manifest.items;
export const showreel = manifest.hero ?? {};

export const mediaUrl = (path: string) => `${MEDIA_BASE}/${path}`;

/** The poster through the site's image optimizer: right-sized, and same-origin for WebGL. */
export const posterUrl = (item: WorkItem, width = 828) =>
  `/_next/image?url=${encodeURIComponent(mediaUrl(item.poster))}&w=${width}&q=75`;

export const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.round(s % 60)).padStart(2, '0')}`;
};

/** "16:9", "9:16", "4:5", "1:1"… from the frame size, snapped to common shapes. */
export const ratioLabel = (w: number, h: number) => {
  const r = w / h;
  const common: [number, string][] = [
    [16 / 9, '16:9'], [9 / 16, '9:16'], [4 / 3, '4:3'], [3 / 4, '3:4'], [4 / 5, '4:5'], [5 / 4, '5:4'], [1, '1:1'], [21 / 9, '21:9'], [2.39, '2.39:1'],
  ];
  const best = common.reduce((a, b) => (Math.abs(b[0] - r) < Math.abs(a[0] - r) ? b : a));
  return Math.abs(best[0] - r) / r < 0.04 ? best[1] : `${w}×${h}`;
};
