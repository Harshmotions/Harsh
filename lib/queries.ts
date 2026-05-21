import { groq } from 'next-sanity';

/**
 * Shared projection for Project documents. Resolves the Mux asset and
 * inlines a small client summary (with a flat logoUrl for easy <Image>).
 */
const projectProjection = groq`
  _id,
  title,
  slug,
  type,
  category,
  thumbnail{
    ...,
    alt,
    asset->
  },
  muxVideo{
    asset->{
      _id,
      playbackId,
      assetId,
      status
    }
  },
  client->{
    _id,
    name,
    "logoUrl": logo.asset->url,
    isPublic
  },
  roleTag,
  strategicNote,
  isRetainer,
  isFeatured,
  order,
  publishedAt
`;

/** Featured projects for the home page strip. */
export const FEATURED_PROJECTS_QUERY = groq`
  *[_type == "project" && isFeatured == true]
    | order(order asc, publishedAt desc) {
    ${projectProjection}
  }
`;

/** All reels — used by /reels grid. */
export const REELS_QUERY = groq`
  *[_type == "project" && type == "reel"]
    | order(order asc, publishedAt desc) {
    ${projectProjection}
  }
`;

/** All landscape projects — used by /landscape grid. */
export const LANDSCAPE_QUERY = groq`
  *[_type == "project" && type == "landscape"]
    | order(order asc, publishedAt desc) {
    ${projectProjection}
  }
`;

/** Site Settings singleton — fetched on every page. */
export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    heroHeadline,
    heroSubline,
    aboutBody,
    toolsList,
    approachSteps[]{ title, description },
    contactHeadline,
    whatsappNumber,
    emailAddress,
    instagramUrl,
    linkedinUrl
  }
`;

/** Public client logos for the About section row. */
export const CLIENTS_QUERY = groq`
  *[_type == "client" && isPublic == true]
    | order(name asc) {
    _id,
    name,
    "logoUrl": logo.asset->url,
    isPublic
  }
`;
