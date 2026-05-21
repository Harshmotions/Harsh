import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { muxInput } from 'sanity-plugin-mux-input';
import { schemaTypes } from './schemas';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

export default defineConfig({
  name: 'harsh-portfolio',
  title: 'Harsh Powar — Portfolio CMS',
  basePath: '/studio',
  projectId,
  dataset,
  apiVersion,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Singleton: Site Settings
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings'),
              ),
            S.divider(),
            // Document types (excluding singletons)
            S.documentTypeListItem('project').title('Projects'),
            S.documentTypeListItem('client').title('Clients'),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
    muxInput(),
  ],
});
