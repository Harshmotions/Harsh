// Shared by the project brief form (UI) and its server action (validation + email labels).

export const SERVICES = [
  'Short-form ads & reels',
  'Motion graphics (SaaS / product)',
  'YouTube & long-form editing',
  'Brand video',
  'Something else',
] as const;

export const FORMATS = ['Vertical 9:16', 'Landscape 16:9', 'Both'] as const;

export const VIDEO_COUNTS = ['1 video', '2–5 videos', '6–10 videos', '10+ videos', 'Ongoing monthly'] as const;

export const FOOTAGE = ['I have footage', 'No footage, motion graphics only', 'Not sure yet'] as const;

export const BIG_PROJECT = "Bigger project, let's scope it";

export const BUDGETS_PER_VIDEO = [
  '$100–250',
  '$250–500',
  '$500–1,000',
  '$1,000–2,500',
  '$2,500+',
  BIG_PROJECT,
] as const;

export const PROJECT_BUDGETS = [
  '$2,500–5,000',
  '$5,000–10,000',
  '$10,000–25,000',
  '$25,000+',
  'Not sure yet',
] as const;

export const TIMELINES = ['ASAP (under a week)', '1–2 weeks', '2–4 weeks', 'Flexible'] as const;
