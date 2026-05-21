import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'client',
  type: 'document',
  title: 'Client',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      type: 'image',
      description: 'SVG preferred',
    }),
    defineField({
      name: 'isPublic',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to use placeholder',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
    },
  },
});
