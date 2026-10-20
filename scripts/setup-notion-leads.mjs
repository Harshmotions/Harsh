// Creates the Notion "Leads" database the brief form writes to (app/actions/sendBrief.ts).
//
//   node scripts/setup-notion-leads.mjs            create the database, save its ID
//   node scripts/setup-notion-leads.mjs --test     add a sample lead to check it works
//
// Needs in .env.local:
//   NOTION_TOKEN=          the integration's secret (notion.so/profile/integrations)
//   NOTION_PARENT_PAGE=    link to the Notion page to create the database in (the page
//                          must be shared with the integration: ••• → Connections)
// Writes NOTION_LEADS_DB to .env.local. Put NOTION_TOKEN and NOTION_LEADS_DB on Vercel too.

import { appendFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ENV = join(ROOT, '.env.local');
const env = Object.fromEntries(
  readFileSync(ENV, 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^NOTION_[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);

const notion = async (path, body, method = 'POST') => {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${json.code}: ${json.message}`);
  return json;
};

// "https://www.notion.so/My-page-1a2b…" or a bare ID → the 32-character ID
const pageId = (link) => {
  const m = /([0-9a-f]{32})(?:[?#].*)?$/i.exec(link.replace(/-/g, ''));
  if (!m) throw new Error('NOTION_PARENT_PAGE must be a Notion page link or ID');
  return m[1];
};

const create = async () => {
  if (!env.NOTION_TOKEN || !env.NOTION_PARENT_PAGE) throw new Error('Add NOTION_TOKEN and NOTION_PARENT_PAGE to .env.local first');
  if (env.NOTION_LEADS_DB) throw new Error(`NOTION_LEADS_DB is already set (${env.NOTION_LEADS_DB}); remove it to create a new database`);
  const sel = (...names) => ({ select: { options: names.map(([name, color]) => ({ name, color })) } });
  const db = await notion('databases', {
    parent: { type: 'page_id', page_id: pageId(env.NOTION_PARENT_PAGE) },
    icon: { type: 'emoji', emoji: '📥' },
    title: [{ type: 'text', text: { content: 'Leads' } }],
    properties: {
      Name: { title: {} },
      Status: sel(['New', 'blue'], ['Replied', 'yellow'], ['Call booked', 'purple'], ['Won', 'green'], ['Lost', 'gray']),
      Submitted: { date: {} },
      Email: { email: {} },
      WhatsApp: { phone_number: {} },
      Brand: { rich_text: {} },
      Needs: { multi_select: {} },
      Format: { select: {} },
      Videos: { select: {} },
      Footage: { select: {} },
      Budget: { select: {} },
      Timeline: { select: {} },
      Details: { rich_text: {} },
    },
  });
  appendFileSync(ENV, `${readFileSync(ENV, 'utf8').endsWith('\n') ? '' : '\n'}NOTION_LEADS_DB=${db.id}\n`);
  console.log(`Created "Leads": ${db.url}\nSaved NOTION_LEADS_DB=${db.id} to .env.local`);
};

const test = async () => {
  if (!env.NOTION_TOKEN || !env.NOTION_LEADS_DB) throw new Error('Run without --test first');
  const page = await notion('pages', {
    parent: { database_id: env.NOTION_LEADS_DB },
    properties: {
      Name: { title: [{ text: { content: 'Test lead (safe to delete)' } }] },
      Status: { select: { name: 'New' } },
      Email: { email: 'test@example.com' },
      Brand: { rich_text: [{ text: { content: 'Setup check' } }] },
      Needs: { multi_select: [{ name: 'Motion graphics (SaaS / product)' }] },
      Videos: { select: { name: '2–5 videos' } },
      Budget: { select: { name: '$500–1 000' } },
      Details: { rich_text: [{ text: { content: 'Added by scripts/setup-notion-leads.mjs --test' } }] },
      Submitted: { date: { start: new Date().toISOString() } },
    },
  });
  console.log(`Test lead added: ${page.url}`);
};

(process.argv.includes('--test') ? test() : create()).catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
