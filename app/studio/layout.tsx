import { NextStudioLayout, metadata, viewport } from 'next-sanity/studio';

export { metadata, viewport };

export default function StudioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <NextStudioLayout>{children}</NextStudioLayout>;
}
