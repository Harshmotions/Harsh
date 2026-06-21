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

const NOT_SHOWREEL = groq`!(category in ["showreel-desktop", "showreel-mobile"])`;

/** Featured projects for the home page strip. Excludes the hero-only showreel. */
export const FEATURED_PROJECTS_QUERY = groq`
  *[_type == "project" && isFeatured == true && ${NOT_SHOWREEL}]
    | order(order asc, publishedAt desc) {
    ${projectProjection}
  }
`;

/** All reels — used by /reels grid. Excludes the hero-only showreel. */
export const REELS_QUERY = groq`
  *[_type == "project" && type == "reel" && ${NOT_SHOWREEL}]
    | order(order asc, publishedAt desc) {
    ${projectProjection}
  }
`;

/** All landscape projects — used by /landscape grid. Excludes the hero-only showreel. */
export const LANDSCAPE_QUERY = groq`
  *[_type == "project" && type == "landscape" && ${NOT_SHOWREEL}]
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

/** Hero showcase video for desktop — the project tagged "Showreel — Desktop" in Studio. */
export const HERO_VIDEO_DESKTOP_QUERY = groq`
  *[_type == "project" && category == "showreel-desktop"]
    | order(order asc, publishedAt desc) [0]{
    _id,
    title,
    muxVideo{
      asset->{
        playbackId,
        status
      }
    }
  }
`;

/** Hero showcase video for mobile — the project tagged "Showreel — Mobile" in Studio. */
export const HERO_VIDEO_MOBILE_QUERY = groq`
  *[_type == "project" && category == "showreel-mobile"]
    | order(order asc, publishedAt desc) [0]{
    _id,
    title,
    muxVideo{
      asset->{
        playbackId,
        status
      }
    }
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
