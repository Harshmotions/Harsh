'use server';

import { createClient } from 'next-sanity';
import { projectId, dataset, apiVersion } from '@/lib/sanity';
import { CONTACT_EMAIL } from '@/lib/site';
import {
  SERVICES,
  FORMATS,
  VIDEO_COUNTS,
  FOOTAGE,
  BUDGETS_PER_VIDEO,
  BIG_PROJECT,
  PROJECT_BUDGETS,
  TIMELINES,
} from '@/lib/briefOptions';

export type BriefResult = { ok: true } | { ok: false; error: string };

type Brief = {
  name: string;
  email: string;
  whatsapp: string;
  company: string;
  services: string[];
  format: string;
  videoCount: string;
  footage: string;
  budget: string;
  projectBudget: string;
  timeline: string;
  details: string;
};

const DELIVERY_ERROR =
  'Something went wrong sending your brief. Please message me on WhatsApp or email instead.';

function text(fd: FormData, key: string, max: number) {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

// Only accept values the form actually offers — this endpoint is public.
function choice(fd: FormData, key: string, options: readonly string[]) {
  const v = text(fd, key, 200);
  return options.includes(v) ? v : '';
}

export async function sendBrief(formData: FormData): Promise<BriefResult> {
  // Honeypot: hidden from people, so anything in it came from a bot. Pretend success.
  if (text(formData, 'fax', 200)) return { ok: true };

  const budget = choice(formData, 'budget', BUDGETS_PER_VIDEO);
  const brief: Brief = {
    name: text(formData, 'name', 120),
    email: text(formData, 'email', 200),
    whatsapp: text(formData, 'whatsapp', 40),
    company: text(formData, 'company', 200),
    services: formData
      .getAll('services')
      .filter((s): s is string => typeof s === 'string' && (SERVICES as readonly string[]).includes(s)),
    format: choice(formData, 'format', FORMATS),
    videoCount: choice(formData, 'videoCount', VIDEO_COUNTS),
    footage: choice(formData, 'footage', FOOTAGE),
    budget,
    projectBudget: budget === BIG_PROJECT ? choice(formData, 'projectBudget', PROJECT_BUDGETS) : '',
    timeline: choice(formData, 'timeline', TIMELINES),
    details: text(formData, 'details', 5000),
  };

  if (
    !brief.name ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.email) ||
    brief.services.length === 0 ||
    !brief.budget ||
    !brief.details
  ) {
    return {
      ok: false,
      error: 'Please add your name, a valid email, what you need, your budget and a few project details.',
    };
  }

  const resendKey = process.env.RESEND_API_KEY;
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!resendKey && !writeToken) {
    console.error('[sendBrief] Neither RESEND_API_KEY nor SANITY_API_WRITE_TOKEN is set');
    return { ok: false, error: DELIVERY_ERROR };
  }

  const results = await Promise.allSettled([
    resendKey ? emailBrief(brief, resendKey) : Promise.reject(new Error('email not configured')),
    writeToken ? saveLead(brief, writeToken) : Promise.reject(new Error('lead storage not configured')),
  ]);
  results.forEach((r) => {
    if (r.status === 'rejected') console.error('[sendBrief]', r.reason);
  });

  // One working channel is enough — the brief isn't lost.
  return results.some((r) => r.status === 'fulfilled') ? { ok: true } : { ok: false, error: DELIVERY_ERROR };
}

async function emailBrief(brief: Brief, apiKey: string) {
  const to = process.env.BRIEF_TO_EMAIL || CONTACT_EMAIL;

  const budgetLine =
    brief.budget === BIG_PROJECT
      ? `${brief.budget}${brief.projectBudget ? `, total ${brief.projectBudget}` : ''}`
      : `${brief.budget} per video`;

  const field = (label: string, value: string) => (value ? `${label}: ${value}` : '');
  const block = (...rows: string[]) => rows.filter(Boolean).join('\n');
  const body = [
    `${brief.name} sent a project brief through motionbyharsh.com. Reply to this email to answer them directly.`,
    block(
      field('Name', brief.name),
      field('Email', brief.email),
      field('WhatsApp', brief.whatsapp),
      field('Brand', brief.company),
    ),
    block(
      field('Needs', brief.services.join(', ')),
      field('Format', brief.format),
      field('Videos', brief.videoCount),
      field('Footage', brief.footage),
      field('Budget', budgetLine),
      field('Timeline', brief.timeline),
    ),
    `Details:\n${brief.details}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.BRIEF_FROM_EMAIL || 'motion by harsh <onboarding@resend.dev>',
      to: [to],
      reply_to: brief.email,
      // Plain, personal subject: prices and symbols in a subject push Gmail towards Promotions
      subject: `Project brief from ${brief.name}${brief.company ? ` at ${brief.company}` : ''}`,
      text: body,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function saveLead(brief: Brief, token: string) {
  const writeClient = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
  await writeClient.create({ _type: 'lead', ...brief, submittedAt: new Date().toISOString() });
}
