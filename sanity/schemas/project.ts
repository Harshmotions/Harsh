import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'project',
  type: 'document',
  title: 'Project',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
    }),
    defineField({
      name: 'type',
      type: 'string',
      options: {
        list: [
          { title: 'Reel (9:16)', value: 'reel' },
          { title: 'Landscape (16:9)', value: 'landscape' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          // reels
          { title: 'Performance Ads', value: 'performance-ads' },
          { title: 'UGC (AI Gen)', value: 'ugc' },
          { title: 'Motion Graphics', value: 'motion-graphics' },
          { title: 'Brand', value: 'brand' },
          { title: 'AI Ad', value: 'ai-ad' },
          // landscape
          { title: 'YouTube', value: 'youtube' },
          { title: 'Brand Films', value: 'brand-films' },
          { title: 'Documentary', value: 'documentary' },
        ],
      },
    }),
    defineField({
      name: 'thumbnail',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'muxVideo',
      type: 'mux.video',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'client',
      type: 'reference',
      to: [{ type: 'client' }],
    }),
    defineField({
      name: 'roleTag',
      type: 'string',
      description: 'e.g. Performance Ad, Brand Film',
    }),
    defineField({
      name: 'strategicNote',
      type: 'text',
      rows: 3,
      description: 'Why this edit works',
    }),
    defineField({
      name: 'isRetainer',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      type: 'number',
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'roleTag',
      media: 'thumbnail',
    },
  },
});
