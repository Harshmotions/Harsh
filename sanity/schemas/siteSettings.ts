import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  type: 'document',
  title: 'Site Settings',
  fields: [
    defineField({ name: 'heroHeadline', type: 'string' }),
    defineField({ name: 'heroSubline', type: 'text', rows: 2 }),
    defineField({
      name: 'aboutBody',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'portrait',
      type: 'image',
      title: 'Portrait (About section)',
      description: 'A photo of you, shown next to the About text. Portrait orientation works best.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'toolsList',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      hidden: true,
    }),
    defineField({
      name: 'approachSteps',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'approachStep',
          fields: [
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'description', type: 'text' }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        },
      ],
    }),
    defineField({ name: 'contactHeadline', type: 'string' }),
    defineField({
      name: 'whatsappNumber',
      type: 'string',
      description: 'Format: 91XXXXXXXXXX (no + or spaces)',
    }),
    // The site's contact email lives in lib/site.ts; this old field is kept only so existing data doesn't warn.
    defineField({ name: 'emailAddress', type: 'string', hidden: true }),
    defineField({ name: 'instagramUrl', type: 'url' }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
