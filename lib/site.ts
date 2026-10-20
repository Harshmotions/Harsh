// Site text and contact details. Edit content/site.json to change any of it.
import data from '@/content/site.json';

export const CONTACT_EMAIL = 'hello@motionbyharsh.com';

export interface ApproachStep {
  title: string;
  description: string;
}

export const site: {
  heroHeadline: string;
  heroSubline: string;
  /** About section paragraphs, in order. */
  about: string[];
  approachSteps: ApproachStep[];
  contactHeadline: string;
  /** International format, digits only (used for wa.me links). */
  whatsappNumber: string;
  instagramUrl: string;
  /** Optional portrait next to the About text: a path in /public, e.g. "/portrait.jpg". */
  portrait?: string;
} = data;
