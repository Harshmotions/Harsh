import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function Icon() {
  const imgData = await readFile(join(process.cwd(), 'public', 'logo-favicon.png'));
  const src = `data:image/png;base64,${imgData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={180} height={180} style={{ objectFit: 'cover' }} />
      </div>
    ),
    { width: 180, height: 180 },
  );
}
