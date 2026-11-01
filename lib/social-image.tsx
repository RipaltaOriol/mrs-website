import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { SITE_NAME } from './site'

/** The size every social preview image is rendered at. */
export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 }

/** A social preview card in the site's design: the mark on brand red, `title` set in Newsreader. */
export async function socialImage({ title, kicker }: { title: string; kicker: string }) {
  const [newsreader, inter, logo] = await Promise.all([
    readFile(join(process.cwd(), 'assets/fonts/Newsreader-Medium.ttf')),
    readFile(join(process.cwd(), 'assets/fonts/Inter-Medium.ttf')),
    readFile(join(process.cwd(), 'public/logo.png')),
  ])
  const titleSize = title.length > 70 ? 56 : title.length > 40 ? 68 : 80

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#f7f3f0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 360,
            height: '100%',
            background: '#99032e',
          }}
        >
          <img src={`data:image/png;base64,${logo.toString('base64')}`} width={240} height={236} alt="" />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            padding: '72px 72px 64px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontFamily: 'Inter',
              fontSize: 24,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#6d615c',
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Newsreader',
              fontSize: titleSize,
              lineHeight: 1.1,
              color: '#2a2321',
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Inter', fontSize: 24, color: '#99032e' }}>
            <div style={{ width: 48, height: 3, background: '#d59c98', marginRight: 20 }} />
            mrsassessors.com
          </div>
        </div>
      </div>
    ),
    {
      ...SOCIAL_IMAGE_SIZE,
      fonts: [
        { name: 'Newsreader', data: newsreader, weight: 500, style: 'normal' },
        { name: 'Inter', data: inter, weight: 500, style: 'normal' },
      ],
    },
  )
}

/** The alt text and dimensions an `opengraph-image` route exports. */
export const SOCIAL_IMAGE = { alt: SITE_NAME, size: SOCIAL_IMAGE_SIZE, contentType: 'image/png' } as const
