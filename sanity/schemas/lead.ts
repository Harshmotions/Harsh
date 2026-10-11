import { defineField, defineType } from 'sanity';

// Project briefs submitted through the site's contact form. Written by the
// sendBrief server action; read-only in Studio so briefs stay as received.
export default defineType({
  name: 'lead',
  type: 'document',
  title: 'Lead',
  readOnly: true,
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'email', type: 'string' }),
    defineField({ name: 'whatsapp', type: 'string' }),
    defineField({ name: 'company', type: 'string', title: 'Brand or website' }),
    defineField({ name: 'services', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'format', type: 'string' }),
    defineField({ name: 'videoCount', type: 'string', title: 'Number of videos' }),
    defineField({ name: 'footage', type: 'string' }),
    defineField({ name: 'budget', type: 'string', title: 'Budget per video' }),
    defineField({ name: 'projectBudget', type: 'string', title: 'Total project budget' }),
    defineField({ name: 'timeline', type: 'string' }),
    defineField({ name: 'details', type: 'text', rows: 6, title: 'Project details' }),
    defineField({ name: 'submittedAt', type: 'datetime' }),
  ],
  orderings: [
    { title: 'Newest first', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { name: 'name', company: 'company', budget: 'budget', date: 'submittedAt' },
    prepare: ({ name, company, budget, date }) => ({
      title: [name, company].filter(Boolean).join(' · '),
      subtitle: [budget, date && new Date(date).toLocaleDateString()].filter(Boolean).join(' · '),
    }),
  },
});
