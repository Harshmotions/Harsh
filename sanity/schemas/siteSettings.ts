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
      name: 'toolsList',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
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
    defineField({ name: 'emailAddress', type: 'string' }),
    defineField({ name: 'instagramUrl', type: 'url' }),
    defineField({ name: 'linkedinUrl', type: 'url' }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
